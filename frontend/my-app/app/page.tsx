"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Award, ExternalLink, Lock, LogOut, Plus, Trash2, X, 
  ShieldAlert, Sun, Moon, Download, Mail, Send, 
  LayoutGrid, User, Code, Briefcase, MessageSquare, Globe, ChevronRight, 
  ArrowLeft, CheckCircle2, AlertCircle, Pencil, Menu, Image as ImageIcon, Film
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
    title: 'Sample Project',
    description: 'A full-stack web application built with React and Node.js.',
    technologies: ['React', 'Node.js', 'Tailwind CSS'],
    projectUrl: 'https://github.com/yourusername/project',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    featured: true,
    order: 1
  },
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
  { _id: 's12', title: 'Socket.io / WebSockets', category: 'Real-Time Tech', level: 'Advanced', order: 12, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg', description: 'Implementing bi-directional real-time communication for live chat, gaming platforms, and live telemetry dashboards.' },
  { _id: 's13', title: 'Docker', category: 'DevOps', level: 'Intermediate', order: 13, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', description: 'Containerizing full-stack applications to ensure consistent deployment across staging and production servers.' },
  { _id: 's14', title: 'REST & GraphQL APIs', category: 'Backend Architecture', level: 'Advanced', order: 14, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg', description: 'Building secure, scalable API endpoints with JSON Web Tokens (JWT), OAuth2, and rate-limiting.' },
  { _id: 's15', title: 'UI / UX Design (Figma)', category: 'Design', level: 'Advanced', order: 15, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', description: 'Wireframing user flows, interactive prototyping, and bridging aesthetic design with responsive frontend code.' },
  { _id: 's16', title: 'Payment Gateways (M-Pesa)', category: 'FinTech Integration', level: 'Expert', order: 16, imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg', description: 'Integrating M-Pesa STK push, automated callbacks, and Till/Paybill reconciliation APIs for seamless e-commerce checkout.' }
];

export default function PortfolioApp() {
  // --- STATE MANAGEMENT ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    name: 'Michael',
    profession: 'Full-Stack Software Developer, UI/UX Designer, Database Architect',
    about: 'I am a dedicated Full-Stack Software Engineer and UI/UX Designer specializing in building scalable web applications across modern JavaScript/TypeScript ecosystems (React, Next.js, Node.js).',
    profilePicUrl: '/profile.jpg',
    whatsappNumber: '254746323229',
    githubUsername: 'mikyza',
    githubRepo: 'portfolio',
    linkedinUrl: '',
    twitterUrl: '',
    heroMedia: []
  });
  
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [education, setEducation] = useState<Education[]>([
    { _id: 'e1', title: 'B.Sc. in Computer Science / Software Engineering', institution: 'University of Technology', year: '2021 - Present', description: 'Specialized in Software Architecture, Distributed Systems, Database Management Systems, and Algorithm Design.', type: 'Education' }
  ]);
  const [certifications, setCertifications] = useState<Education[]>([
    { _id: 'c1', title: 'Full-Stack Web Development Professional', institution: 'Accredited Tech Institute', year: '2024', description: 'Advanced training in React, Next.js, Node.js microservices, and Cloud Deployment.', type: 'Certification', certificateUrl: '' },
    { _id: 'c2', title: 'Linux Server Administration & DevOps', institution: 'Linux Foundation Training', year: '2023', description: 'Server security, bash scripting, containerization, and network troubleshooting.', type: 'Certification', certificateUrl: '' }
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

  // Admin Panel States
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
          // Normalize profile data to handle schema property variations
          const normalizedProfile = {
            ...data.profile,
            profilePicUrl: data.profile.profilePicUrl || data.profile.profilePic || '',
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
    const titles = profile.profession ? profile.profession.split(',').map(p => p.trim()).filter(Boolean) : ['Full-Stack Developer'];
    const fullText = titles[loopNum % titles.length];
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!isDeleting && displayedProfession === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedProfession === '') {
      setIsDeleting(false);
      setLoopNum((n) => n + 1);
    } else {
      timer = setTimeout(() => {
        setDisplayedProfession(isDeleting
          ? fullText.substring(0, displayedProfession.length - 1)
          : fullText.substring(0, displayedProfession.length + 1));
      }, isDeleting ? 40 : 100);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [displayedProfession, isDeleting, loopNum, profile.profession]);

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
      setContactStatus({ type: 'error', msg: 'Could not send your message. Please try again, or reach me on WhatsApp.' });
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

  // --- ADMIN CRUD ACTIONS ---
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

  // --- FULL CRUD FOR SKILLS ---
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

  // --- FULL CRUD FOR PROJECTS ---
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

  // --- FULL CRUD FOR EDUCATION ---
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

  // --- HERO MEDIA CRUD ---
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
      });
    } else {
      const updatedMedia = editProfile.heroMedia.filter((_, i) => i !== index);
      setEditProfile({ ...editProfile, heroMedia: updatedMedia });
      await fetch(`${API_BASE}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...editProfile, heroMedia: updatedMedia })
      });
    }
    fetchPortfolioData();
  };

  const deleteItem = async (endpoint: string, id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this item?')) return;
    await fetch(`${API_BASE}/admin/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPortfolioData();
    if (endpoint === 'messages') fetchMessages(token);
  };

  // --- VIEW LIMITS FOR INITIAL LANDING PAGE ---
  const displayedSkills = skills.slice(0, 8);
  const displayedProjects = projects.slice(0, 8);

  return (
    <div className={`min-h-screen scroll-smooth font-sans transition-colors duration-300 selection:bg-cyan-500 selection:text-black relative overflow-x-hidden ${bgMain}`}>
      
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

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className={`md:hidden p-2 rounded-full border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* STEALTH HIDDEN ADMIN DOT BUTTON */}
          <button 
            onClick={() => { setIsAdminOpen(true); if(token) fetchMessages(token); }}
            className="w-2 h-2 rounded-full bg-cyan-500/40 hover:bg-cyan-400 hover:scale-150 transition-all cursor-pointer shadow-sm"
            title="."
            aria-label="Admin Control Panel"
          />
        </div>
        {mobileNavOpen && (
          <div className={`md:hidden absolute top-full left-0 right-0 border-b px-6 py-4 flex flex-col gap-4 text-sm font-semibold ${isDarkMode ? 'bg-slate-950/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
            {[['About', '#about'], ['Skills', '#skills'], ['Projects', '#projects'], ['Education & Certs', '#education'], ['Contact', '#contact']].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMobileNavOpen(false)} className="hover:text-cyan-400 transition-colors">{label}</a>
            ))}
          </div>
        )}
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest ">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse motion-reduce:animate-none" /> Open to projects & full-time roles
            </div>

            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Hi, I&apos;m <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">{profile.name}</span>
            </h1>

            <div className="h-12 flex items-center justify-center lg:justify-start">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-cyan-400 tracking-wide font-mono flex items-center">
                <span>{displayedProfession}</span>
                <span className="w-0.5 h-7 bg-cyan-400 ml-1 animate-pulse motion-reduce:animate-none inline-block" aria-hidden="true" />
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
                href="https://github.com/mikyza/portfolio/blob/main/docs/Michael.docx?raw=true"
                download="Michael.docx"
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSkill(skill); } }}
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProjects.map((project) => (
              <div 
                key={project._id}
                onClick={() => window.open(project.projectUrl || project.repoUrl || '#', '_blank')}
                className={`group border rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 ${bgCard} ${bgCardHover}`}
              >
                <div>
                  <div className={`relative h-44 sm:h-48 w-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
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
                    {project.docsUrl && (
                      <a href={project.docsUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1">
                        <Code size={14} /> Docs
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projects.length > 8 && (
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

      {/* FULL-SCREEN ALL PROJECTS MODAL */}
      {showAllProjectsModal && (
        <div className={`fixed inset-0 z-50 overflow-y-auto p-6 transition-colors ${bgMain}`}>
          <div className="max-w-7xl mx-auto py-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12 border-b pb-6 border-slate-800">
              <div>
                <button 
                  onClick={() => setShowAllProjectsModal(false)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:underline mb-2"
                >
                  <ArrowLeft size={16} /> Back to Landing Page
                </button>
                <h2 className="text-3xl sm:text-5xl font-black">All <span className="text-cyan-400">Projects Gallery</span></h2>
              </div>
              <button 
                onClick={() => setShowAllProjectsModal(false)}
                className={`p-3 rounded-full border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div 
                  key={project._id}
                  onClick={() => window.open(project.projectUrl || project.repoUrl || '#', '_blank')}
                  className={`group border rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 ${bgCard} ${bgCardHover}`}
                >
                  <div>
                    <div className={`relative h-44 sm:h-48 w-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <img src={project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className={`text-base sm:text-lg font-bold group-hover:text-cyan-400 transition-colors flex items-center justify-between gap-1 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <span className="truncate">{project.title}</span>
                        <ExternalLink size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                      </h3>
                      <p className={`text-xs sm:text-sm line-clamp-3 mb-4 ${textMuted}`}>{project.description}</p>
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
                    {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1"><GithubIcon size={14} /> Code</a> : <span />}
                    <div className="flex items-center gap-3">
                      {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1"><Globe size={14} /> Demo</a>}
                      {project.docsUrl && <a href={project.docsUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 flex items-center gap-1"><Code size={14} /> Docs</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN ALL SKILLS MODAL */}
      {showAllSkillsModal && (
        <div className={`fixed inset-0 z-50 overflow-y-auto p-6 transition-colors ${bgMain}`}>
          <div className="max-w-7xl mx-auto py-12">
            <div className="flex justify-between items-center gap-4 mb-12 border-b pb-6 border-slate-800">
              <div>
                <button onClick={() => setShowAllSkillsModal(false)} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:underline mb-2">
                  <ArrowLeft size={16} /> Back to Landing Page
                </button>
                <h2 className="text-3xl sm:text-5xl font-black">All <span className="text-cyan-400">Technical Skills</span></h2>
              </div>
              <button onClick={() => setShowAllSkillsModal(false)} className={`p-3 rounded-full border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {skills.map((skill) => (
                <div key={skill._id} onClick={() => { setSelectedSkill(skill); setShowAllSkillsModal(false); }} className={`group border rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${bgCard} ${bgCardHover}`}>
                  <div className={`w-16 h-16 rounded-xl p-3 mb-4 flex items-center justify-center ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                    <img src={skill.imageUrl} alt={skill.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <h3 className={`font-bold transition-colors group-hover:text-cyan-400 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{skill.title}</h3>
                  <span className={`text-xs mt-1 ${textMuted}`}>{skill.category}</span>
                  <span className="mt-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">{skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDUCATION & CERTIFICATIONS SECTION */}
      <section id="education" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Education & <span className="text-cyan-400">Certifications</span></h2>
          <p className={`${textMuted} mt-3`}>My academic milestones and professional technical accreditations.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className={`p-8 rounded-2xl border ${bgCard}`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3 ${borderCol} ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              <GraduationCap className="text-cyan-400" /> Academic Background
            </h3>
            <div className={`space-y-6 border-l-2 pl-6 ml-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              {education.map((edu) => (
                <div key={edu._id} className="relative">
                  <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ${isDarkMode ? 'ring-slate-900' : 'ring-white'}`} />
                  <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">{edu.year}</span>
                  <h4 className={`text-base sm:text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{edu.title}</h4>
                  <p className={`text-sm font-medium ${textMuted}`}>{edu.institution}</p>
                  {edu.description && <p className="text-xs text-slate-500 mt-2">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className={`p-8 rounded-2xl border ${bgCard}`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3 ${borderCol} ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              <Award className="text-cyan-400" /> Accreditations & Certs
            </h3>
            <div className={`space-y-6 border-l-2 pl-6 ml-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
              {certifications.map((cert) => (
                <div key={cert._id} className="relative">
                  <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ${isDarkMode ? 'ring-slate-900' : 'ring-white'}`} />
                  <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">{cert.year}</span>
                  <h4 className={`text-base sm:text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cert.title}</h4>
                  <p className={`text-sm font-medium ${textMuted}`}>{cert.institution}</p>
                  {cert.description && <p className="text-xs text-slate-500 mt-2">{cert.description}</p>}
                  {cert.certificateUrl && (
                    <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-2 font-semibold">
                      View Certificate <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section id="contact" className={`py-24 px-6 border-t ${borderCol} ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-100/60'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Get in <span className="text-cyan-400">Touch</span></h2>
            <p className={`${textMuted} mt-3`}>Have a project inquiry, job opportunity, or question? Send a direct message below.</p>
          </div>

          <form onSubmit={handleContactSubmit} className={`space-y-5 border p-6 sm:p-8 rounded-2xl shadow-xl ${bgCard}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Your Name</label>
                <input 
                  type="text" required 
                  value={contactForm.senderName} 
                  onChange={(e) => setContactForm({...contactForm, senderName: e.target.value})}
                  className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors border ${inputBg}`}
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Email Address</label>
                <input 
                  type="email" required 
                  value={contactForm.email} 
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors border ${inputBg}`}
                  placeholder="john@example.com" 
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Subject</label>
              <input 
                type="text" required 
                value={contactForm.subject} 
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors border ${inputBg}`}
                placeholder="Project Inquiry / Job Offer" 
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Message</label>
              <textarea 
                rows={5} required 
                value={contactForm.message} 
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                className={`w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors border resize-none ${inputBg}`}
                placeholder="Hello Michael, I'd like to discuss building a web application..." 
              />
            </div>

            {contactStatus.msg && (
              <div className={`p-4 rounded-lg text-xs font-semibold flex items-center gap-2 border ${contactStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {contactStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {contactStatus.msg}
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-8 text-center text-xs border-t flex flex-col items-center justify-center gap-3 ${borderCol} ${textMuted}`}>
        <div className="flex gap-4">
          {profile.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="hover:text-cyan-400"><GithubIcon size={16} /></a>}
          {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400"><LinkedinIcon size={16} /></a>}
          {profile.twitterUrl && <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400"><TwitterIcon size={16} /></a>}
        </div>
        <span>© {new Date().getFullYear()} {profile.name}. Built with Next.js, TypeScript & Tailwind CSS. All rights reserved.</span>
      </footer>

      {/* TWO-PANEL ADMIN DASHBOARD MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 font-bold text-base sm:text-lg text-white">
                <ShieldAlert className="text-cyan-400" /> Portfolio Control Center
              </div>
              <div className="flex items-center gap-4">
                {token && (
                  <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                    <LogOut size={14} /> Logout
                  </button>
                )}
                <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={22} />
                </button>
              </div>
            </div>

            {!token ? (
              <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                <div className="max-w-sm w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">Admin Authentication</h3>
                    <p className="text-xs text-slate-400 mt-1">Enter your credentials to manage website content.</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Username</label>
                      <input 
                        type="text" required
                        value={loginCreds.username}
                        onChange={(e) => setLoginCreds({...loginCreds, username: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
                        placeholder="admin"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
                      <input 
                        type="password" required
                        value={loginCreds.password}
                        onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" 
                        placeholder="••••••••"
                      />
                    </div>
                    {loginError && <p className="text-xs text-red-400 text-center font-semibold">{loginError}</p>}
                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-500/20">
                      Authenticate
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="w-full md:w-64 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 p-3 shrink-0 flex md:flex-col gap-1 overflow-x-auto">
                  <div className="hidden md:block text-[10px] font-bold text-slate-500 uppercase px-3 py-2 tracking-wider">Navigation Menu</div>
                  
                  {[
                    { id: 'profile', label: 'Profile & URLs', icon: User },
                    { id: 'media', label: `Hero Media (${editProfile.heroMedia?.length || 0})`, icon: ImageIcon },
                    { id: 'skills', label: 'Skills Manager', icon: Code },
                    { id: 'projects', label: 'Projects & Links', icon: LayoutGrid },
                    { id: 'education', label: 'Education & Certs', icon: Briefcase },
                    { id: 'messages', label: `Messages (${messages?.length || 0})`, icon: MessageSquare }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button 
                        key={tab.id}
                        onClick={() => {
                          setAdminTab(tab.id as any);
                          setEditingSkill(null);
                          setEditingProject(null);
                          setEditingEdu(null);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap text-left ${adminTab === tab.id ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <Icon size={16} /> {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
                  {adminTab === 'profile' && (
                    <div className="space-y-6 max-w-3xl">
                      <div className="border-b border-slate-800 pb-3">
                        <h4 className="text-base font-bold text-white">General Profile & Contact Information</h4>
                        <p className="text-xs text-slate-400">Update your public landing page details, avatar picture, and social links.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">Display Name</label>
                          <input type="text" value={editProfile.name} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">Profession Titles (Comma separated)</label>
                          <input type="text" value={editProfile.profession} onChange={(e) => setEditProfile({...editProfile, profession: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 font-semibold">About Bio</label>
                        <textarea rows={4} value={editProfile.about} onChange={(e) => setEditProfile({...editProfile, about: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">Profile Picture URL</label>
                          <input type="text" value={editProfile.profilePicUrl || ''} onChange={(e) => setEditProfile({...editProfile, profilePicUrl: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">WhatsApp Phone Number</label>
                          <input type="text" value={editProfile.whatsappNumber || ''} onChange={(e) => setEditProfile({...editProfile, whatsappNumber: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">GitHub Username</label>
                          <input type="text" value={editProfile.githubUsername || ''} onChange={(e) => setEditProfile({...editProfile, githubUsername: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">GitHub Repo Name</label>
                          <input type="text" value={editProfile.githubRepo || ''} onChange={(e) => setEditProfile({...editProfile, githubRepo: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">LinkedIn Profile URL</label>
                          <input type="text" value={editProfile.linkedinUrl || ''} onChange={(e) => setEditProfile({...editProfile, linkedinUrl: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold">Twitter / X Profile URL</label>
                          <input type="text" value={editProfile.twitterUrl || ''} onChange={(e) => setEditProfile({...editProfile, twitterUrl: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                        </div>
                      </div>

                      <button onClick={updateProfile} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20">
                        Save Profile Changes
                      </button>
                    </div>
                  )}

                  {adminTab === 'media' && (
                    <div className="space-y-8 max-w-4xl">
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                        <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Add Hero Slideshow Background</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input type="text" placeholder="Media URL (Image or MP4)" value={newHeroMedia.url} onChange={(e) => setNewHeroMedia({...newHeroMedia, url: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white sm:col-span-2" />
                          <select value={newHeroMedia.type} onChange={(e) => setNewHeroMedia({...newHeroMedia, type: e.target.value as 'image' | 'video'})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white">
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-4">
                          <input type="number" placeholder="Order (e.g. 1)" value={newHeroMedia.order || ''} onChange={(e) => setNewHeroMedia({...newHeroMedia, order: parseInt(e.target.value) || 0})} className="w-32 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <button onClick={addHeroMedia} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                            <Plus size={16} /> Add Media Banner
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(editProfile.heroMedia || []).map((media, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-between p-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-16 h-12 rounded bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden">
                                {media.type === 'video' ? <Film size={20} className="text-cyan-400" /> : <img src={media.url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">{media.url}</p>
                                <span className="text-[10px] text-cyan-400 uppercase">Type: {media.type} | Order: {media.order || 0}</span>
                              </div>
                            </div>
                            <button onClick={() => deleteHeroMedia(idx, media._id)} className="text-slate-500 hover:text-red-400 p-2 shrink-0">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === 'skills' && (
                    <div className="space-y-8 max-w-4xl">
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{editingSkill ? 'Edit Skill Card' : 'Add New Skill Card'}</h4>
                          {editingSkill && <button onClick={() => setEditingSkill(null)} className="text-xs text-red-400 hover:underline">Cancel Edit</button>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <input type="text" placeholder="Skill Title" value={editingSkill ? editingSkill.title : newSkill.title} onChange={(e) => editingSkill ? setEditingSkill({...editingSkill, title: e.target.value}) : setNewSkill({...newSkill, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Category" value={editingSkill ? editingSkill.category : newSkill.category} onChange={(e) => editingSkill ? setEditingSkill({...editingSkill, category: e.target.value}) : setNewSkill({...newSkill, category: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Level (e.g. Expert)" value={editingSkill ? editingSkill.level : newSkill.level} onChange={(e) => editingSkill ? setEditingSkill({...editingSkill, level: e.target.value}) : setNewSkill({...newSkill, level: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="number" placeholder="Order Number" value={editingSkill ? editingSkill.order : newSkill.order || ''} onChange={(e) => editingSkill ? setEditingSkill({...editingSkill, order: parseInt(e.target.value) || 0}) : setNewSkill({...newSkill, order: parseInt(e.target.value) || 0})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                        </div>
                        <input type="text" placeholder="Image Icon URL" value={editingSkill ? editingSkill.imageUrl : newSkill.imageUrl} onChange={(e) => editingSkill ? setEditingSkill({...editingSkill, imageUrl: e.target.value}) : setNewSkill({...newSkill, imageUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                        <textarea placeholder="Detailed description..." value={editingSkill ? editingSkill.description : newSkill.description} onChange={(e) => editingSkill ? setEditingSkill({...editingSkill, description: e.target.value}) : setNewSkill({...newSkill, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white resize-none" rows={2} />
                        <button onClick={saveSkill} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                          <Plus size={16} /> {editingSkill ? 'Update Skill' : 'Add Skill to Grid'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {skills.map((s) => (
                          <div key={s._id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                              <img src={s.imageUrl} alt="" className="w-10 h-10 object-contain bg-slate-800 p-1 rounded-lg" />
                              <div>
                                <h5 className="text-sm font-bold text-white">{s.title} <span className="text-[10px] text-slate-500">#{s.order}</span></h5>
                                <span className="text-[10px] text-slate-400">{s.category} • {s.level}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingSkill(s)} className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800"><Pencil size={16} /></button>
                              <button onClick={() => deleteItem('skills', s._id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === 'projects' && (
                    <div className="space-y-8 max-w-4xl">
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{editingProject ? 'Edit Project' : 'Add New Project with Multiple Links'}</h4>
                          {editingProject && <button onClick={() => setEditingProject(null)} className="text-xs text-red-400 hover:underline">Cancel Edit</button>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Project Title" value={editingProject ? editingProject.title : newProject.title} onChange={(e) => editingProject ? setEditingProject({...editingProject, title: e.target.value}) : setNewProject({...newProject, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Image URL" value={editingProject ? editingProject.imageUrl : newProject.imageUrl} onChange={(e) => editingProject ? setEditingProject({...editingProject, imageUrl: e.target.value}) : setNewProject({...newProject, imageUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Live Project URL" value={editingProject ? editingProject.projectUrl : newProject.projectUrl} onChange={(e) => editingProject ? setEditingProject({...editingProject, projectUrl: e.target.value}) : setNewProject({...newProject, projectUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="GitHub Repo URL" value={editingProject ? editingProject.repoUrl || '' : newProject.repoUrl} onChange={(e) => editingProject ? setEditingProject({...editingProject, repoUrl: e.target.value}) : setNewProject({...newProject, repoUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Live Demo URL" value={editingProject ? editingProject.demoUrl || '' : newProject.demoUrl} onChange={(e) => editingProject ? setEditingProject({...editingProject, demoUrl: e.target.value}) : setNewProject({...newProject, demoUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Docs URL" value={editingProject ? editingProject.docsUrl || '' : newProject.docsUrl} onChange={(e) => editingProject ? setEditingProject({...editingProject, docsUrl: e.target.value}) : setNewProject({...newProject, docsUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Technologies (comma separated)" value={editingProject ? (Array.isArray(editingProject.technologies) ? editingProject.technologies.join(', ') : editingProject.technologies) : newProject.technologies} onChange={(e) => editingProject ? setEditingProject({...editingProject, technologies: e.target.value.split(',').map(t => t.trim())}) : setNewProject({...newProject, technologies: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white sm:col-span-2" />
                          <input type="number" placeholder="Order" value={editingProject ? editingProject.order : newProject.order || ''} onChange={(e) => editingProject ? setEditingProject({...editingProject, order: parseInt(e.target.value) || 0}) : setNewProject({...newProject, order: parseInt(e.target.value) || 0})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                        </div>
                        <textarea placeholder="Project Description..." value={editingProject ? editingProject.description : newProject.description} onChange={(e) => editingProject ? setEditingProject({...editingProject, description: e.target.value}) : setNewProject({...newProject, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white resize-none" rows={3} />
                        <button onClick={saveProject} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                          <Plus size={16} /> {editingProject ? 'Update Project' : 'Add Project'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {projects.map((p) => (
                          <div key={p._id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <div>
                              <h5 className="text-sm font-bold text-white truncate w-48">{p.title}</h5>
                              <span className="text-[10px] text-slate-400">Order: {p.order}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingProject(p)} className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800"><Pencil size={16} /></button>
                              <button onClick={() => deleteItem('projects', p._id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === 'education' && (
                    <div className="space-y-8 max-w-4xl">
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{editingEdu ? 'Edit Entry' : 'Add Education / Certification'}</h4>
                          {editingEdu && <button onClick={() => setEditingEdu(null)} className="text-xs text-red-400 hover:underline">Cancel Edit</button>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Title / Degree" value={editingEdu ? editingEdu.title : newEdu.title} onChange={(e) => editingEdu ? setEditingEdu({...editingEdu, title: e.target.value}) : setNewEdu({...newEdu, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Institution" value={editingEdu ? editingEdu.institution : newEdu.institution} onChange={(e) => editingEdu ? setEditingEdu({...editingEdu, institution: e.target.value}) : setNewEdu({...newEdu, institution: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <input type="text" placeholder="Year (e.g. 2024)" value={editingEdu ? editingEdu.year : newEdu.year} onChange={(e) => editingEdu ? setEditingEdu({...editingEdu, year: e.target.value}) : setNewEdu({...newEdu, year: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                          <select value={editingEdu ? editingEdu.type : newEdu.type} onChange={(e) => editingEdu ? setEditingEdu({...editingEdu, type: e.target.value as 'Education' | 'Certification'}) : setNewEdu({...newEdu, type: e.target.value as 'Education' | 'Certification'})} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white">
                            <option value="Education">Education</option>
                            <option value="Certification">Certification</option>
                          </select>
                        </div>
                        <input type="text" placeholder="Certificate URL (Optional)" value={editingEdu ? editingEdu.certificateUrl || '' : newEdu.certificateUrl} onChange={(e) => editingEdu ? setEditingEdu({...editingEdu, certificateUrl: e.target.value}) : setNewEdu({...newEdu, certificateUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                        <textarea placeholder="Description..." value={editingEdu ? editingEdu.description : newEdu.description} onChange={(e) => editingEdu ? setEditingEdu({...editingEdu, description: e.target.value}) : setNewEdu({...newEdu, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white resize-none" rows={2} />
                        <button onClick={saveEducation} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                          <Plus size={16} /> {editingEdu ? 'Update Entry' : 'Add Entry'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {[...education, ...certifications].map((e) => (
                          <div key={e._id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <div>
                              <h5 className="text-sm font-bold text-white truncate w-48">{e.title}</h5>
                              <span className="text-[10px] text-slate-400">{e.type} • {e.year}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingEdu(e)} className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800"><Pencil size={16} /></button>
                              <button onClick={() => deleteItem('education', e._id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === 'messages' && (
                    <div className="space-y-4 max-w-4xl">
                      <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Contact Messages</h4>
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-500 p-8 border border-slate-800 rounded-xl bg-slate-900">No messages found.</div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                            <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-3">
                              <div>
                                <h5 className="font-bold text-white">{msg.subject}</h5>
                                <p className="text-xs text-slate-400 mt-1">From: <span className="text-cyan-400">{msg.senderName}</span> ({msg.email})</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
                                <button onClick={() => deleteItem('messages', msg._id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`} className="mt-4 inline-flex items-center gap-1.5 text-xs text-black font-bold bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-lg transition-colors">
                              <Mail size={14} /> Reply to {msg.senderName.split(' ')[0]}
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
