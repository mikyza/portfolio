'use client';
import React, { useState, useEffect, useMemo } from 'react';
 import { signIn } from "next-auth/react"; // 1. Add this import
import io from 'socket.io-client';
import axios from 'axios';
import { 
  ShoppingCart, User as UserIcon, LogOut, Settings, Trash2, Edit, X, 
  Plus, Minus, Package, Clock, ShieldCheck, Smartphone, Mail, Info,
  HardDrive, Users, ShoppingBag, XCircle, ImageIcon, Cpu, CheckCircle,
  Truck, XSquare, ChevronRight, LayoutDashboard, Sliders, Activity, MapPin, 
  Search, Video
} from 'lucide-react';

// ==========================================
// 1. GLOBAL CONFIGURATION & TYPES
// ==========================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''; 
let socket: any;

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", 
  "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", 
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", 
  "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", 
  "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
];

const COUNTY_SHIPPING_FEES: Record<string, number> = {
  "Nairobi": 300,
  "Kiambu": 400,
  "Mombasa": 1500,
  "Kisumu": 1200,
  "Nakuru": 800,
  "Uasin Gishu": 1000,
};

const getShippingFee = (county: string) => {
  if (!county) return 0;
  return COUNTY_SHIPPING_FEES[county] || 600; 
};

interface Product {
  id?: string;
  _id?: string;
  brand: string;
  modelName: string;
  price: number;
  basePrice: number;
  bfPrice?: number;
  isBlackFridayApplied: boolean;
  stockQuantity: number;
  images?: string[];
  specs: {
    processor: string;
    graphics: string;
    ram: string;
    storage: string;
    display: string;
    os: string;
  };
}

interface CartItem {
  laptopId: string;
  brand: string;
  model: string;
  price: number;
  quantity: number;
  image?: string;
}

interface User {
  fullName: string;
  role: string;
}

