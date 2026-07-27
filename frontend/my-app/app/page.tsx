"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Award, ExternalLink, 
  Lock, LogOut, Plus, Trash2, X, ShieldAlert 
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface HeroMedia { _id?: string; url: string; type: 'image' | 'video'; order: number; }
interface Profile { name: string; profession: string; about: string; heroMedia: HeroMedia[]; }
interface Skill { _id: string; title: string; category: string; imageUrl: string; description: string; level: string; order: number; }
interface Project { _id: string; title: string; description: string; imageUrl: string; projectUrl: string; repoUrl?: string; technologies: string[]; featured: boolean; order: number; }
interface Education { _id: string; title: string; institution: string; year: string; description?: string; type: 'Education' | 'Certification'; certificateUrl?: string; }
interface Message { _id: string; senderName: string; email: string; subject: string; message: string; createdAt: string; }

export default function PortfolioApp() {
  // --- STATE MANAGEMENT ---
  const [profile, setProfile] = useState<Profile>({
    name: 'Loading...',
    profession: 'Loading...',
    about: '',
    heroMedia: []
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Education[]>([]);
  
  // UI & Interaction States
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [contactForm, setContactForm] = useState({ senderName: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', msg: '' });

  // Admin Panel States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState<'profile' | 'skills' | 'projects' | 'education' | 'messages'>('profile');
  const [messages, setMessages] = useState<Message[]>([]);

  // Admin Form Editors
  const [editProfile, setEditProfile] = useState<Profile>(profile);
  const [newSkill, setNewSkill] = useState({ title: '', category: 'Web Development', imageUrl: '', description: '', level: 'Advanced', order: 0 });
  const [newProject, setNewProject] = useState({ title: '', description: '', imageUrl: '', projectUrl: '', repoUrl: '', technologies: 'React, Node.js', featured: true, order: 0 });
  const [newEdu, setNewEdu] = useState({ title: '', institution: '', year: '', description: '', type: 'Education' as 'Education' | 'Certification', certificateUrl: '' });

  const API_BASE = 'http://localhost:5000/api';

  // --- DATA FETCHING ---
  const fetchPortfolioData = async () => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setEditProfile(data.profile);
        }
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setEducation(Array.isArray(data.education) ? data.education : []);
        setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
      }
    } catch (err) {
      console.error("Failed to connect to backend server:", err);
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
    if (savedToken) setToken(savedToken);
  }, []);

  // --- 8-SECOND MEDIA ROTATION TIMER ---
  useEffect(() => {
    if (profile.heroMedia && profile.heroMedia.length > 0) {
      const timer = setInterval(() => {
        setActiveMediaIndex((prev) => (prev + 1) % profile.heroMedia.length);
      }, 8000); // 8 seconds per slide
      return () => clearInterval(timer);
    }
  }, [profile.heroMedia]);

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
        setContactStatus({ type: 'success', msg: 'Message sent successfully!' });
        setContactForm({ senderName: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus({ type: 'error', msg: 'Failed to send message.' });
      }
    } catch {
      setContactStatus({ type: 'error', msg: 'Network error. Make sure backend is running.' });
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

  const addSkill = async () => {
    if (!token) return;
    await fetch(`${API_BASE}/admin/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newSkill)
    });
    setNewSkill({ title: '', category: 'Web Development', imageUrl: '', description: '', level: 'Advanced', order: 0 });
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      
      {/* --- INLINE KEYFRAMES FOR WATER DROP ANIMATION --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waterDrop {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          60% { transform: translateY(50px) scale(0.8, 1.2); opacity: 1; }
          80% { transform: translateY(60px) scale(1.5, 0.5); opacity: 0.8; }
          100% { transform: translateY(60px) scale(0); opacity: 0; }
        }
        @keyframes rippleReveal {
          0%, 70% { filter: blur(4px); opacity: 0.3; transform: scale(0.98); }
          85% { filter: blur(0px); opacity: 1; transform: scale(1.02); text-shadow: 0 0 15px rgba(6,182,212,0.8); }
          100% { filter: blur(0px); opacity: 1; transform: scale(1); text-shadow: 0 0 0px transparent; }
        }
        .animate-drop { animation: waterDrop 3s infinite ease-in; }
        .animate-reveal { animation: rippleReveal 3s infinite ease-out; }
      `}} />

      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {profile.name.toUpperCase()}
        </a>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-300">
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          <a href="#skills" className="hover:text-cyan-400 transition-colors">Skills</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
          <a href="#education" className="hover:text-cyan-400 transition-colors">Education & Certs</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>
        <button 
          onClick={() => { setIsAdminOpen(true); if(token) fetchMessages(token); }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs px-3 py-1.5 rounded-full text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Lock size={14} className="text-cyan-400" /> Admin
        </button>
      </nav>

      {/* --- LANDING / HERO SECTION (Dynamic 8s Rotation) --- */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        {/* Background Media Slider */}
        <div className="absolute inset-0 z-0">
          {profile.heroMedia && profile.heroMedia.length > 0 ? (
            profile.heroMedia.map((media, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeMediaIndex ? 'opacity-30 scale-105' : 'opacity-0 scale-100'} transition-transform duration-[8000ms]`}
              >
                {media.type === 'video' ? (
                  <video src={media.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={media.url} alt="Hero background" className="w-full h-full object-cover" />
                )}
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Hero Content with Water Drop Reveal Animation */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Cool Effect Name */}
          <div className="relative mb-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              {profile.name}
            </h1>
            {/* The Falling Water Drop */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-4 bg-gradient-to-b from-cyan-300 to-blue-500 rounded-full animate-drop shadow-[0_0_10px_#06b6d4]" />
          </div>

          {/* Profession Revealed by Drop Impact */}
          <div className="mt-8 pt-2">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-widest text-cyan-400 uppercase animate-reveal border-b-2 border-cyan-500/30 pb-2 px-6 inline-block">
              {profile.profession}
            </h2>
          </div>

          <p id="about" className="mt-8 text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            {profile.about}
          </p>

          <div className="mt-10 flex gap-4">
            <a href="#projects" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5">
              View My Work
            </a>
            <a href="#contact" className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-8 py-3.5 rounded-full backdrop-blur-sm transition-all">
              Get in Touch
            </a>
          </div>
        </div>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-8 z-10 flex gap-2">
          {profile.heroMedia?.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveMediaIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeMediaIndex ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-600'}`} 
            />
          ))}
        </div>
      </section>

      {/* --- SKILLS SECTION (Clickable Divs with Images) --- */}
      <section id="skills" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Technical <span className="text-cyan-400">Skills</span></h2>
          <p className="text-slate-400 mt-3">Click on any skill card to view detailed proficiency and experience.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {skills.map((skill) => (
            <div 
              key={skill._id}
              onClick={() => setSelectedSkill(skill)}
              className="group bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-800/80 p-3 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src={skill.imageUrl} alt={skill.title} className="max-w-full max-h-full object-contain" />
              </div>
              <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{skill.title}</h3>
              <span className="text-xs text-slate-500 mt-1">{skill.category}</span>
              <span className="mt-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                {skill.level}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- SKILL DETAIL MODAL --- */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedSkill(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedSkill.imageUrl} alt={selectedSkill.title} className="w-12 h-12 object-contain bg-slate-800 p-2 rounded-lg" />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSkill.title}</h3>
                <span className="text-xs text-cyan-400 font-semibold">{selectedSkill.category} • {selectedSkill.level}</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-4">
              {selectedSkill.description}
            </p>
          </div>
        </div>
      )}

      {/* --- PROJECTS SECTION (Clickable Cards with External Redirects) --- */}
      <section id="projects" className="py-24 px-6 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Featured <span className="text-cyan-400">Projects</span></h2>
            <p className="text-slate-400 mt-3">Explore my latest full-stack applications and deployments.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div 
                key={project._id}
                onClick={() => window.open(project.projectUrl, '_blank')}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-1.5"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        {project.title}
                        <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies?.map((tech, idx) => (
                        <span key={idx} className="text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/50">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {project.repoUrl && (
                  <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800/80 flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235-1.911 1.235-3.221 0-4.609-2.807-5.624-5.479-5.921.43-.372.823-1.102.823-2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg> Source Code
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- EDUCATION & CERTIFICATIONS SECTION --- */}
      <section id="education" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Education & <span className="text-cyan-400">Certifications</span></h2>
          <p className="text-slate-400 mt-3">My academic background and professional accreditations.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Education Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-3">
              <GraduationCap className="text-cyan-400" /> Academic Background
            </h3>
            <div className="space-y-6 border-l-2 border-slate-800 pl-6 ml-2">
              {education.map((edu) => (
                <div key={edu._id} className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-950" />
                  <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">{edu.year}</span>
                  <h4 className="text-lg font-bold text-white mt-1">{edu.title}</h4>
                  <p className="text-sm font-medium text-slate-400">{edu.institution}</p>
                  {edu.description && <p className="text-xs text-slate-500 mt-2">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-3">
              <Award className="text-cyan-400" /> Certifications
            </h3>
            <div className="space-y-6 border-l-2 border-slate-800 pl-6 ml-2">
              {certifications.map((cert) => (
                <div key={cert._id} className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950" />
                  <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">{cert.year}</span>
                  <h4 className="text-lg font-bold text-white mt-1">{cert.title}</h4>
                  <p className="text-sm font-medium text-slate-400">{cert.institution}</p>
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

      {/* --- CONTACT FORM SECTION --- */}
      <section id="contact" className="py-24 px-6 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Get in <span className="text-cyan-400">Touch</span></h2>
            <p className="text-slate-400 mt-3">Have a question or want to work together? Send a direct message.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
              <input 
                type="text" required 
                value={contactForm.senderName} 
                onChange={(e) => setContactForm({...contactForm, senderName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" required 
                value={contactForm.email} 
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="john@example.com" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
              <input 
                type="text" required 
                value={contactForm.subject} 
                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Project Inquiry" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
              <textarea 
                rows={4} required 
                value={contactForm.message} 
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Hello, I'd like to discuss a project..." 
              />
            </div>

            {contactStatus.msg && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${contactStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {contactStatus.msg}
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} {profile.name}. Built with Next.js & Express. All rights reserved.
      </footer>


      {/* ==========================================
          COMPREHENSIVE ADMIN DASHBOARD MODAL
      ========================================== */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <ShieldAlert className="text-cyan-400" /> Portfolio Admin Control Panel
              </div>
              <div className="flex items-center gap-4">
                {token && (
                  <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold">
                    <LogOut size={14} /> Logout
                  </button>
                )}
                <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!token ? (
                /* --- LOGIN VIEW --- */
                <div className="max-w-sm mx-auto my-12 bg-slate-900 p-8 rounded-2xl border border-slate-800">
                  <h3 className="text-xl font-bold text-center mb-6">Admin Authentication</h3>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Username</label>
                      <input 
                        type="text" required
                        value={loginCreds.username}
                        onChange={(e) => setLoginCreds({...loginCreds, username: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" 
                        placeholder="admin"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
                      <input 
                        type="password" required
                        value={loginCreds.password}
                        onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})}
                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" 
                        placeholder="••••••••"
                      />
                    </div>
                    {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}
                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-lg transition-colors">
                      Authenticate
                    </button>
                  </form>
                </div>
              ) : (
                /* --- AUTHENTICATED DASHBOARD --- */
                <div>
                  {/* Dashboard Tabs */}
                  <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
                    {(['profile', 'skills', 'projects', 'education', 'messages'] as const).map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setAdminTab(tab)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider capitalize whitespace-nowrap transition-all ${adminTab === tab ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                      >
                        {tab} {tab === 'messages' && `(${messages?.length || 0})`}
                      </button>
                    ))}
                  </div>

                  {/* TAB 1: PROFILE & HERO MEDIA EDITOR */}
                  {adminTab === 'profile' && (
                    <div className="space-y-6 max-w-2xl">
                      <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">General Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400">Display Name</label>
                          <input type="text" value={editProfile.name} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Profession Title</label>
                          <input type="text" value={editProfile.profession} onChange={(e) => setEditProfile({...editProfile, profession: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">About Bio</label>
                        <textarea rows={3} value={editProfile.about} onChange={(e) => setEditProfile({...editProfile, about: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white" />
                      </div>

                      <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider pt-4 border-t border-slate-800">Hero Media (8-Sec Rotation Control)</h4>
                      <div className="space-y-3">
                        {editProfile.heroMedia?.map((media, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs font-bold text-slate-500 w-6">#{idx+1}</span>
                            <select 
                              value={media.type} 
                              onChange={(e) => {
                                const newMedia = [...(editProfile.heroMedia || [])];
                                newMedia[idx] = { ...newMedia[idx], type: e.target.value as 'image' | 'video' };
                                setEditProfile({...editProfile, heroMedia: newMedia});
                              }}
                              className="bg-slate-950 border border-slate-700 text-xs rounded p-1.5 text-white"
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                            <input 
                              type="text" 
                              value={media.url} 
                              onChange={(e) => {
                                const newMedia = [...(editProfile.heroMedia || [])];
                                newMedia[idx] = { ...newMedia[idx], url: e.target.value };
                                setEditProfile({...editProfile, heroMedia: newMedia});
                              }}
                              placeholder="Media URL..." 
                              className="flex-1 bg-slate-950 border border-slate-700 text-xs rounded p-1.5 text-white" 
                            />
                          </div>
                        ))}
                      </div>
                      <button onClick={updateProfile} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm">
                        Save Profile Changes
                      </button>
                    </div>
                  )}

                  {/* TAB 2: SKILLS MANAGER */}
                  {adminTab === 'skills' && (
                    <div className="space-y-8">
                      {/* Add New Skill Form */}
                      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase">Add New Skill Card</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input type="text" placeholder="Skill Title (e.g. React)" value={newSkill.title} onChange={(e)=>setNewSkill({...newSkill, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="Category (e.g. Web Dev)" value={newSkill.category} onChange={(e)=>setNewSkill({...newSkill, category: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="Image Icon URL" value={newSkill.imageUrl} onChange={(e)=>setNewSkill({...newSkill, imageUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                        </div>
                        <textarea placeholder="Detailed description for the modal view..." value={newSkill.description} onChange={(e)=>setNewSkill({...newSkill, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" rows={2} />
                        <button onClick={addSkill} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded text-xs flex items-center gap-1">
                          <Plus size={14} /> Add Skill
                        </button>
                      </div>

                      {/* Existing Skills List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {skills.map((s) => (
                          <div key={s._id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                              <img src={s.imageUrl} alt="" className="w-8 h-8 object-contain bg-slate-800 p-1 rounded" />
                              <div>
                                <h5 className="text-sm font-bold text-white">{s.title}</h5>
                                <span className="text-[10px] text-slate-500">{s.category}</span>
                              </div>
                            </div>
                            <button onClick={() => deleteItem('skills', s._id)} className="text-slate-500 hover:text-red-400 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PROJECTS MANAGER */}
                  {adminTab === 'projects' && (
                    <div className="space-y-8">
                      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase">Add New Project</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Project Title" value={newProject.title} onChange={(e)=>setNewProject({...newProject, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="Image URL" value={newProject.imageUrl} onChange={(e)=>setNewProject({...newProject, imageUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="Live Project URL (Redirect link)" value={newProject.projectUrl} onChange={(e)=>setNewProject({...newProject, projectUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="GitHub Repo URL (optional)" value={newProject.repoUrl} onChange={(e)=>setNewProject({...newProject, repoUrl: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                        </div>
                        <input type="text" placeholder="Technologies (comma separated e.g. React, Node.js)" value={newProject.technologies} onChange={(e)=>setNewProject({...newProject, technologies: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                        <textarea placeholder="Project Description..." value={newProject.description} onChange={(e)=>setNewProject({...newProject, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" rows={2} />
                        <button 
                          onClick={async () => {
                            if (!token) return;
                            const payload = { ...newProject, technologies: newProject.technologies.split(',').map(t=>t.trim()).filter(Boolean) };
                            await fetch(`${API_BASE}/admin/projects`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify(payload)
                            });
                            setNewProject({ title: '', description: '', imageUrl: '', projectUrl: '', repoUrl: '', technologies: 'React, Node.js', featured: true, order: 0 });
                            fetchPortfolioData();
                          }} 
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded text-xs flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Project
                        </button>
                      </div>

                      <div className="space-y-3">
                        {projects.map((p) => (
                          <div key={p._id} className="flex justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-800">
                            <div>
                              <h5 className="font-bold text-white text-sm">{p.title}</h5>
                              <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline">{p.projectUrl}</a>
                            </div>
                            <button onClick={() => deleteItem('projects', p._id)} className="text-slate-500 hover:text-red-400 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: EDUCATION & CERTS MANAGER */}
                  {adminTab === 'education' && (
                    <div className="space-y-8">
                      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase">Add Education / Certification</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <select value={newEdu.type} onChange={(e)=>setNewEdu({...newEdu, type: e.target.value as 'Education' | 'Certification'})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white">
                            <option value="Education">Education</option>
                            <option value="Certification">Certification</option>
                          </select>
                          <input type="text" placeholder="Title (Degree or Cert Name)" value={newEdu.title} onChange={(e)=>setNewEdu({...newEdu, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="Institution / Issuer" value={newEdu.institution} onChange={(e)=>setNewEdu({...newEdu, institution: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                          <input type="text" placeholder="Year (e.g. 2020 - 2024)" value={newEdu.year} onChange={(e)=>setNewEdu({...newEdu, year: e.target.value})} className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                        </div>
                        <input type="text" placeholder="Certificate Verification URL (Optional)" value={newEdu.certificateUrl} onChange={(e)=>setNewEdu({...newEdu, certificateUrl: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                        <button 
                          onClick={async () => {
                            if (!token) return;
                            await fetch(`${API_BASE}/admin/education`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify(newEdu)
                            });
                            setNewEdu({ title: '', institution: '', year: '', description: '', type: 'Education', certificateUrl: '' });
                            fetchPortfolioData();
                          }} 
                          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded text-xs flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Record
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[...education, ...certifications].map((item) => (
                          <div key={item._id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-cyan-400 mr-2">[{item.type}]</span>
                              <span className="font-bold text-white text-sm">{item.title}</span>
                              <span className="text-xs text-slate-500 ml-2">— {item.institution} ({item.year})</span>
                            </div>
                            <button onClick={() => deleteItem('education', item._id)} className="text-slate-500 hover:text-red-400 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: CONTACT MESSAGES INBOX */}
                  {adminTab === 'messages' && (
                    <div className="space-y-3">
                      {(!messages || messages.length === 0) ? (
                        <p className="text-center text-slate-500 py-12 text-sm">No contact messages received yet.</p>
                      ) : (
                        messages.map((m) => (
                          <div key={m._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-white text-sm">{m.senderName}</h5>
                                <a href={`mailto:${m.email}`} className="text-xs text-cyan-400 hover:underline">&lt;{m.email}&gt;</a>
                                <span className="text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-300">Subject: {m.subject}</p>
                              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded border border-slate-800/80 mt-2 whitespace-pre-wrap">{m.message}</p>
                            </div>
                            <button onClick={() => deleteItem('messages', m._id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 text-right shrink-0">
              <button onClick={() => setIsAdminOpen(false)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold">
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}