import dns from 'dns';

// Force Node.js to use public DNS servers (Google and Cloudflare)
// This bypasses local/school network DNS restrictions that block MongoDB SRV lookups.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Checks for both MONGO_URI and MONGODB_URI from your .env file[cite: 3]
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_key_change_in_production';

// Middleware[cite: 3]
app.use(cors());
app.use(express.json());

/* ==========================================
   1. MONGOOSE SCHEMAS & MODELS
========================================== */

// Admin User Schema[cite: 3]
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', adminSchema);

// Profile & Landing Page Schema (profilePic alongside Hero Media, Name, Profession)[cite: 3]
const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Michael' },
  profession: { type: String, default: 'Full-Stack Software Developer' },
  about: { type: String, default: 'Passionate developer building dynamic web applications.' },
  profilePic: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80' 
  },
  heroMedia: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], required: true },
      order: { type: Number, default: 0 }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});
const Profile = mongoose.model('Profile', profileSchema);

// Skills Schema (Clickable divs with pictures and detailed info)[cite: 3]
const skillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Web Development' },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, default: 'Advanced' },
  order: { type: Number, default: 0 }
});
const Skill = mongoose.model('Skill', skillSchema);

// Projects Schema (Clickable cards redirecting to live project/repo)[cite: 3]
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  projectUrl: { type: String, required: true },
  repoUrl: { type: String },
  technologies: [{ type: String }],
  featured: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});
const Project = mongoose.model('Project', projectSchema);

// Education & Certifications Schema[cite: 3]
const educationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Education', 'Certification'], required: true },
  certificateUrl: { type: String }
});
const Education = mongoose.model('Education', educationSchema);

// Contact Messages Schema[cite: 3]
const messageSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);


/* ==========================================
   2. AUTHENTICATION MIDDLEWARE
========================================== */

const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};


/* ==========================================
   3. PUBLIC API ROUTES (For Frontend)
========================================== */

// Fetch EVERYTHING in one request for fast landing page rendering[cite: 3]
app.get('/api/portfolio', async (req, res) => {
  try {
    const profile = await Profile.findOne() || {};
    const skills = await Skill.find().sort({ order: 1 });
    const projects = await Project.find().sort({ order: 1 });
    const education = await Education.find({ type: 'Education' });
    const certifications = await Education.find({ type: 'Certification' });

    res.json({
      profile,
      skills,
      projects,
      education,
      certifications
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio data', details: err.message });
  }
});

// Submit Contact Form[cite: 3]
app.post('/api/contact', async (req, res) => {
  try {
    const { senderName, email, subject, message } = req.body;
    const newMessage = new Message({ senderName, email, subject, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message', details: err.message });
  }
});


/* ==========================================
   4. ADMIN AUTHENTICATION ROUTES
========================================== */

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});


/* ==========================================
   5. PROTECTED ADMIN CRUD ROUTES (Full Add, Edit, Delete)
========================================== */

// --- Profile & Landing Page Media Control ---[cite: 3]
app.get('/api/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    const profile = await Profile.findOne() || {};
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/profile', authenticateAdmin, async (req, res) => {
  try {
    const { name, profession, about, profilePic, heroMedia } = req.body;
    const updatedProfile = await Profile.findOneAndUpdate(
      {},
      { name, profession, about, profilePic, heroMedia, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(updatedProfile);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update profile', details: err.message });
  }
});

// --- Skills Control ---[cite: 3]
app.get('/api/admin/skills', authenticateAdmin, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json(skills);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/skills', authenticateAdmin, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/admin/skills/:id', authenticateAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/skills/:id', authenticateAdmin, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Projects Control ---[cite: 3]
app.get('/api/admin/projects', authenticateAdmin, async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/projects', authenticateAdmin, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Education & Certifications Control ---[cite: 3]
app.get('/api/admin/education', authenticateAdmin, async (req, res) => {
  try {
    const edu = await Education.find();
    res.json(edu);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/education', authenticateAdmin, async (req, res) => {
  try {
    const edu = new Education(req.body);
    await edu.save();
    res.status(201).json(edu);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/admin/education/:id', authenticateAdmin, async (req, res) => {
  try {
    const edu = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(edu);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/education/:id', authenticateAdmin, async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Contact Messages Control ---[cite: 3]
app.get('/api/admin/messages', authenticateAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(message);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});


/* ==========================================
   6. CLOUD-OPTIMIZED DATABASE CONNECTION & SEEDING
========================================== */

// Background connection listeners to prevent server crashes on network drops[cite: 3]
mongoose.connection.on('connected', () => {
  console.log('✅ Successfully connected to MongoDB Atlas Cloud!');
});

mongoose.connection.on('error', (err) => {
  console.warn('⚠️ MongoDB connection issue detected:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚡ MongoDB disconnected. Attempting to reconnect automatically in the background...');
});

const initializeDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    // Cloud-optimized connection parameters[cite: 3]
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of hanging indefinitely
      socketTimeoutMS: 45000,          // Close inactive sockets cleanly
      maxPoolSize: 10                  // Maintain stable cloud connection pool
    });

    // 1. Seed Default Admin if none exists[cite: 3]
    const adminExists = await Admin.findOne();
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('0746323229', 10);
      await Admin.create({ username: 'admin', password: hashedPassword });
      console.log('✨ Default admin created -> Username: [admin] | Password: [0746323229]');
    }

    // 2. Seed Default Profile with profilePic + 3 images + 1 video if none exists[cite: 3]
    const profileExists = await Profile.findOne();
    if (!profileExists) {
      await Profile.create({
        name: 'Michael',
        profession: 'Full-Stack Software Developer',
        about: 'Building dynamic, responsive UI/UX web applications.',
        profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        heroMedia: [
          { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', type: 'image', order: 1 },
          { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', type: 'image', order: 2 },
          { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3', type: 'image', order: 3 },
          { url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', order: 4 }
        ]
      });
      console.log('✨ Default profile, profile pic, and hero media seeded.');
    }
  } catch (err) {
    console.error('❌ Initial MongoDB cloud connection failed.');
    console.error('👉 Tip: If you are on a restricted network (like school Wi-Fi), ensure port 27017 is open or test via mobile hotspot.');
    console.error('Error Details:', err.message);
  }
};

initializeDatabase();

// Start Server bound to 0.0.0.0 so external devices on your Wi-Fi can connect[cite: 3]
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Portfolio Backend running locally on http://localhost:${PORT}`);
  console.log(`🌐 Accessible on your LAN via http://192.168.100.13:${PORT}`);
});