export default function PremiumLaptopStore() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transportFee, setTransportFee] = useState(0);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [userOrders, setUserOrders] = useState<any[]>([]); 
  
  const [bfState, setBfState] = useState({ active: false, msRemaining: 0 });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{msg: string, type: string} | null>(null);

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [bfHours, setBfHours] = useState(24);
  const [newFee, setNewFee] = useState(250);

  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]); 
  const [editingUsers, setEditingUsers] = useState<{ [key: string]: any }>({}); 
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploadStrategy, setUploadStrategy] = useState('online');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // --- NEW: Order Search & Carousel State ---
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [adminCarouselForm, setAdminCarouselForm] = useState<any[]>([]);
  
  const [productForm, setProductForm] = useState({
    brand: '', modelName: '', basePrice: 0, bfPrice: '', stockQuantity: 0, images: '',
    processor: '', graphics: '', ram: '', storage: '', display: '', os: ''
  });

  // ==========================================
  // 2. INITIALIZATION & WEB-SOCKETS
  // ==========================================
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    fetchProducts();
    fetchCarouselConfig(); // Initialize Carousel
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' && view === 'admin') {
      fetchAdminData();
    }
    if (token && view === 'orders') {
      fetchUserOrders();
    }
  }, [adminTab, view, token, user?.role]); 

  // --- NEW: Dynamic Asset Loader & Random Timer ---
  const fetchCarouselConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/config/carousel`);
      if (res.data && res.data.length > 0) {
        setCarouselSlides(res.data);
        setAdminCarouselForm(res.data);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      // Fallback assets if backend isn't mapped yet
      const fallbackAssets = [
        { id: "1", type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-backlit-keyboard-in-the-dark-42211-large.mp4', title: 'Unleash Ultimate Performance', subtitle: 'Experience professional-grade next-gen laptop engineering.' },
        { id: "2", type: 'image', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80', title: 'Sleek Design. Elite Precision.', subtitle: 'Crafted with premium materials for full-stack workflows.' },
        { id: "3", type: 'image', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80', title: 'Uncompromising Mobile Power', subtitle: 'Desktop-tier speed anywhere your ambitions take you.' }
      ];
      setCarouselSlides(fallbackAssets);
      setAdminCarouselForm(fallbackAssets);
    }
  };

  useEffect(() => {
    if (carouselSlides.length <= 1 || view !== 'home') return;
    
    let timeoutId: NodeJS.Timeout;
    const runSlider = () => {
      // Choose a random interval from 3, 5, 6, or 9 seconds
      const intervals = [3000, 5000, 6000, 9000];
      const nextInterval = intervals[Math.floor(Math.random() * intervals.length)];
      
      timeoutId = setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % carouselSlides.length);
        runSlider();
      }, nextInterval);
    };

    runSlider();
    return () => clearTimeout(timeoutId);
  }, [carouselSlides, view]);
  // ------------------------------------------------

  useEffect(() => {
    const newSocket = io(API_URL || "http://localhost:3000", {
      transports: ["polling", "websocket"], 
      withCredentials: false 
    });
    
    newSocket.on('connect', () => {
      console.log("⚡ Socket connected successfully! Connection ID:", newSocket.id);
      if (user?.role === 'admin' && token) {
        newSocket.emit('joinAdminChannel', token);
      }
    });

    newSocket.on('blackFridayTick', (data: { msRemaining: number }) => {
      setBfState({ active: true, msRemaining: data.msRemaining });
    });
    
    newSocket.on('blackFridayEnded', () => {
      setBfState({ active: false, msRemaining: 0 });
      fetchProducts(); 
      showToast('Black Friday has ended!', 'info');
    });

    newSocket.on('blackFridayStarted', (data: { endTime: string }) => {
      showToast('🔥 Black Friday Flash Sale has officially started!', 'info');
      fetchProducts(); 
    });

    newSocket.on('stockUpdated', (data: { laptopId: string, newStockQuantity: number }) => {
      setProducts(prev => prev.map(p => (p.id || p._id) === data.laptopId ? { ...p, stockQuantity: data.newStockQuantity } : p));
    });

    socket = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/catalog`);
      setProducts(res.data); 
    } catch (err) { 
      console.error("Failed to fetch catalog", err); 
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } });
      setUserOrders(res.data);
    } catch (err) {
      console.warn("User order fetch requires backend route setup");
    }
  };

  const showToast = (msg: string, type: string = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ==========================================
  // 3. CART & CHECKOUT LOGIC
  // ==========================================
  const addToCart = (product: Product, qty: number = 1) => {
    const productId = product.id || product._id || '';
    if (product.stockQuantity < qty) return showToast('Not enough stock!', 'error');
    setCart(prev => {
      const existing = prev.find(item => item.laptopId === productId);
      if (existing) {
        return prev.map(item => item.laptopId === productId ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { laptopId: productId, brand: product.brand, model: product.modelName, price: product.price, quantity: qty, image: product.images?.[0] }];
    });
    showToast(`${product.modelName} added to cart`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.laptopId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.laptopId !== id));

  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const cartGrandTotal = cartSubtotal > 0 ? cartSubtotal + transportFee : 0;

  const handleCountySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const county = e.target.value;
    setSelectedCounty(county);
    setTransportFee(getShippingFee(county));
  };

  const handleCheckout = async (method: string) => {
    if (!token) return setView('auth');
    if (!selectedCounty) return showToast('Please select a delivery county', 'error');

    try {
      await axios.post(`${API_URL}/api/orders/create`, 
        { cartItems: cart, paymentMethod: method, county: selectedCounty, shippingFee: transportFee, grandTotal: cartGrandTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Order placed successfully!');
      setCart([]);
      setSelectedCounty('');
      setTransportFee(0);
      setView('orders'); 
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Checkout failed', 'error');
    }
  };

  // ==========================================
  // 4. ADMIN ACTIONS & USER LOGIC
  // ==========================================
  const fetchAdminData = async () => {
    if (adminTab === 'users') {
      try {
        const res = await axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
        setAdminUsers(res.data);
      } catch (err) { showToast('Failed to fetch users', 'error'); }
    }
    if (adminTab === 'orders') {
      try {
        const res = await axios.get(`${API_URL}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
        setAdminOrders(res.data);
      } catch (err) { console.warn('Order fetch requires backend route setup'); }
    }
    if (adminTab === 'logs') {
      try {
        const res = await axios.get(`${API_URL}/api/admin/logs`, { headers: { Authorization: `Bearer ${token}` } });
        setAdminLogs(res.data);
      } catch (err) { console.warn('Logs fetch requires backend route setup'); }
    }
  };

  const handleUserInputChange = (userId: string, field: string, value: string) => {
    setEditingUsers(prev => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [field]: value }
    }));
  };

  const saveUserEdits = async (userId: string) => {
    const updates = editingUsers[userId];
    if (!updates) return showToast('No changes detected', 'info');
    
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/modify`, updates, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showToast('User profile updated successfully', 'success');
      setEditingUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      fetchAdminData();
    } catch (err) { 
      showToast('Failed to update user', 'error'); 
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showToast('User deleted successfully');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  const toggleBF = async (active: boolean) => {
    try {
      await axios.post(
        `${API_URL}/api/admin/config/black-friday`, 
        { active, durationHours: bfHours }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Black Friday ${active ? 'Activated! Deals are live.' : 'Deactivated. Prices restored to normal.'}`, 'success');
      fetchProducts(); 
    } catch (err) { 
      showToast('BF Toggle Failed', 'error'); 
    }
  };

  const updateFee = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/config/transport`, { amount: newFee }, { headers: { Authorization: `Bearer ${token}` } });
      setTransportFee(newFee);
      showToast('Transport fee updated globally');
    } catch (err) { showToast('Fee Update Failed', 'error'); }
  };

  const openProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProductId(product.id || product._id || null);
      setProductForm({
        brand: product.brand, modelName: product.modelName, basePrice: product.basePrice, 
        bfPrice: product.bfPrice?.toString() || '', stockQuantity: product.stockQuantity, 
        images: product.images?.join(', ') || '',
        processor: product.specs?.processor || '', graphics: product.specs?.graphics || '', 
        ram: product.specs?.ram || '', storage: product.specs?.storage || '', 
        display: product.specs?.display || '', os: product.specs?.os || ''
      });
    } else {
      setEditingProductId(null);
      setProductForm({ brand: '', modelName: '', basePrice: 0, bfPrice: '', stockQuantity: 0, images: '', processor: '', graphics: '', ram: '', storage: '', display: '', os: '' });
    }
    setUploadFile(null);
    setIsProductModalOpen(true);
  };

  const saveProduct = async () => {
    const token = localStorage.getItem('token'); 

    if (!token) {
      showToast('You are not logged in. Please login to continue.', 'error');
      return;
    }

    try {
      let finalImageUrls = productForm.images ? productForm.images.split(',').map(url => url.trim()).filter(url => url !== '') : [];

      if (uploadStrategy === 'offline' && uploadFile) {
        const formData = new FormData();
        formData.append('image', uploadFile);
        
        const uploadRes = await axios.post(`${API_URL}/api/admin/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });
        finalImageUrls = [uploadRes.data.url]; 
      }

      const payload = {
        brand: productForm.brand.trim(),
        modelName: productForm.modelName.trim(),
        basePrice: Number(productForm.basePrice) || 0,
        bfPrice: productForm.bfPrice ? Number(productForm.bfPrice) : null,
        stockQuantity: Number(productForm.stockQuantity) || 0,
        images: finalImageUrls,
        specs: {
          processor: productForm.processor.trim() || 'Not Specified',
          graphics: productForm.graphics.trim() || 'Not Specified',
          ram: productForm.ram.trim() || 'Not Specified',
          storage: productForm.storage.trim() || 'Not Specified',
          display: productForm.display.trim() || 'Not Specified',
          os: productForm.os.trim() || 'Not Specified'
        }
      };

      if (!payload.brand || !payload.modelName) {
        return showToast('Brand and Model Name are required!', 'error');
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingProductId) {
        await axios.put(`${API_URL}/api/admin/laptops/${editingProductId}/edit`, payload, config);
        showToast('Product updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/api/admin/laptops/add`, payload, config);
        showToast('New premium hardware logged successfully!', 'success');
      }
      
      setIsProductModalOpen(false);
      setEditingProductId(null);
      setProductForm({ brand: '', modelName: '', basePrice: 0, bfPrice: '', stockQuantity: 0, images: '', processor: '', graphics: '', ram: '', storage: '', display: '', os: '' });
      setUploadFile(null);
      fetchProducts();
    } catch (err: any) { 
      console.error("DEBUG ERROR:", err.response?.data);
      showToast(err.response?.data?.error || 'Failed to commit laptop data', 'error'); 
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/laptops/${id}/destroy`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Product deleted');
      fetchProducts();
    } catch (err) { showToast('Failed to delete product', 'error'); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      showToast(`Order marked as ${status}`);
      fetchAdminData();
    } catch (err) { showToast('Failed to update order', 'error'); }
  };

  // --- NEW: Save Admin Carousel Settings ---
  const saveCarouselConfig = async () => {
    try {
      await axios.post(
        `${API_URL}/api/admin/config/carousel`,
        { slides: adminCarouselForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Homepage dynamic hero updated successfully!', 'success');
      fetchCarouselConfig();
    } catch (err) {
      showToast('Failed to save to backend. Falling back to local state memory.', 'info');
      setCarouselSlides(adminCarouselForm); // Update local state regardless for immediate feedback
    }
  };

  const updateAdminCarouselField = (index: number, field: string, value: string) => {
    setAdminCarouselForm(prev => prev.map((slide, idx) => idx === index ? { ...slide, [field]: value } : slide));
  };
  // ----------------------------------------

  // ==========================================
  // 5. SUB-COMPONENTS (RENDER BLOCKS)
  // ==========================================
  
  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-gray-800 text-white p-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <span className="text-white text-sm font-bold">LX</span>
          </div>
          LUMI<span className="text-cyan-400">X</span>
        </div>
        
        <div className="flex items-center gap-6 font-medium text-sm">
          <button onClick={() => setView('home')} className="hover:text-cyan-400 transition-colors hidden sm:block">Store</button>
          
          {user && (
            <button onClick={() => setView('orders')} className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
              <Package size={16}/> Orders
            </button>
          )}

          {user?.role === 'admin' && (
            <button onClick={() => setView('admin')} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <ShieldCheck size={16}/> Admin
            </button>
          )}

          <button onClick={() => setView('cart')} className="relative p-2 hover:bg-gray-800 rounded-full transition-all">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{cart.length}</span>}
          </button>
          
          {user ? (
            <div className="flex items-center gap-3 bg-[#111111] border border-gray-800 px-4 py-1.5 rounded-full">
              <span className="text-gray-300 truncate max-w-[100px] hidden sm:block">{user.fullName}</span>
              <button onClick={() => { localStorage.clear(); setUser(null); setToken(null); setView('home'); }} className="text-red-400 hover:text-red-300"><LogOut size={16}/></button>
            </div>
          ) : (
            <button onClick={() => setView('auth')} className="bg-white hover:bg-gray-200 text-black px-5 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105">Login</button>
          )}
        </div>
      </div>
    </nav>
  );

  const renderBfBanner = () => {
    if (!bfState.active) return null;
    const hours = Math.floor((bfState.msRemaining / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((bfState.msRemaining / 1000 / 60) % 60);
    const secs = Math.floor((bfState.msRemaining / 1000) % 60);
    
    return (
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-3 px-4 text-center shadow-lg animate-pulse-slow">
        <h3 className="font-black text-sm sm:text-xl uppercase tracking-widest flex items-center justify-center gap-3">
          🔥 BLACK FRIDAY IS LIVE 🔥 
          <span className="bg-black/40 px-3 py-1 rounded font-mono border border-white/20">
            {String(hours).padStart(2,'0')}:{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </span>
        </h3>
      </div>
    );
  };

  const renderHome = () => (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 animate-fade-in bg-[#0a0a0a]">
      
      {/* NEW: DYNAMIC HERO CAROUSEL */}
      {carouselSlides.length > 0 && (
        <div className="relative w-full h-[340px] md:h-[500px] rounded-3xl overflow-hidden mb-8 border border-gray-800 bg-black group shadow-2xl">
          {carouselSlides.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {slide.type === 'video' ? (
                  <video
                    src={slide.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-60 transition-transform duration-[9000ms] scale-105 group-hover:scale-100"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/10 flex flex-col justify-end p-6 md:p-12 text-left space-y-2 md:space-y-4">
                  <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-md max-w-3xl leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-gray-300 text-sm md:text-xl font-medium max-w-2xl drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
          
          <div className="absolute bottom-6 right-8 z-20 flex gap-2">
            {carouselSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex ? 'bg-cyan-400 w-6 md:w-8' : 'bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-12 text-center space-y-4 pt-4 px-2">
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight">
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Computing.</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
          Discover the ultimate UI/UX experience. Elite machines, transparent pricing, and instant checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {products.map(p => (
          <div key={p.id || p._id} className="group bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col w-full">
            <div className="relative h-48 bg-[#1a1a1a] flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(p)}>
              {p.isBlackFridayApplied && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded uppercase tracking-wider z-10 shadow-lg">
                  Sale
                </div>
              )}
              {p.images && p.images.length > 0 ? (
                <img 
                  src={p.images[0]} 
                  alt={p.modelName} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ${p.images && p.images.length > 0 ? 'hidden' : ''}`}>
                <Smartphone size={48} className="text-gray-600" />
              </div>
            </div>
            
            <div className="p-4 md:p-5 flex-1 flex flex-col">
              <div className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">{p.brand}</div>
              <h3 className="text-white font-bold text-base md:text-lg leading-tight mb-2 flex-1 cursor-pointer hover:text-cyan-400 truncate" onClick={() => setSelectedProduct(p)}>
                {p.modelName}
              </h3>
              
              <div className="flex items-end justify-between mt-4">
                <div>
                  {p.isBlackFridayApplied ? (
                    <div className="flex flex-col">
                      <span className="text-gray-500 line-through text-[10px] md:text-sm">KES {p.basePrice.toLocaleString()}</span>
                      <span className="text-red-400 font-black text-lg md:text-2xl">KES {p.price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="text-white font-black text-lg md:text-xl">KES {p.price.toLocaleString()}</span>
                  )}
                </div>
                <button 
                  onClick={() => addToCart(p)} 
                  disabled={p.stockQuantity === 0} 
                  className="bg-white hover:bg-gray-200 text-black w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shrink-0"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="mt-3 text-[10px] md:text-xs text-gray-500 flex justify-between">
                <span className="truncate mr-2">{p.specs?.ram} • {p.specs?.storage}</span>
                <span className={p.stockQuantity > 0 ? "text-green-400" : "text-red-500"}>
                  {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductModal = () => {
    if (!selectedProduct) return null;
    const p = selectedProduct;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#111111] border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative">
          <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 rounded-full p-2 z-10"><X size={20}/></button>
          
          <div className="md:w-1/2 bg-[#1a1a1a] p-8 flex items-center justify-center min-h-[300px] overflow-hidden">
             {p.images && p.images.length > 0 ? (
               <img src={p.images[0]} alt={p.modelName} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
             ) : (
               <div className="w-64 h-64 bg-gray-800 rounded-full shadow-inner flex items-center justify-center border-8 border-[#111111]">
                 <Package size={64} className="text-gray-500"/>
               </div>
             )}
          </div>
          
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
            <span className="text-cyan-400 font-black tracking-widest text-sm uppercase">{p.brand}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-1 mb-6">{p.modelName}</h2>
            
            <div className="space-y-4 flex-1">
              <h4 className="text-white font-semibold border-b border-gray-800 pb-2">Technical Specifications</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block text-xs uppercase">Processor</span><span className="text-gray-200">{p.specs?.processor}</span></div>
                <div><span className="text-gray-500 block text-xs uppercase">Graphics</span><span className="text-gray-200">{p.specs?.graphics}</span></div>
                <div><span className="text-gray-500 block text-xs uppercase">Memory</span><span className="text-gray-200">{p.specs?.ram}</span></div>
                <div><span className="text-gray-500 block text-xs uppercase">Storage</span><span className="text-gray-200">{p.specs?.storage}</span></div>
                <div><span className="text-gray-500 block text-xs uppercase">Display</span><span className="text-gray-200">{p.specs?.display}</span></div>
                <div><span className="text-gray-500 block text-xs uppercase">OS</span><span className="text-gray-200">{p.specs?.os}</span></div>
              </div>
            </div>

            <div className="mt-8 bg-[#1a1a1a] border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto text-center sm:text-left">
                <p className="text-gray-400 text-sm">Total Price</p>
                <p className="text-2xl font-black text-white">KES {p.price.toLocaleString()}</p>
              </div>
              <button onClick={() => { addToCart(p); setSelectedProduct(null); }} className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-6 py-12 animate-fade-in text-white">
      <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><ShoppingCart className="text-cyan-400"/> Your Cart</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-[#111111] border border-gray-800 rounded-3xl">
          <Package size={64} className="mx-auto text-gray-700 mb-4"/>
          <h3 className="text-xl font-bold text-gray-400">Cart is empty</h3>
          <button onClick={() => setView('home')} className="mt-6 text-cyan-400 hover:text-cyan-300 font-semibold">Browse Store &rarr;</button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.map(item => (
              <div key={item.laptopId} className="bg-[#111111] p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 border border-gray-800 text-center sm:text-left">
                <div className="w-20 h-20 bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden">
                  {item.image ? <img src={item.image} alt={item.model} className="object-cover w-full h-full"/> : <Package className="text-gray-600"/>}
                </div>
                <div className="flex-1 w-full">
                  <h4 className="font-bold text-lg leading-tight truncate">{item.model}</h4>
                  <p className="text-cyan-400 font-semibold text-sm">KES {item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg p-1">
                  <button onClick={() => updateCartQty(item.laptopId, -1)} className="p-2 hover:text-cyan-400"><Minus size={16}/></button>
                  <span className="font-mono w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQty(item.laptopId, 1)} className="p-2 hover:text-cyan-400"><Plus size={16}/></button>
                </div>
                <button onClick={() => removeFromCart(item.laptopId)} className="p-3 text-gray-500 hover:text-red-400"><Trash2 size={20}/></button>
              </div>
            ))}
          </div>
          
          <div className="w-full lg:w-80 bg-[#111111] p-6 rounded-3xl border border-gray-800 h-fit sticky top-24">
            <h3 className="font-bold text-xl mb-4">Summary</h3>
            
            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><MapPin size={12}/> Delivery County</label>
              <select 
                className="w-full bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 outline-none focus:border-cyan-500"
                value={selectedCounty}
                onChange={handleCountySelection}
              >
                <option value="">-- Select Region --</option>
                {KENYA_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 text-sm text-gray-400 border-b border-gray-800 pb-4 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white">KES {cartSubtotal.toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span>Transport Fee</span>
                <span className="text-white">KES {transportFee.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-black text-white">KES {cartGrandTotal.toLocaleString()}</span>
            </div>
            
            <button 
              disabled={!selectedCounty}
              onClick={() => handleCheckout('mpesa')} 
              className="w-full bg-[#4CAF50] disabled:bg-gray-700 disabled:shadow-none hover:bg-[#45a049] text-white py-3 rounded-xl font-bold mb-3 shadow-lg shadow-green-900/50 transition-all flex justify-center items-center gap-2"
            >
              <Smartphone size={18}/> Pay via M-Pesa
            </button>
            <p className="text-xs text-center text-gray-500">Secure encrypted checkout.</p>
          </div>
        </div>
      )}
    </div>
  );

 const renderUserOrders = () => (
  <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in text-white">
    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
      <Truck className="text-green-400" /> My Orders
    </h2>

    {userOrders.length === 0 ? (
      <div className="text-center py-12 border border-gray-800 rounded-2xl bg-[#111111]">
        <Package size={40} className="mx-auto text-gray-700 mb-2" />
        <p className="text-gray-400 text-sm">No orders found.</p>
      </div>
    ) : (
      <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-800 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
          <div>Order ID</div>
          <div>Destination</div>
          <div>Total</div>
          <div className="text-right">Status</div>
        </div>

        <div className="divide-y divide-gray-800">
          {userOrders.map(order => (
            <div key={order.id || order._id} className="grid grid-cols-4 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-colors">
              <div className="font-mono text-sm text-gray-300">#{(order.id || order._id || '').substring(0, 8).toUpperCase()}</div>
              <div className="text-sm font-medium">{order.county || 'N/A'}</div>
              <div className="text-sm font-bold text-green-400">KES {order.grandTotal?.toLocaleString()}</div>
              
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                  order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);



const renderAuth = () => {
 const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // 1. Update these paths to avoid the /api/auth/ middleware conflict
    const url = isLogin ? '/api/user/login' : '/api/user/signup';
    
    const payload = isLogin 
      ? { phoneNumber: phone, password: pass } 
      : { phoneNumber: phone, password: pass, fullName: name };
      
    const res = await axios.post(API_URL + url, payload);
    
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    
    showToast('Authentication Successful', 'success');
    setView('home');
  } catch (err: any) { 
    showToast(err.response?.data?.error || 'Auth Error', 'error'); 
  }
};

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#0a0a0a]">
        <div className="bg-[#111111] p-10 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-2xl"></div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Enter your credentials to access the system.' : 'Join the hardware administration network.'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} required 
                  className="w-full mt-1 bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"/>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
              <input type="tel" placeholder="e.g. 0712..." value={phone} onChange={e=>setPhone(e.target.value)} required 
                className="w-full mt-1 bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required 
                className="w-full mt-1 bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"/>
            </div>
            
            <button type="submit" className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors mt-2">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* OR Separator */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-800"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-800"></div>
          </div>

          {/* Google Auth Button */}
          <button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white font-semibold py-3 rounded-lg border border-gray-800 hover:border-cyan-500 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
  
          <div className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:text-cyan-400 font-medium transition-colors">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAdmin = () => {
    if (user?.role !== 'admin') {
      return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center bg-red-950/20 border border-red-900/50 p-10 rounded-2xl">
            <h2 className="text-red-500 font-bold text-2xl tracking-widest mb-2">403 FORBIDDEN</h2>
            <p className="text-gray-400">You lack the necessary clearance to view this module.</p>
          </div>
        </div>
      );
    }

    // --- NEW: Added 'carousel' tab to the list ---
    const tabsList = [
      { id: 'dashboard', icon: <LayoutDashboard size={18}/>, label: 'Control Unit' },
      { id: 'carousel', icon: <ImageIcon size={18}/>, label: 'Hero Config' },
      { id: 'catalog', icon: <HardDrive size={18}/>, label: 'Products Stock' },
      { id: 'users', icon: <Users size={18}/>, label: 'User Clearance' },
      { id: 'orders', icon: <ShoppingBag size={18}/>, label: 'Fulfillment' },
      { id: 'logs', icon: <Activity size={18}/>, label: 'System Logs' } 
    ];

    // --- NEW: Process Order Searching on Frontend to support ID or User Name ---
    const filteredAdminOrders = adminOrders.filter((o) => {
      const searchStr = orderSearchQuery.toLowerCase();
      const idMatch = (o.id || o._id || '').toLowerCase().includes(searchStr);
      const nameMatch = (o.User?.fullName || '').toLowerCase().includes(searchStr);
      const phoneMatch = (o.User?.phoneNumber || '').toLowerCase().includes(searchStr);
      return idMatch || nameMatch || phoneMatch;
    });
    
    return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] bg-[#070707] text-white font-sans">
        
        <aside className="w-full md:w-64 bg-[#0d0d0d] border-b md:border-b-0 md:border-r border-gray-800/60 flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-800/40 hidden md:block">
            <div className="flex items-center gap-3 bg-[#121212] border border-gray-800/80 p-3 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sliders size={18}/>
              </div>
              <div className="truncate">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Console Node</p>
                <p className="text-sm font-bold text-gray-200 truncate">{user?.fullName}</p>
              </div>
            </div>
          </div>

          <nav className="p-3 md:p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible scrollbar-none shrink-0">
            {tabsList.map(tab => {
              const isActive = adminTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all duration-300 relative group shrink-0 ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-950/40 to-blue-950/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/20' 
                      : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200 border border-transparent'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-cyan-400 rounded-r hidden md:block"></span>}
                  <span className={isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>
  
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gradient-to-b from-[#070707] to-[#0a0a0a]">
          
          {/* TAB 1: SYSTEM CONTROL ENGINE */}
          {adminTab === 'dashboard' && (
             <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
             <div>
               <h2 className="text-2xl font-black tracking-tight text-white">Control Unit</h2>
               <p className="text-gray-400 text-xs mt-1">Configure real-time server switches and core infrastructure.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[#0e0e0e] border border-gray-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-gray-700/80">
                 <div className={`absolute top-0 left-0 right-0 h-[2px] ${bfState.active ? 'bg-red-500' : 'bg-gray-800'}`}></div>
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="font-bold text-base text-gray-200">Black Friday Price Engine</h3>
                     <p className="text-gray-400 text-xs mt-0.5">Define temporal framing for systemwide markdown.</p>
                   </div>
                   {bfState.active ? (
                     <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase animate-pulse">Live</span>
                   ) : (
                     <span className="bg-gray-900 text-gray-500 border border-gray-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Standby</span>
                   )}
                 </div>
                 
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Campaign Start</label>
                       <input type="datetime-local" disabled={bfState.active} className="w-full bg-[#141414] px-3 py-2 rounded-xl border border-gray-800 text-xs text-gray-300 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all disabled:opacity-40 font-mono"/>
                     </div>
                     <div>
                       <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Campaign End</label>
                       <input type="datetime-local" disabled={bfState.active} className="w-full bg-[#141414] px-3 py-2 rounded-xl border border-gray-800 text-xs text-gray-300 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all disabled:opacity-40 font-mono"/>
                     </div>
                   </div>
                   {bfState.active ? (
                     <button onClick={() => toggleBF(false)} className="w-full bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                       <XCircle size={16}/> Terminate Promotional Framing
                     </button>
                   ) : (
                     <button onClick={() => toggleBF(true)} className="w-full bg-white hover:bg-gray-200 text-black py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-black">
                       <Clock size={16}/> Deploy Black Friday Frames
                     </button>
                   )}
                 </div>
               </div>
 
               <div className="bg-[#0e0e0e] border border-gray-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-gray-700/80">
                 <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500"></div>
                 <h3 className="font-bold text-base text-gray-200 mb-0.5">Logistics Parameters</h3>
                 <p className="text-gray-400 text-xs mb-6">Modify global delivery variables.</p>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Base Delivery Premium (KES)</label>
                     <input type="number" value={newFee} onChange={e=>setNewFee(Number(e.target.value))} className="w-full bg-[#141414] px-4 py-2.5 rounded-xl border border-gray-800 text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none font-mono font-bold transition-all"/>
                   </div>
                   <button onClick={updateFee} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20">
                     Commit Transport Variable
                   </button>
                 </div>
               </div>
             </div>
           </div>
          )}

          {/* NEW TAB: CAROUSEL ASSET MANAGER */}
          {adminTab === 'carousel' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/80 pb-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Dynamic Hero Manager</h2>
                  <p className="text-gray-400 text-xs mt-1">Configure images, marketing videos, and descriptions for the main storefront banner.</p>
                </div>
                <button
                  onClick={saveCarouselConfig}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-900/20"
                >
                  Save Active Changes
                </button>
              </div>

              <div className="space-y-6 max-w-5xl">
                {adminCarouselForm.map((slide, idx) => (
                  <div key={idx} className="bg-[#0e0e0e] border border-gray-800/80 rounded-2xl p-6 relative group">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/30 px-3 py-1 rounded-md border border-cyan-500/20">
                        Slide Sequence #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Asset Strategy:</label>
                        <select
                          value={slide.type}
                          onChange={(e) => updateAdminCarouselField(idx, 'type', e.target.value)}
                          className="bg-[#141414] text-xs font-bold border border-gray-800 text-white rounded-lg px-3 py-1.5 focus:border-cyan-500 outline-none"
                        >
                          <option value="image">Static Image</option>
                          <option value="video">Motion Video Stream (.mp4)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Overlay Headline</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={(e) => updateAdminCarouselField(idx, 'title', e.target.value)}
                          placeholder="e.g. Unleash Power"
                          className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Marketing Subtitle</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onChange={(e) => updateAdminCarouselField(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. Next-generation features."
                          className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Direct Asset URL</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {slide.type === 'video' ? <Video size={16}/> : <ImageIcon size={16}/>}
                        </div>
                        <input
                          type="text"
                          value={slide.url || ''}
                          onChange={(e) => updateAdminCarouselField(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-[#141414] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-cyan-400 focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* TAB 2: HARDWARE CATALOG */}
          {adminTab === 'catalog' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Hardware Catalog Engine</h2>
                  <p className="text-gray-400 text-xs mt-1">Manage global inventory, county-specific pricing overrides, and product specifications.</p>
                </div>
              </div>
  
              {/* Product Builder Form */}
              <div className="bg-[#0e0e0e] border border-gray-800/80 rounded-2xl p-6 relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500"></div>
                <h3 className="font-bold text-base text-gray-200 mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-cyan-500"/> 
                  {editingProductId ? '🔧 Modify Hardware Profile' : '🚀 Product Initialization Interface'}
                </h3>
                
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveProduct(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      
                      {/* Core Identifiers */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Brand / Manufacturer</label>
                          <input type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="e.g. HP, Lenovo" className="w-full bg-[#141414] px-4 py-2.5 rounded-xl border border-gray-800 text-sm text-white focus:border-cyan-500/50 outline-none" required/>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Machine Nomenclature</label>
                          <input type="text" value={productForm.modelName} onChange={e => setProductForm({...productForm, modelName: e.target.value})} placeholder="e.g. ThinkPad T14" className="w-full bg-[#141414] px-4 py-2.5 rounded-xl border border-gray-800 text-sm text-white focus:border-cyan-500/50 outline-none" required/>
                        </div>
                      </div>

                      {/* Hardware Specifications Sub-Grid */}
                      <div className="bg-[#121212]/50 p-4 border border-gray-800 rounded-xl space-y-3">
                        <label className="text-[11px] text-cyan-400 uppercase font-bold tracking-wider block border-b border-gray-800 pb-1">Hardware Specifications Mapping</label>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <input type="text" placeholder="Processor (e.g. Core i7)" value={productForm.processor} onChange={e => setProductForm({...productForm, processor: e.target.value})} className="bg-[#141414] p-2.5 rounded-lg border border-gray-800 outline-none focus:border-cyan-500/50 text-white"/>
                          <input type="text" placeholder="Graphics (e.g. RTX 4060)" value={productForm.graphics} onChange={e => setProductForm({...productForm, graphics: e.target.value})} className="bg-[#141414] p-2.5 rounded-lg border border-gray-800 outline-none focus:border-cyan-500/50 text-white"/>
                          <input type="text" placeholder="RAM (e.g. 16GB DDR5)" value={productForm.ram} onChange={e => setProductForm({...productForm, ram: e.target.value})} className="bg-[#141414] p-2.5 rounded-lg border border-gray-800 outline-none focus:border-cyan-500/50 text-white"/>
                          <input type="text" placeholder="Storage Pool (e.g. 512GB NVMe)" value={productForm.storage} onChange={e => setProductForm({...productForm, storage: e.target.value})} className="bg-[#141414] p-2.5 rounded-lg border border-gray-800 outline-none focus:border-cyan-500/50 text-white"/>
                          <input type="text" placeholder='Display Ratio (e.g. 14" FHD)' value={productForm.display} onChange={e => setProductForm({...productForm, display: e.target.value})} className="bg-[#141414] p-2.5 rounded-lg border border-gray-800 outline-none focus:border-cyan-500/50 text-white"/>
                          <input type="text" placeholder="OS (e.g. Windows 11 Pro)" value={productForm.os} onChange={e => setProductForm({...productForm, os: e.target.value})} className="bg-[#141414] p-2.5 rounded-lg border border-gray-800 outline-none focus:border-cyan-500/50 text-white"/>
                        </div>
                      </div>

                      {/* Pricing & Stock */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Base Price (KES)</label>
                          <input type="number" value={productForm.basePrice || ''} onChange={e => setProductForm({...productForm, basePrice: Number(e.target.value)})} placeholder="0.00" className="w-full bg-[#141414] px-4 py-2.5 rounded-xl border border-gray-800 text-sm text-white focus:border-cyan-500/50 outline-none font-mono" required/>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Stock Matrix</label>
                          <input type="number" value={productForm.stockQuantity || ''} onChange={e => setProductForm({...productForm, stockQuantity: Number(e.target.value)})} placeholder="Units" className="w-full bg-[#141414] px-4 py-2.5 rounded-xl border border-gray-800 text-sm text-white focus:border-cyan-500/50 outline-none font-mono" required/>
                        </div>
                      </div>
                    </div>

                    {/* Image Management & County Pricing */}
                    <div className="space-y-4">
                      <div className="bg-[#121212] border border-gray-800/50 rounded-xl p-4">
                         <label className="text-[11px] text-cyan-400 uppercase font-bold tracking-wider mb-3 block border-b border-gray-800 pb-2">Asset Upload Strategy</label>
                         <select 
                           value={uploadStrategy}
                           onChange={(e) => setUploadStrategy(e.target.value)}
                           className="w-full bg-[#0a0a0a] px-3 py-2 rounded-lg border border-gray-800 text-xs text-gray-300 outline-none mb-3"
                         >
                           <option value="online">Online CDN Link (URL String)</option>
                           <option value="offline">Offline Storage (Local File Upload)</option>
                         </select>
                         
                         {/* Conditional Strategy Rendering */}
                         {uploadStrategy === 'online' ? (
                           <input 
                             type="text" 
                             value={productForm.images} 
                             onChange={e => setProductForm({...productForm, images: e.target.value})} 
                             placeholder="https://images.unsplash.com/photo-1, https://..." 
                             className="w-full bg-[#0a0a0a] px-3 py-2.5 rounded-lg border border-gray-800 text-xs text-white focus:border-cyan-500 outline-none"
                           />
                         ) : (
                           <input 
                             type="file" 
                             accept="image/*"
                             onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                             className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                           />
                         )}
                      </div>

                      <div className="bg-[#121212] border border-gray-800/50 rounded-xl p-4">
                         <label className="text-[11px] text-cyan-400 uppercase font-bold tracking-wider mb-2 block border-b border-gray-800 pb-2">Kenya 47 Counties Pricing Override</label>
                         <p className="text-[10px] text-gray-500 mb-3">Leave blank to inherit Base Price. Overrides apply automatically at checkout.</p>
                         <div className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-2 space-y-2">
                           {KENYA_COUNTIES.map(county => (
                             <div key={county} className="flex justify-between items-center gap-2">
                               <span className="text-xs text-gray-400 w-1/2 truncate">{county}</span>
                               <input type="number" placeholder="Override (KES)" className="w-1/2 bg-[#0a0a0a] px-2 py-1 rounded text-xs text-white border border-gray-800 focus:border-cyan-500 outline-none font-mono"/>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/60">
                    {editingProductId && (
                      <button 
                        type="button" 
                        onClick={() => { 
                          setEditingProductId(null); 
                          setProductForm({ brand: '', modelName: '', basePrice: 0, bfPrice: '', stockQuantity: 0, images: '', processor: '', graphics: '', ram: '', storage: '', display: '', os: '' }); 
                          setUploadFile(null);
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-cyan-900/20">
                      {editingProductId ? 'Commit Modified Changes' : 'Commit Hardware Profile'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Product List Data Table */}
              <div className="bg-[#0e0e0e] border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#121212] text-gray-400 border-b border-gray-800/80 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Machine Matrix</th>
                        <th className="px-6 py-4">Financial Profiles</th>
                        <th className="px-6 py-4">Stock Matrix</th>
                        <th className="px-6 py-4 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {products.map(p => (
                        <tr key={p.id || p._id} className="hover:bg-[#121212]/30 transition-colors group">
                          <td className="px-6 py-3.5">
                            <div className="font-bold text-gray-200 text-sm group-hover:text-cyan-400 transition-colors">{p.modelName}</div>
                            <div className="text-gray-500 mt-0.5 font-medium">{p.brand} • <span className="font-mono text-[11px] text-gray-400">{p.specs?.processor || 'No CPU mapped'}</span></div>
                          </td>
                          <td className="px-6 py-3.5 font-mono">
                            <div className="text-gray-300 font-bold">KES {p.basePrice.toLocaleString()}</div>
                            {p.isBlackFridayApplied && p.bfPrice && <div className="text-red-400 font-semibold text-[11px]">BF Event: KES {p.bfPrice.toLocaleString()}</div>}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border font-mono ${
                              p.stockQuantity > 5 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                              p.stockQuantity > 0 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {p.stockQuantity.toString().padStart(2, '0')} UNITS
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex justify-end gap-2.5">
                              <button 
                                onClick={() => {
                                  setEditingProductId(p.id || p._id || null);
                                  setProductForm({
                                    brand: p.brand || '', modelName: p.modelName || '', basePrice: p.basePrice || 0,
                                    bfPrice: p.bfPrice?.toString() || '', stockQuantity: p.stockQuantity || 0,
                                    images: p.images ? p.images.join(', ') : '',
                                    processor: p.specs?.processor || '', graphics: p.specs?.graphics || '',
                                    ram: p.specs?.ram || '', storage: p.specs?.storage || '',
                                    display: p.specs?.display || '', os: p.specs?.os || ''
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} 
                                className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-lg transition-all"
                              >
                                <Edit size={15}/>
                              </button>
                              <button onClick={() => deleteProduct(p.id || p._id || '')} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"><Trash2 size={15}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
  
          {/* TAB 3: USER MANAGEMENT */}
          {adminTab === 'users' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">User Registry & Access Control</h2>
                <p className="text-gray-400 text-xs mt-1">Review operational permissions, edit user data, and manage admin clearance nodes.</p>
              </div>
              <div className="bg-[#0e0e0e] border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#121212] text-gray-400 border-b border-gray-800/80 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Operator Profile</th>
                        <th className="px-6 py-4">Communications Line</th>
                        <th className="px-6 py-4">System Clearance</th>
                        <th className="px-6 py-4 text-right">Authentication Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {adminUsers.map(u => {
                        const currentData = { ...u, ...(editingUsers[u.id || u._id] || {}) };
                        const hasUnsavedChanges = !!editingUsers[u.id || u._id];

                        return (
                          <tr key={u.id || u._id} className="hover:bg-[#121212]/30 transition-colors group">
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                value={currentData.fullName || ''} 
                                onChange={(e) => handleUserInputChange(u.id || u._id, 'fullName', e.target.value)}
                                className="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-cyan-500 text-gray-200 text-sm font-bold outline-none px-1 py-0.5 transition-all w-full"
                              />
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-400">
                              <input 
                                type="text" 
                                value={currentData.phoneNumber || ''} 
                                onChange={(e) => handleUserInputChange(u.id || u._id, 'phoneNumber', e.target.value)}
                                className="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-cyan-500 outline-none px-1 py-0.5 transition-all w-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={currentData.role} 
                                onChange={(e) => handleUserInputChange(u.id || u._id, 'role', e.target.value)}
                                className={`bg-[#141414] border px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase outline-none cursor-pointer ${currentData.role === 'admin' ? 'text-cyan-400 border-cyan-500/40 focus:border-cyan-500' : 'text-gray-400 border-gray-800 focus:border-gray-500'}`}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin Node</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => saveUserEdits(u.id || u._id)} 
                                  className={`p-1.5 rounded-lg transition-all ${hasUnsavedChanges ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-gray-500 hover:text-green-400 hover:bg-green-500/5'}`} 
                                  title="Save Edits"
                                >
                                  <CheckCircle size={15}/>
                                </button>
                                <button 
                                  onClick={() => deleteUser(u.id || u._id)}
                                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all" 
                                  title="Delete User"
                                >
                                  <Trash2 size={15}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
  
          {/* TAB 4: ORDER FULFILLMENT */}
          {adminTab === 'orders' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Fulfillment Matrix</h2>
                  <p className="text-gray-400 text-xs mt-1">Track and expedite real-time consumer logistical pipelines.</p>
                </div>
                
                {/* NEW: Explicit Search Form */}
                <div className="relative w-full sm:w-80">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search size={16}/>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Hash ID or User Name..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all shadow-inner"
                  />
                  {orderSearchQuery && (
                    <button onClick={() => setOrderSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      <X size={14}/>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#0e0e0e] border border-gray-800/60 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#121212] text-gray-400 border-b border-gray-800/80 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Hash ID & Items</th>
                        <th className="px-6 py-4">Buyer Identity (User)</th>
                        <th className="px-6 py-4">Gross Revenue</th>
                        <th className="px-6 py-4">Pipeline Position</th>
                        <th className="px-6 py-4 text-right">Pipeline Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {filteredAdminOrders.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No logistical requests matched your search block.</td></tr>
                      ) : (
                        filteredAdminOrders.map(o => (
                          <tr key={o.id || o._id} className="hover:bg-[#121212]/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-cyan-500 font-bold text-sm block">#{(o.id || o._id || '').substring(0,8).toUpperCase()}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 block">
                                {o.items ? (typeof o.items === 'string' ? JSON.parse(o.items) : o.items).length : 0} items ordered
                              </span>
                            </td>
                            
                            {/* NEW: Specific User Identity Rendering */}
                            <td className="px-6 py-4">
                              <span className="text-gray-200 font-bold block text-sm">{o.User?.fullName || 'Anonymous User'}</span>
                              <span className="text-xs text-gray-500 font-mono mt-0.5 block">{o.User?.phoneNumber || 'No phone data'}</span>
                            </td>

                            <td className="px-6 py-4 font-bold text-gray-200 font-mono text-sm">KES {o.grandTotal?.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${o.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : o.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : o.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                {o.status === 'delivered' && <CheckCircle size={10}/>}{o.status === 'shipped' && <Truck size={10}/>}{o.status === 'cancelled' && <XSquare size={10}/>}{(o.status === 'pending' || o.status === 'processing') && <Package size={10}/>}{o.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select value={o.status} onChange={(e) => updateOrderStatus(o.id || o._id, e.target.value)} className="bg-[#141414] border border-gray-800 text-gray-300 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer">
                                <option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM LOGS */}
          {adminTab === 'logs' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">System Security & Operator Logs</h2>
                <p className="text-gray-400 text-xs mt-1">Immutable terminal output tracking user activity and core server operations.</p>
              </div>
              <div className="bg-[#050505] border border-gray-800 rounded-xl p-4 h-[60vh] overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner">
                {adminLogs.length === 0 ? (
                  <div className="text-gray-600 italic">No logs detected in the matrix...</div>
                ) : (
                  adminLogs.map(log => (
                    <div key={log.id || log._id} className="flex gap-4 border-b border-gray-900/50 py-2 hover:bg-[#111] transition-colors">
                      <span className="text-gray-600 w-32 shrink-0">
                        [{new Date(log.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }).replace(',', '')}]
                      </span>
                      <span className="text-cyan-500 w-24 shrink-0 truncate" title={log.Admin?.fullName || 'SYS_NODE'}>
                        {log.Admin?.fullName || 'SYS_NODE'}
                      </span>
                      <span className="text-gray-300">
                        {log.action.replace(/_/g, ' ')} on {log.targetType.toUpperCase()} ({log.targetId ? log.targetId.substring(0,8) : 'Global'})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  const renderFooter = () => (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-4">
          <div className="text-xl font-black text-white">LUMI<span className="text-cyan-400">X</span></div>
          <p className="text-gray-500">Premium computing hardware delivered with unprecedented speed and security across Kenya.</p>
        </div>
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Track Order</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Returns</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Warranty</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2"><Mail size={16}/> support@lumix.co.ke</li>
            <li className="flex items-center gap-2"><Smartphone size={16}/> +254 700 000 000</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} Lumix Technologies. All rights reserved. Powered by Next.js & Socket.io.
      </div>
    </footer>
  );

  // ==========================================
  // 6. MAIN RENDER PIPELINE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-cyan-500 selection:text-black">
      {notification && (
        <div className={`fixed top-24 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-slide-in-right ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-400 text-black'}`}>
          {notification.type === 'error' ? <ShieldCheck size={20}/> : <Info size={20}/>}
          {notification.msg}
        </div>
      )}

      {renderNavbar()}
      {renderBfBanner()}
      
      <main className="min-h-[70vh]">
        {view === 'home' && renderHome()}
        {view === 'cart' && renderCart()}
        {view === 'auth' && renderAuth()}
        {view === 'admin' && renderAdmin()}
        {view === 'orders' && renderUserOrders()} 
      </main>

      {renderProductModal()}
      {renderFooter()}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}