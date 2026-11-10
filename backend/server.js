import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// ==========================================
// 0. CONFIG
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Never ship a guessable fallback secret to production.
const JWT_SECRET = process.env.JWT_SECRET || (dev ? 'dev-only-secret-change-me' : '');
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}

// Comma-separated list, e.g. CORS_ORIGIN=https://myapp.com,https://www.myapp.com
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
const corsOrigin = ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : dev;

const nextApp = next({ dev, hostname, port, dir: path.join(__dirname, '../frontend/my-app') });
const nextHandler = nextApp.getRequestHandler();

// Express app + HTTP server must exist before routes and Socket.IO use them.
const expressApp = express();
const server = createServer(expressApp);
expressApp.set('trust proxy', 1); // correct req.ip behind Render/Nginx

// ==========================================
// 1. UPLOADS (images only, size-limited, random names)
// ==========================================
const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const IMAGE_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${IMAGE_EXT[file.mimetype]}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) =>
    IMAGE_EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG or WebP images are allowed'))
});

// ==========================================
// 2. MODELS
// ==========================================
import { User, Property, Lease, MaintenanceTicket, AdminLog, SystemConfig } from './lib/db.js';

// ==========================================
// 3. HELPERS & MIDDLEWARE
// ==========================================
const ROLES = ['tenant', 'landlord', 'admin'];
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const serverError = (res, label, err) => {
  console.error(label, err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};

// Small in-memory rate limiter (use Redis / express-rate-limit if you scale to many instances).
const rateLimit = ({ windowMs, max }) => {
  const hits = new Map();
  setInterval(() => hits.clear(), windowMs).unref();
  return (req, res, nextFn) => {
    const n = (hits.get(req.ip) || 0) + 1;
    hits.set(req.ip, n);
    if (n > max) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    nextFn();
  };
};
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const authenticateToken = (req, res, nextFn) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = decoded;
    nextFn();
  });
};

// Always re-checks the database, so role changes and disabled accounts apply immediately.
const requireRole = (roles) => async (req, res, nextFn) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    req.dbUser = user;
    nextFn();
  } catch (error) {
    serverError(res, 'Role check failed:', error);
  }
};

const requireAnyUser = requireRole(ROLES);
const requireAdmin = requireRole(['admin']);
const requireLandlordOrAdmin = requireRole(['landlord', 'admin']);

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

