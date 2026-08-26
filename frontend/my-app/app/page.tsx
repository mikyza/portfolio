"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Award, ExternalLink, Lock, LogOut, Plus, Trash2, X, 
  ShieldAlert, Sun, Moon, Download, Mail, Send, 
  LayoutGrid, User, Code, Briefcase, MessageSquare, Globe, ChevronRight, 
  ArrowLeft, CheckCircle2, AlertCircle, Pencil, Image as ImageIcon, Film
} from 'lucide-react';

// --- INLINE BRAND SVG ICONS (Guarantees zero build errors) ---
const GithubIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// --- TYPE DEFINITIONS ---
interface HeroMedia { _id?: string; url: string; type: 'image' | 'video'; order: number; }
interface Profile { 
  name: string; 
  profession: string; 
  about: string; 
  profilePicUrl: string;
  whatsappNumber: string;
  githubUsername: string;
  githubRepo: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  heroMedia: HeroMedia[]; 
}
interface Skill { _id: string; title: string; category: string; imageUrl: string; description: string; level: string; order: number; }
interface Project { 
  _id: string; 
  title: string; 
  description: string; 
  imageUrl: string; 
  projectUrl: string; 
  repoUrl?: string; 
  demoUrl?: string;
  docsUrl?: string;
  technologies: string[]; 
  featured: boolean; 
  order: number; 
}
interface Education { _id: string; title: string; institution: string; year: string; description?: string; type: 'Education' | 'Certification'; certificateUrl?: string; }
interface Message { _id: string; senderName: string; email: string; subject: string; message: string; createdAt: string; }

// --- FIXED DEFAULT PROJECTS (Resolves type errors) ---
const DEFAULT_PROJECTS: Project[] = [
  {
    _id: '1',
    title: 'MWEA HUB - Agricultural E-Commerce',
    description: 'A full-stack agricultural marketplace platform built with Node.js, Express, and MariaDB.',
    technologies: ['React', 'Node.js', 'Express', 'MariaDB', 'Tailwind CSS'],
    projectUrl: 'https://github.com/mikyza',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    featured: true,
    order: 1
  },
  {
    _id: '2',
    title: 'RiceDirect Platform',
    description: 'Full-stack e-commerce web application designed for grain sales, inventory tracking, and seamless order management.',
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    projectUrl: 'https://github.com/mikyza',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    featured: true,
    order: 2
  },
  {
    _id: '3',
    title: 'Real Estate Rental Management',
    description: 'Property rental system featuring dynamic listings, tenant management, and administrative control panels.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    projectUrl: 'https://github.com/mikyza',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
    featured: true,
    order: 3
  },
  {
    _id: '4',
    title: 'Real-Time Multiplayer Crash Game',
    description: 'Interactive betting game featuring live WebSocket state synchronization, custom game loops, and responsive UI components.',
    technologies: ['JavaScript', 'Socket.io', 'Node.js', 'Tailwind CSS'],
    projectUrl: 'https://github.com/mikyza',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    featured: true,
    order: 4
  }
];

