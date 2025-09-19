import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OceanLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" className="w-10 h-10">
    <defs>
      <linearGradient id="oceanGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#oceanGradient)" />
    <g opacity="0.9">
      <path d="M24 10C16 10 10 16 10 24C10 32 16 38 24 38C32 38 38 32 38 24C38 16 32 10 24 10Z" fill="#0EA5E9" fillOpacity="0.2" />
      <path d="M18 24C18 20.6863 20.6863 18 24 18C27.3137 18 30 20.6863 30 24C30 27.3137 27.3137 30 24 30C20.6863 30 18 27.3137 18 24Z" fill="white" fillOpacity="0.85" />
    </g>
    <path d="M24 14C18.4772 14 14 18.4772 14 24C14 29.5228 18.4772 34 24 34C29.5228 34 34 29.5228 34 24C34 18.4772 29.5228 14 24 14Z" stroke="white" strokeWidth="1.8" opacity="0.9" />
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const menuRef = useRef(null);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Chatbot', href: '/chatbot' },
    { name: 'Visualisation', href: '/testing' },
    { name: 'Analyse', href: '/analyse' },
    { name: 'Alert', href: '/alert' }
  ];

  if (user && user.role === 'admin') navigation.push({ name: 'Admin Panel', href: '/admin' });

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999]">
      {/* Decorative animated wave behind header */}
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-20 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#0369A1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <path fill="url(#g1)" d="M0,96L48,122.7C96,149,192,203,288,229.3C384,256,480,256,576,218.7C672,181,768,107,864,117.3C960,128,1056,224,1152,240C1248,256,1344,192,1392,160L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
      </div>

      <div className="backdrop-blur-md bg-gradient-to-r from-slate-900/60 via-sky-900/50 to-slate-900/60 border-b border-sky-700/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* left: logo + title */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-400/30 rounded-md p-1">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-700/20 blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 p-1 flex items-center justify-center shadow-md border border-sky-600/12">
                    <OceanLogo />
                  </div>
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-white font-extrabold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-sky-200">FloatChat</span>
                  <span className="text-xs text-sky-200/70">AI-powered ocean discovery</span>
                </div>
              </Link>
            </div>

            {/* center: nav (desktop) */}
            <nav className="hidden md:flex items-center gap-2" aria-label="Primary Navigation">
              {navigation.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-white bg-gradient-to-r from-sky-700/30 to-cyan-700/20 shadow-inner'
                        : 'text-sky-200/80 hover:text-white hover:bg-slate-800/30'
                    } focus:outline-none focus:ring-2 focus:ring-sky-400/20`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="z-10 relative">{item.name}</span>
                    <span className="absolute left-0 bottom-0 h-0.5 bg-cyan-400 transition-all duration-300" style={{ width: active ? '100%' : '0%' }} />
                  </Link>
                );
              })}
            </nav>

            {/* right: search + user */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-slate-800/40 border border-slate-700/30 rounded-full px-3 py-1 w-72 focus-within:ring-2 focus-within:ring-sky-500/30">
                <svg className="w-4 h-4 text-sky-200/70 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 1110.65 6.65a7 7 0 015.99 9.99z" />
                </svg>
                <input aria-label="Search" placeholder="Search dashboard..." className="bg-transparent text-sm text-sky-100 placeholder-sky-300/60 w-full focus:outline-none" />
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-3 bg-slate-800/40 px-3 py-1 rounded-lg border border-slate-700/30 shadow-sm">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-semibold">{user.username?.charAt(0)?.toUpperCase()}</div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white truncate max-w-[120px]">{user.username}</span>
                      <span className="text-xs text-sky-200/70 capitalize">{user.role}</span>
                    </div>
                  </div>

                  <div className="relative" ref={profileRef}>
                    <button onClick={() => setIsProfileOpen((s) => !s)} aria-expanded={isProfileOpen} aria-haspopup="true" className="p-2 rounded-md hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-sky-400/30" title="Account">
                      <svg className="w-6 h-6 text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z" />
                      </svg>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 rounded-lg shadow-[0_10px_30px_rgba(2,6,23,0.6)] py-1 z-[10000]">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-sky-100 hover:bg-slate-700/20">Profile</Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-sky-100 hover:bg-slate-700/20">Settings</Link>
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-rose-300 hover:bg-slate-700/20">Logout</button>
                      </div>
                    )}
                  </div>

                  <div className="md:hidden" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen((s) => !s)} aria-expanded={isMenuOpen} aria-controls="mobile-menu" className="p-2 rounded-md hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-sky-400/30">
                      <svg className="w-6 h-6 text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {isMenuOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-3 py-1 rounded-md bg-sky-600/95 text-white text-sm font-medium hover:opacity-95">Sign in</Link>
                  <Link to="/signup" className="px-3 py-1 rounded-md border border-sky-600/20 text-sky-200 text-sm hover:bg-slate-800/30">Sign up</Link>
                </div>
              )}
            </div>
          </div>

          {/* mobile menu (collapsible) */}
          <div id="mobile-menu" className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-2 pb-4 border-t border-slate-700/30 z-[9999]`}>
            <div className="px-3 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)} className={`block px-4 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === item.href ? 'bg-slate-800/40 text-white' : 'text-sky-200/80 hover:bg-slate-800/30 hover:text-white'}`}>
                  {item.name}
                </Link>
              ))}

              {user && (
                <div className="mt-2 px-4">
                  <div className="text-sm text-sky-100">Signed in as</div>
                  <div className="text-white font-semibold truncate">{user.username}</div>
                  <button onClick={logout} className="mt-3 w-full text-left px-4 py-2 rounded-md bg-rose-600/80 text-white">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floaty { 0% { transform: translateY(0px);} 50% { transform: translateY(-3px);} 100% { transform: translateY(0px);} }
        header svg { animation: floaty 6s ease-in-out infinite; }
      `}</style>
    </header>
  );
}