// ==========================================
// 4. START
// ==========================================
nextApp.prepare().then(async () => {
  if (!MONGODB_URI) {
    console.error('❌ FATAL: MONGODB_URI is not defined.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    tls: true
  });
  console.log('🍃 MongoDB connected');

  await SystemConfig.findOneAndUpdate(
    { key: 'platform_fee_percentage' },
    { $setOnInsert: { key: 'platform_fee_percentage', value: 5 } },
    { upsert: true }
  );
  await SystemConfig.findOneAndUpdate(
    { key: 'maintenance_mode' },
    { $setOnInsert: { key: 'maintenance_mode', value: false } },
    { upsert: true }
  );

  expressApp.disable('x-powered-by');
  expressApp.use(cors({ origin: corsOrigin }));

  // Security headers (swap for `helmet` if you can add the dependency)
  expressApp.use((req, res, nextFn) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    nextFn();
  });

  // NextAuth (/api/auth/*) parses its own body.
  const jsonParser = express.json({ limit: '100kb' });
  const urlParser = express.urlencoded({ extended: true, limit: '100kb' });
  expressApp.use((req, res, nextFn) => {
    if (req.path.startsWith('/api/auth/')) return nextFn();
    jsonParser(req, res, (err) => (err ? nextFn(err) : urlParser(req, res, nextFn)));
  });

  expressApp.use('/uploads', express.static(uploadDir));

  const io = new SocketIOServer(server, { cors: { origin: corsOrigin, methods: ['GET', 'POST'] } });

  io.on('connection', (socket) => {
    socket.on('joinSystemChannel', (token) => {
      jwt.verify(String(token), JWT_SECRET, async (err, decoded) => {
        if (err) return;
        try {
          // Trust the database, not the role baked into the token.
          const user = await User.findById(decoded.id);
          if (!user || !user.isActive) return;
          if (user.role === 'admin') socket.join('admin-dashboard-room');
          socket.join(`user-room-${user.id}`);
        } catch (e) {
          console.error('Socket join failed:', e);
        }
      });
    });
  });

  // ---------- AUTH ----------
  expressApp.post('/api/user/signup', authLimiter, async (req, res) => {
    try {
      const phoneNumber = str(req.body.phoneNumber);
      const fullName = str(req.body.fullName);
      const password = typeof req.body.password === 'string' ? req.body.password : '';

      if (!phoneNumber || !fullName || !password) return res.status(400).json({ error: 'Phone number, full name and password are required' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

      if (await User.findOne({ phoneNumber })) {
        return res.status(409).json({ error: 'An account with this phone number already exists' });
      }

      // Self-service roles are limited to tenant/landlord; admins are created manually.
      const role = req.body.role === 'landlord' ? 'landlord' : 'tenant';
      const user = await User.create({ phoneNumber, fullName, role, password: await bcrypt.hash(password, 12) });

      res.status(201).json({ token: signToken(user), user: { id: user.id, fullName: user.fullName, role: user.role } });
    } catch (err) {
      serverError(res, 'Signup error:', err);
    }
  });

  expressApp.post('/api/user/login', authLimiter, async (req, res) => {
    try {
      const phoneNumber = str(req.body.phoneNumber);
      const password = typeof req.body.password === 'string' ? req.body.password : '';

      const user = phoneNumber && password ? await User.findOne({ phoneNumber }) : null;
      const ok = user && user.isActive && (await bcrypt.compare(password, user.password));
      if (!ok) return res.status(401).json({ error: 'Invalid phone number or password' });

      res.json({ token: signToken(user), user: { id: user.id, fullName: user.fullName, role: user.role, phoneNumber: user.phoneNumber } });
    } catch (err) {
      serverError(res, 'Login error:', err);
    }
  });

  // ---------- PUBLIC MARKETPLACE ----------
  expressApp.get('/api/properties/marketplace', async (req, res) => {
    try {
      const where = { status: 'approved' };
      const propertyType = str(req.query.propertyType);
      const county = str(req.query.county);
      const search = str(req.query.search).slice(0, 80);

      if (propertyType) where.propertyType = propertyType;
      if (county) where.county = county;
      if (search) {
        const rx = { $regex: escapeRegex(search), $options: 'i' };
        where.$or = [{ title: rx }, { city: rx }, { address: rx }];
      }

      const properties = await Property.find(where).populate({ path: 'Units', match: { isOccupied: false } });
      res.json(properties);
    } catch (err) {
      serverError(res, 'Marketplace error:', err);
    }
  });

  // ---------- LANDLORD ----------
  expressApp.post('/api/landlord/properties', authenticateToken, requireLandlordOrAdmin, async (req, res) => {
    try {
      // Strip fields a client must never control.
      const { _id, id, status, landlordId, createdAt, updatedAt, ...safeFields } = req.body;
      const newProperty = await Property.create({
        ...safeFields,
        landlordId: req.dbUser.id,
        status: req.dbUser.role === 'admin' ? 'approved' : 'pending_approval'
      });

      io.to('admin-dashboard-room').emit('newPropertyAlert', newProperty);
      res.status(201).json(newProperty);
    } catch (err) {
      serverError(res, 'Create property error:', err);
    }
  });

  // ---------- TENANT ----------
  expressApp.get('/api/tenant/my-leases', authenticateToken, requireAnyUser, async (req, res) => {
    try {
      const leases = await Lease.find({ tenantId: req.dbUser.id })
        .populate({ path: 'Unit', populate: { path: 'Property' } })
        .sort({ createdAt: -1 });
      res.json(leases);
    } catch (err) {
      serverError(res, 'Leases error:', err);
    }
  });

  expressApp.post('/api/tenant/maintenance', authenticateToken, requireAnyUser, upload.array('images', 3), async (req, res) => {
    try {
      const { propertyId, unitId, title, description, category, priority } = req.body;
      if (!str(title) || !str(description)) return res.status(400).json({ error: 'Title and description are required' });

      const ticket = await MaintenanceTicket.create({
        tenantId: req.dbUser.id,
        propertyId,
        unitId,
        title: str(title),
        description: str(description),
        category,
        priority,
        images: (req.files || []).map((f) => `/uploads/${f.filename}`),
        status: 'open'
      });

      io.to('admin-dashboard-room').emit('newMaintenanceTicket', ticket);
      res.status(201).json(ticket);
    } catch (err) {
      serverError(res, 'Maintenance error:', err);
    }
  });

  // ---------- ADMIN ----------
  expressApp.post('/api/admin/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  expressApp.put('/api/admin/properties/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const allowed = Property.schema.path('status')?.enumValues;
      const newStatus = str(req.body.status);
      if (!newStatus || (allowed?.length && !allowed.includes(newStatus))) {
        return res.status(400).json({ error: `Invalid status${allowed?.length ? `. Allowed: ${allowed.join(', ')}` : ''}` });
      }

      const property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ error: 'Property not found' });

      const oldStatus = property.status;
      property.status = newStatus;
      await property.save();

      await AdminLog.create({
        adminId: req.dbUser.id,
        action: 'UPDATE_PROPERTY_STATUS',
        targetType: 'property',
        targetId: property.id,
        changes: { oldStatus, newStatus },
        ipAddress: req.ip
      });

      io.to(`user-room-${property.landlordId}`).emit('propertyStatusUpdated', property);
      res.json(property);
    } catch (err) {
      serverError(res, 'Property status error:', err);
    }
  });

  expressApp.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.json(await User.find().select('-password'));
    } catch (err) {
      serverError(res, 'List users error:', err);
    }
  });

  expressApp.put('/api/admin/users/:id/modify', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { fullName, role, isActive } = req.body;
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ error: 'User not found' });

      if (role !== undefined && !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
      if (target.id === req.dbUser.id && (role !== undefined && role !== 'admin' || isActive === false)) {
        return res.status(400).json({ error: 'You cannot demote or disable your own admin account' });
      }

      if (fullName !== undefined) target.fullName = str(fullName);
      if (role !== undefined) target.role = role;
      if (isActive !== undefined) target.isActive = Boolean(isActive);
      await target.save();

      await AdminLog.create({
        adminId: req.dbUser.id,
        action: 'MODIFY_USER_CLEARANCE',
        targetType: 'user',
        targetId: target.id.toString(),
        changes: { fullName, role, isActive },
        ipAddress: req.ip
      });

      const { password, ...record } = target.toObject();
      res.json({ message: 'User updated', record });
    } catch (err) {
      serverError(res, 'Modify user error:', err);
    }
  });

  expressApp.get('/api/admin/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.json(await AdminLog.find().populate('Admin', 'fullName').sort({ createdAt: -1 }).limit(150));
    } catch (err) {
      serverError(res, 'Logs error:', err);
    }
  });

  // ---------- ERRORS (upload rejections, bad JSON) ----------
  expressApp.use('/api', (err, req, res, nextFn) => {
    if (err instanceof multer.MulterError || err?.message?.startsWith('Only JPG')) {
      return res.status(400).json({ error: err.message });
    }
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    console.error('Unhandled API error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });

  // ---------- NEXT.JS ----------
  expressApp.all(/.*/, (req, res) => nextHandler(req, res, parse(req.url, true)));

  server.listen(port, () => {
    console.log(`🏢 Property Management Engine live at http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('❌ Startup failure:', err);
  process.exit(1);
});