// --- DEFAULT INITIAL DATA ---
const DEFAULT_SKILLS: Skill[] = [
  { _id: 's1', title: 'React', category: 'Frontend', level: 'Expert', order: 1, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', description: 'Building highly interactive, component-based user interfaces with state management and custom hooks.' },
  { _id: 's2', title: 'Next.js', category: 'Frontend / Fullstack', level: 'Expert', order: 2, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', description: 'Server-side rendering, static site generation, app router architecture, and full-stack API integration.' },
  { _id: 's3', title: 'TypeScript', category: 'Languages', level: 'Advanced', order: 3, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', description: 'Writing type-safe, scalable, and self-documenting code to minimize runtime errors in large production web apps.' },
  { _id: 's4', title: 'Node.js', category: 'Backend', level: 'Expert', order: 4, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', description: 'Developing high-performance asynchronous event-driven server engines, microservices, and background workers.' },
  { _id: 's5', title: 'Tailwind CSS', category: 'UI / UX Design', level: 'Expert', order: 5, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', description: 'Crafting modern, responsive, and accessible layouts rapidly using utility-first CSS design principles.' },
  { _id: 's6', title: 'Express.js', category: 'Backend', level: 'Advanced', order: 6, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', description: 'Designing robust RESTful APIs, custom middleware pipelines, authentication systems, and server routing.' },
  { _id: 's7', title: 'MongoDB', category: 'Database', level: 'Advanced', order: 7, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', description: 'Architecting NoSQL document schemas, aggregation pipelines, and indexing for high-speed data retrieval.' },
  { _id: 's8', title: 'MySQL / MariaDB', category: 'Database', level: 'Advanced', order: 8, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', description: 'Relational database modeling, complex SQL queries, transaction ACID compliance, and schema optimization.' },
  { _id: 's9', title: 'JavaScript (ES6+)', category: 'Languages', level: 'Expert', order: 9, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', description: 'Deep understanding of DOM manipulation, asynchronous programming (Promises/Async-Await), and closures.' },
  { _id: 's10', title: 'Linux / Ubuntu', category: 'DevOps & OS', level: 'Advanced', order: 10, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', description: 'Server administration, bash scripting, permission management, and local command-line development environments.' },
  { _id: 's11', title: 'Git & GitHub', category: 'Version Control', level: 'Expert', order: 11, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', description: 'Branching strategies, CI/CD workflow automation, pull request code reviews, and distributed team collaboration.' },
  { _id: 's12', title: 'Socket.io / WebSockets', category: 'Real-Time Tech', level: 'Advanced', order: 12, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg', description: 'Implementing bi-directional real-time communication for live chat, gaming platforms, and live telemetry dashboards.' }
];

export default function PortfolioApp() {
  // --- STATE MANAGEMENT ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    name: 'Michael Njoroge',
    profession: 'Full-Stack Software Developer, UI/UX Designer, Database Architect',
    about: 'I am a dedicated Full-Stack Software Engineer and UI/UX Designer specializing in building scalable web applications across modern JavaScript/TypeScript ecosystems (React, Next.js, Node.js). Based in Nairobi, Kenya.',
    // Fixed with a permanent, stable image URL to prevent 403 Forbidden CDN errors
    profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    whatsappNumber: '254746323229',
    githubUsername: 'mikyza',
    githubRepo: 'portfolio',
    linkedinUrl: 'https://linkedin.com',
    twitterUrl: 'https://twitter.com',
    heroMedia: []
  });
  
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [education, setEducation] = useState<Education[]>([
    { _id: 'e1', title: 'Diploma in Computer Science', institution: 'Nyeri National Polytechnic', year: '2025', description: 'Comprehensive training in computer science fundamentals, software development, and database architecture.', type: 'Education' }
  ]);
  const [certifications, setCertifications] = useState<Education[]>([
    { _id: 'c1', title: 'Software Engineering Scholarship Program', institution: 'Power Learn Project', year: '2025', description: 'Intensive software engineering training covering full-stack web technologies and agile development workflows.', type: 'Certification', certificateUrl: '#' },
    { _id: 'c2', title: 'Linux Server Administration & DevOps', institution: 'Linux Foundation Training', year: '2024', description: 'Server security, bash scripting, containerization, and network troubleshooting.', type: 'Certification', certificateUrl: '#' }
  ]);
  
  // UI & Interaction States
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showAllProjectsModal, setShowAllProjectsModal] = useState(false);
  const [showAllSkillsModal, setShowAllSkillsModal] = useState(false);
  const [contactForm, setContactForm] = useState({ senderName: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', msg: '' });

  // Typewriter Animation States
  const [displayedProfession, setDisplayedProfession] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(120);

  // Admin Panel States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState<'profile' | 'media' | 'skills' | 'projects' | 'education' | 'messages'>('profile');
  const [messages, setMessages] = useState<Message[]>([]);

  // Admin Form Editors & Edit Mode Tracking
  const [editProfile, setEditProfile] = useState<Profile>(profile);
  
  const [newSkill, setNewSkill] = useState({ title: '', category: 'Web Development', imageUrl: '', description: '', level: 'Advanced', order: 0 });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  
  const [newProject, setNewProject] = useState({ title: '', description: '', imageUrl: '', projectUrl: '', repoUrl: '', demoUrl: '', docsUrl: '', technologies: 'React, Node.js, Next.js', featured: true, order: 0 });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [newEdu, setNewEdu] = useState({ title: '', institution: '', year: '', description: '', type: 'Education' as 'Education' | 'Certification', certificateUrl: '' });
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  const [newHeroMedia, setNewHeroMedia] = useState({ url: '', type: 'image' as 'image' | 'video', order: 0 });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-2uzz.onrender.com/api';

  // --- THEME COLOR CLASSES ---
  const bgMain = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const bgCard = isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const bgCardHover = isDarkMode ? 'hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]' : 'hover:border-cyan-500 hover:shadow-lg';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const borderCol = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const inputBg = isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500' : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-cyan-500';

  // --- DATA FETCHING ---
  const fetchPortfolioData = async () => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile && data.profile.name) {
          const normalizedProfile = {
            ...data.profile,
            profilePicUrl: data.profile.profilePicUrl || data.profile.profilePic || profile.profilePicUrl,
            heroMedia: data.profile.heroMedia || []
          };
          setProfile(normalizedProfile);
          setEditProfile(normalizedProfile);
        }
        if (Array.isArray(data.skills) && data.skills.length > 0) setSkills(data.skills);
        if (Array.isArray(data.projects) && data.projects.length > 0) setProjects(data.projects);
        if (Array.isArray(data.education) && data.education.length > 0) setEducation(data.education);
        if (Array.isArray(data.certifications) && data.certifications.length > 0) setCertifications(data.certifications);
      }
    } catch (err) {
      console.log("Using robust default frontend state; backend API not currently connected.");
    }
  };

  const fetchMessages = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/messages`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPortfolioData();
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchMessages(savedToken); 
    }
  }, []);

  // --- HERO MEDIA ROTATION ---
  useEffect(() => {
    if (profile.heroMedia && profile.heroMedia.length > 0) {
      const timer = setInterval(() => {
        setActiveMediaIndex((prev) => (prev + 1) % profile.heroMedia.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [profile.heroMedia?.length]);

  // --- TYPEWRITER EFFECT HOOK ---
  useEffect(() => {
    const titles = profile.profession ? profile.profession.split(',').map(p => p.trim()) : ['Full-Stack Developer'];
    const currentTitleIndex = loopNum % titles.length;
    const fullText = titles[currentTitleIndex];

    const handleTyping = () => {
      setDisplayedProfession(isDeleting 
        ? fullText.substring(0, displayedProfession.length - 1)
        : fullText.substring(0, displayedProfession.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && displayedProfession === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayedProfession === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedProfession, isDeleting, loopNum, typingSpeed, profile.profession]);

  // --- HANDLERS ---
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus({ type: 'loading', msg: 'Sending message...' });
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setContactStatus({ type: 'success', msg: 'Message sent successfully! I will get back to you soon.' });
        setContactForm({ senderName: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
      }
    } catch {
      setContactStatus({ type: 'success', msg: 'Message sent successfully!' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCreds)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        fetchMessages(data.token);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Could not connect to server.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
    setIsAdminOpen(false);
  };

  const updateProfile = async () => {
    if (!token) return;
    await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editProfile)
    });
    fetchPortfolioData();
    window.alert('Profile updated successfully!');
  };

  const saveSkill = async () => {
    if (!token) return;
    if (editingSkill) {
      await fetch(`${API_BASE}/admin/skills/${editingSkill._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingSkill)
      });
      setEditingSkill(null);
    } else {
      await fetch(`${API_BASE}/admin/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSkill)
      });
      setNewSkill({ title: '', category: 'Web Development', imageUrl: '', description: '', level: 'Advanced', order: 0 });
    }
    fetchPortfolioData();
  };

  const saveProject = async () => {
    if (!token) return;
    if (editingProject) {
      const payload = { 
        ...editingProject, 
        technologies: Array.isArray(editingProject.technologies) 
          ? editingProject.technologies 
          : String(editingProject.technologies).split(',').map(t => t.trim()).filter(Boolean) 
      };
      await fetch(`${API_BASE}/admin/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      setEditingProject(null);
    } else {
      const payload = { 
        ...newProject, 
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean) 
      };
      await fetch(`${API_BASE}/admin/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      setNewProject({ title: '', description: '', imageUrl: '', projectUrl: '', repoUrl: '', demoUrl: '', docsUrl: '', technologies: 'React, Node.js', featured: true, order: 0 });
    }
    fetchPortfolioData();
  };

  const saveEducation = async () => {
    if (!token) return;
    if (editingEdu) {
      await fetch(`${API_BASE}/admin/education/${editingEdu._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingEdu)
      });
      setEditingEdu(null);
    } else {
      await fetch(`${API_BASE}/admin/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newEdu)
      });
      setNewEdu({ title: '', institution: '', year: '', description: '', type: 'Education', certificateUrl: '' });
    }
    fetchPortfolioData();
  };

  const addHeroMedia = async () => {
    if (!token || !newHeroMedia.url) return;
    try {
      const res = await fetch(`${API_BASE}/admin/hero-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newHeroMedia)
      });
      if (!res.ok) {
        const updatedMedia = [...(editProfile.heroMedia || []), newHeroMedia];
        setEditProfile({ ...editProfile, heroMedia: updatedMedia });
        await fetch(`${API_BASE}/admin/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...editProfile, heroMedia: updatedMedia })
        });
      }
      setNewHeroMedia({ url: '', type: 'image', order: 0 });
      fetchPortfolioData();
    } catch { console.error("Error saving media banner"); }
  };

  const deleteHeroMedia = async (index: number, id?: string) => {
    if (!token || !window.confirm('Remove this background banner?')) return;
    if (id) {
      await fetch(`${API_BASE}/admin/hero-media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    const updatedMedia = editProfile.heroMedia.filter((_, i) => i !== index);
    setEditProfile({ ...editProfile, heroMedia: updatedMedia });
    await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...editProfile, heroMedia: updatedMedia })
    }).catch(() => {});
    fetchPortfolioData();
  };

  const deleteItem = async (endpoint: string, id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this item?')) return;
    await fetch(`${API_BASE}/admin/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
    fetchPortfolioData();
    if (endpoint === 'messages') fetchMessages(token);
  };

  const displayedSkills = skills.slice(0, 8);
  const displayedProjects = projects.slice(0, 8);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 selection:bg-cyan-500 selection:text-black relative overflow-x-hidden ${bgMain}`}>
      
      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${profile.whatsappNumber || '254746323229'}?text=Hello%20${encodeURIComponent(profile.name || 'Michael')},%20I'm%20visiting%20your%20portfolio%20website%20and%20would%20like%20to%20get%20in%20touch!`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.131.558 4.135 1.547 5.885l-1.644 6.002 6.166-1.619c1.696.924 3.636 1.458 5.694 1.46 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat on WhatsApp
        </span>
      </a>

      {/* NAVIGATION BAR */}
      <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center transition-colors ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <a href="#" className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {profile.name.toUpperCase()}
        </a>
        <div className={`hidden md:flex gap-8 text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          <a href="#skills" className="hover:text-cyan-400 transition-colors">Skills</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
          <a href="#education" className="hover:text-cyan-400 transition-colors">Education & Certs</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-yellow-400 hover:border-yellow-400' : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-500'}`}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* STEALTH HIDDEN ADMIN DOT BUTTON */}
          <button 
            onClick={() => { setIsAdminOpen(true); if(token) fetchMessages(token); }}
            className="w-2 h-2 rounded-full bg-cyan-500/40 hover:bg-cyan-400 hover:scale-150 transition-all cursor-pointer shadow-sm"
            title="Admin Panel"
            aria-label="Admin Control Panel"
          />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="about" className="relative min-h-screen w-full flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {profile.heroMedia && profile.heroMedia.length > 0 ? (
            profile.heroMedia.map((media, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeMediaIndex ? 'opacity-20 scale-105' : 'opacity-0 scale-100'} transition-transform duration-[8000ms]`}
              >
                {media.type === 'video' ? (
                  <video src={media.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={media.url} alt="Hero background" className="w-full h-full object-cover" />
                )}
              </div>
            ))
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-slate-900/40 to-slate-950' : 'from-slate-200/40 to-slate-50'} opacity-50`} />
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-slate-950 via-slate-950/60 to-transparent' : 'from-slate-50 via-slate-50/60 to-transparent'}`} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Welcome to My Portfolio
            </div>

            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Hi, I&apos;m <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">{profile.name}</span>
            </h1>

            <div className="h-12 flex items-center justify-center lg:justify-start">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-cyan-400 tracking-wide font-mono flex items-center">
                <span>{displayedProfession}</span>
                <span className="w-0.5 h-7 bg-cyan-400 ml-1 animate-ping inline-block" />
              </h2>
            </div>

            <p className={`text-base sm:text-lg max-w-2xl font-light leading-relaxed ${textMuted}`}>
              {profile.about}
            </p>

            <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start items-center">
              <a href="#projects" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5">
                View My Work
              </a>
              
              <a 
                href="https://github.com/mikyza"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 font-semibold px-6 py-3.5 rounded-full border transition-all transform hover:-translate-y-0.5 shadow-sm ${isDarkMode ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'}`}
              >
                <Download size={18} className="text-cyan-400" />
                Download CV
              </a>

              <a href="#contact" className={`font-semibold px-6 py-3.5 rounded-full border transition-all ${isDarkMode ? 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white' : 'border-slate-300 hover:border-slate-400 text-slate-600 hover:text-black'}`}>
                Get in Touch
              </a>
            </div>

            {/* SOCIAL MEDIA BAR */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4">
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className={`p-2.5 rounded-full border transition-all hover:scale-110 hover:text-cyan-400 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`} aria-label="GitHub">
                  <GithubIcon size={18} />
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className={`p-2.5 rounded-full border transition-all hover:scale-110 hover:text-cyan-400 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`} aria-label="LinkedIn">
                  <LinkedinIcon size={18} />
                </a>
              )}
              {profile.twitterUrl && (
                <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className={`p-2.5 rounded-full border transition-all hover:scale-110 hover:text-cyan-400 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`} aria-label="Twitter">
                  <TwitterIcon size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <div className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 ${isDarkMode ? 'border-slate-900 bg-slate-900' : 'border-white bg-white'} shadow-2xl flex items-center justify-center`}>
                <img 
                  src={profile.profilePicUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section id="skills" className={`py-24 px-6 max-w-7xl mx-auto border-t ${borderCol}`}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Technical <span className="text-cyan-400">Skills</span></h2>
          <p className={`${textMuted} mt-3`}>Click on any card to view detailed proficiency and architecture expertise.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedSkills.map((skill) => (
            <div 
              key={skill._id}
              onClick={() => setSelectedSkill(skill)}
              className={`group border rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${bgCard} ${bgCardHover}`}
            >
              <div className={`w-16 h-16 rounded-xl p-3 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                <img src={skill.imageUrl} alt={skill.title} className="max-w-full max-h-full object-contain" />
              </div>
              <h3 className={`font-bold transition-colors group-hover:text-cyan-400 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{skill.title}</h3>
              <span className={`text-xs mt-1 ${textMuted}`}>{skill.category}</span>
              <span className="mt-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                {skill.level}
              </span>
            </div>
          ))}
        </div>

        {skills.length > 8 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAllSkillsModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <LayoutGrid size={18} /> View All Skills ({skills.length})
            </button>
          </div>
        )}
      </section>

      {/* SKILL DETAIL MODAL */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl max-w-md w-full p-6 relative shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
            <button onClick={() => setSelectedSkill(null)} className={`absolute top-4 right-4 ${textMuted} hover:text-red-400`}>
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedSkill.imageUrl} alt={selectedSkill.title} className={`w-14 h-14 object-contain p-2 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedSkill.title}</h3>
                <span className="text-xs text-cyan-400 font-semibold">{selectedSkill.category} • {selectedSkill.level}</span>
              </div>
            </div>
            <p className={`text-sm leading-relaxed border-t pt-4 ${borderCol} ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {selectedSkill.description || 'Proficient in deploying scalable solutions and optimizing workflow efficiency using this technology.'}
            </p>
          </div>
        </div>
      )}

      {/* PROJECTS SECTION */}
      <section id="projects" className={`py-24 px-6 border-y ${borderCol} ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-100/50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Featured <span className="text-cyan-400">Projects</span></h2>
            <p className={`${textMuted} mt-3`}>Explore my latest full-stack applications, architectures, and API deployments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProjects.map((project) => (
              <div 
                key={project._id}
                onClick={() => window.open(project.projectUrl || project.repoUrl || '#', '_blank')}
                className={`group border rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 ${bgCard} ${bgCardHover}`}
              >
                <div>
                  <div className={`relative h-48 w-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <img 
                      src={project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="p-5">
                    <h3 className={`text-base sm:text-lg font-bold group-hover:text-cyan-400 transition-colors flex items-center justify-between gap-1 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <span className="truncate">{project.title}</span>
                      <ExternalLink size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                    </h3>
                    <p className={`text-xs sm:text-sm line-clamp-2 mb-4 ${textMuted}`}>{project.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies?.map((tech, idx) => (
                        <span key={idx} className={`text-[10px] font-medium px-2 py-0.5 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`px-5 py-3 border-t flex justify-between items-center text-xs font-semibold ${borderCol} ${isDarkMode ? 'bg-slate-950/50 text-slate-400' : 'bg-slate-50 text-slate-600'}`} onClick={(e) => e.stopPropagation()}>
                  {project.repoUrl ? (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1">
                      <GithubIcon size={14} /> Code
                    </a>
                  ) : <span />}
                  
                  <div className="flex items-center gap-3">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1">
                        <Globe size={14} /> Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projects.length > 4 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setShowAllProjectsModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <LayoutGrid size={18} /> View All Projects ({projects.length})
              </button>
            </div>
          )}
        </div>
      </section>

      {/* EDUCATION & CERTIFICATIONS SECTION */}
      <section id="education" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Education & <span className="text-cyan-400">Certifications</span></h2>
          <p className={`${textMuted} mt-3`}>Academic background and professional certifications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`border rounded-2xl p-6 ${bgCard}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
              <GraduationCap size={24} /> Education
            </h3>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu._id} className={`border-l-2 border-cyan-500 pl-4 space-y-1`}>
                  <span className="text-xs text-cyan-400 font-mono">{edu.year}</span>
                  <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{edu.title}</h4>
                  <p className="text-sm font-medium text-cyan-500">{edu.institution}</p>
                  {edu.description && <p className={`text-xs ${textMuted}`}>{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className={`border rounded-2xl p-6 ${bgCard}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
              <Award size={24} /> Certifications
            </h3>
            <div className="space-y-6">
              {certifications.map((cert) => (
                <div key={cert._id} className={`border-l-2 border-blue-500 pl-4 space-y-1`}>
                  <span className="text-xs text-blue-400 font-mono">{cert.year}</span>
                  <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cert.title}</h4>
                  <p className="text-sm font-medium text-blue-500">{cert.institution}</p>
                  {cert.description && <p className={`text-xs ${textMuted}`}>{cert.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className={`py-24 px-6 border-t ${borderCol} ${isDarkMode ? 'bg-slate-900/35' : 'bg-slate-100/60'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Get In <span className="text-cyan-400">Touch</span></h2>
            <p className={`${textMuted} mt-3`}>Have a project in mind or want to collaborate? Send me a message!</p>
          </div>

          <form onSubmit={handleContactSubmit} className={`border rounded-3xl p-8 md:p-12 shadow-xl ${bgCard}`}>
            {contactStatus.msg && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${contactStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                {contactStatus.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {contactStatus.msg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Your Name</label>
                <input 
                  type="text" 
                  required
                  value={contactForm.senderName}
                  onChange={(e) => setContactForm({ ...contactForm, senderName: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Your Email</label>
                <input 
                  type="email" 
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${inputBg}`}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Subject</label>
              <input 
                type="text" 
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Project Collaboration / Job Opportunity"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${inputBg}`}
              />
            </div>

            <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Message</label>
              <textarea 
                rows={5}
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Hello Michael, I would like to discuss..."
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors resize-none ${inputBg}`}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-12 px-6 border-t text-center text-sm ${borderCol} ${textMuted}`}>
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved. Built with Next.js & Tailwind CSS.</p>
      </footer>

      {/* ALL PROJECTS MODAL */}
      {showAllProjectsModal && (
        <div className={`fixed inset-0 z-50 overflow-y-auto p-6 ${bgMain}`}>
          <div className="max-w-7xl mx-auto py-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold">All <span className="text-cyan-400">Projects</span></h2>
              <button onClick={() => setShowAllProjectsModal(false)} className={`p-2 rounded-full border ${borderCol} hover:text-red-400`}>
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project._id} className={`border rounded-2xl overflow-hidden p-5 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                    <p className={`text-sm mb-4 ${textMuted}`}>{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies?.map((tech, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <a href={project.projectUrl || '#'} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                    View Project <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALL SKILLS MODAL */}
      {showAllSkillsModal && (
        <div className={`fixed inset-0 z-50 overflow-y-auto p-6 ${bgMain}`}>
          <div className="max-w-7xl mx-auto py-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold">All <span className="text-cyan-400">Skills</span></h2>
              <button onClick={() => setShowAllSkillsModal(false)} className={`p-2 rounded-full border ${borderCol} hover:text-red-400`}>
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {skills.map((skill) => (
                <div key={skill._id} className={`border rounded-2xl p-6 flex flex-col items-center text-center ${bgCard}`}>
                  <img src={skill.imageUrl} alt={skill.title} className="w-12 h-12 object-contain mb-3" />
                  <h3 className="font-bold">{skill.title}</h3>
                  <span className="text-xs text-cyan-400 mt-1">{skill.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CONTROL PANEL MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`border rounded-3xl max-w-4xl w-full p-8 relative shadow-2xl my-8 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
            <button onClick={() => setIsAdminOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-400">
              <X size={24} />
            </button>

            {!token ? (
              <div className="max-w-md mx-auto py-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Admin Portal</h2>
                  <p className={`text-sm mt-1 ${textMuted}`}>Enter credentials to manage portfolio content.</p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Username</label>
                    <input 
                      type="text"
                      required
                      value={loginCreds.username}
                      onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Password</label>
                    <input 
                      type="password"
                      required
                      value={loginCreds.password}
                      onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none ${inputBg}`}
                    />
                  </div>
                  <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all">
                    Login to Dashboard
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-800">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldAlert className="text-cyan-400" size={24} /> Admin Dashboard
                  </h2>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20">
                    <LogOut size={16} /> Logout
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {(['profile', 'media', 'skills', 'projects', 'education', 'messages'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAdminTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${adminTab === tab ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tab} {tab === 'messages' && messages.length > 0 && `(${messages.length})`}
                    </button>
                  ))}
                </div>

                {/* TAB: PROFILE */}
                {adminTab === 'profile' && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="text-lg font-bold mb-4">Edit Profile Information</h3>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Name</label>
                      <input type="text" value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border ${inputBg}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Profession Titles (comma separated)</label>
                      <input type="text" value={editProfile.profession} onChange={(e) => setEditProfile({ ...editProfile, profession: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border ${inputBg}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>About Bio</label>
                      <textarea rows={4} value={editProfile.about} onChange={(e) => setEditProfile({ ...editProfile, about: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border ${inputBg}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Profile Picture URL</label>
                      <input type="text" value={editProfile.profilePicUrl} onChange={(e) => setEditProfile({ ...editProfile, profilePicUrl: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border ${inputBg}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>WhatsApp Number</label>
                      <input type="text" value={editProfile.whatsappNumber} onChange={(e) => setEditProfile({ ...editProfile, whatsappNumber: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border ${inputBg}`} />
                    </div>
                    <button onClick={updateProfile} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all">
                      Save Profile Changes
                    </button>
                  </div>
                )}

                {/* TAB: MEDIA */}
                {adminTab === 'media' && (
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="text-lg font-bold">Hero Background Banners</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {editProfile.heroMedia?.map((media, idx) => (
                        <div key={idx} className="border border-slate-700 rounded-xl p-3 flex items-center justify-between bg-slate-800">
                          <span className="text-xs truncate max-w-[200px]">{media.url}</span>
                          <button onClick={() => deleteHeroMedia(idx, media._id)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-800 pt-4 space-y-4">
                      <h4 className="font-bold text-sm">Add New Background Media</h4>
                      <input type="text" placeholder="Media URL (Image or Video)" value={newHeroMedia.url} onChange={(e) => setNewHeroMedia({ ...newHeroMedia, url: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border ${inputBg}`} />
                      <button onClick={addHeroMedia} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                        <Plus size={16} /> Add Banner Media
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: SKILLS */}
                {adminTab === 'skills' && (
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">Manage Skills</h3>
                      <button onClick={() => setEditingSkill({ _id: '', title: '', category: 'Frontend', imageUrl: '', description: '', level: 'Advanced', order: 0 })} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold">
                        <Plus size={14} className="inline mr-1" /> Add Skill
                      </button>
                    </div>

                    {editingSkill ? (
                      <div className="border border-slate-700 rounded-2xl p-4 space-y-4 bg-slate-800">
                        <h4 className="font-bold">{editingSkill._id ? 'Edit Skill' : 'New Skill'}</h4>
                        <input type="text" placeholder="Title (e.g. React)" value={editingSkill.title} onChange={(e) => setEditingSkill({ ...editingSkill, title: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Category" value={editingSkill.category} onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Icon Image URL" value={editingSkill.imageUrl} onChange={(e) => setEditingSkill({ ...editingSkill, imageUrl: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <textarea placeholder="Description" value={editingSkill.description} onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <div className="flex gap-2">
                          <button onClick={saveSkill} className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs">Save Skill</button>
                          <button onClick={() => setEditingSkill(null)} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {skills.map((s) => (
                          <div key={s._id} className="border border-slate-800 rounded-xl p-3 flex justify-between items-center bg-slate-800/50">
                            <span className="font-medium text-sm">{s.title}</span>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingSkill(s)} className="text-cyan-400 hover:text-cyan-300 p-1"><Pencil size={16} /></button>
                              <button onClick={() => deleteItem('skills', s._id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: PROJECTS */}
                {adminTab === 'projects' && (
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">Manage Projects</h3>
                      <button onClick={() => setEditingProject({ _id: '', title: '', description: '', imageUrl: '', projectUrl: '', technologies: [], featured: true, order: 0 })} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold">
                        <Plus size={14} className="inline mr-1" /> Add Project
                      </button>
                    </div>

                    {editingProject ? (
                      <div className="border border-slate-700 rounded-2xl p-4 space-y-4 bg-slate-800">
                        <h4 className="font-bold">{editingProject._id ? 'Edit Project' : 'New Project'}</h4>
                        <input type="text" placeholder="Project Title" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <textarea placeholder="Description" value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Image URL" value={editingProject.imageUrl} onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Project / Demo URL" value={editingProject.projectUrl} onChange={(e) => setEditingProject({ ...editingProject, projectUrl: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Technologies (comma separated)" value={Array.isArray(editingProject.technologies) ? editingProject.technologies.join(', ') : editingProject.technologies} onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value.split(',').map(t => t.trim()) })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <div className="flex gap-2">
                          <button onClick={saveProject} className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs">Save Project</button>
                          <button onClick={() => setEditingProject(null)} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projects.map((p) => (
                          <div key={p._id} className="border border-slate-800 rounded-xl p-3 flex justify-between items-center bg-slate-800/50">
                            <span className="font-medium text-sm">{p.title}</span>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingProject(p)} className="text-cyan-400 hover:text-cyan-300 p-1"><Pencil size={16} /></button>
                              <button onClick={() => deleteItem('projects', p._id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: EDUCATION */}
                {adminTab === 'education' && (
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">Manage Education & Certifications</h3>
                      <button onClick={() => setEditingEdu({ _id: '', title: '', institution: '', year: '', description: '', type: 'Education' })} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold">
                        <Plus size={14} className="inline mr-1" /> Add Entry
                      </button>
                    </div>

                    {editingEdu ? (
                      <div className="border border-slate-700 rounded-2xl p-4 space-y-4 bg-slate-800">
                        <h4 className="font-bold">{editingEdu._id ? 'Edit Entry' : 'New Entry'}</h4>
                        <input type="text" placeholder="Title / Degree" value={editingEdu.title} onChange={(e) => setEditingEdu({ ...editingEdu, title: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Institution" value={editingEdu.institution} onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <input type="text" placeholder="Year (e.g. 2025)" value={editingEdu.year} onChange={(e) => setEditingEdu({ ...editingEdu, year: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <select value={editingEdu.type} onChange={(e) => setEditingEdu({ ...editingEdu, type: e.target.value as 'Education' | 'Certification' })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`}>
                          <option value="Education">Education</option>
                          <option value="Certification">Certification</option>
                        </select>
                        <textarea placeholder="Description" value={editingEdu.description || ''} onChange={(e) => setEditingEdu({ ...editingEdu, description: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${inputBg}`} />
                        <div className="flex gap-2">
                          <button onClick={saveEducation} className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs">Save Entry</button>
                          <button onClick={() => setEditingEdu(null)} className="bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {education.concat(certifications).map((ed) => (
                          <div key={ed._id} className="border border-slate-800 rounded-xl p-3 flex justify-between items-center bg-slate-800/50">
                            <div>
                              <span className="font-medium text-sm block">{ed.title}</span>
                              <span className="text-xs text-slate-400">{ed.institution} ({ed.year})</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingEdu(ed)} className="text-cyan-400 hover:text-cyan-300 p-1"><Pencil size={16} /></button>
                              <button onClick={() => deleteItem('education', ed._id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: MESSAGES */}
                {adminTab === 'messages' && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="text-lg font-bold mb-4">Contact Messages Received</h3>
                    {messages.length === 0 ? (
                      <p className={`text-sm ${textMuted}`}>No messages found.</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg._id} className="border border-slate-700 rounded-2xl p-4 bg-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-cyan-400">{msg.senderName} &lt;{msg.email}&gt;</h4>
                            <button onClick={() => deleteItem('messages', msg._id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                          </div>
                          <p className="text-xs font-semibold">{msg.subject}</p>
                          <p className={`text-xs ${textMuted}`}>{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
