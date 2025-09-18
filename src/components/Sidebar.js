// Navbar.jsx
import React from 'react';
import {  Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OceanLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 text-white transform -rotate-45">
    <path d="M12 21L12 3M12 3L14.75 6M12 3L9.25 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21L14.75 18M12 21L9.25 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12L3 12M21 12L18 9.25M21 12L18 14.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12L6 9.25M3 12L6 14.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Chatbot', href: '/chatbot' },
    { name: 'Visualisation', href: '/testing' },
    {name :'Analyse' , href :'/analyse'} ,
    {name :'Changes' ,href :'/alert' }
  ];

  if (user && user.role === 'admin') {
    navigation.push({ name: 'Admin Panel', href: '/admin' });
  }

  return (
    <header className="fixed top-0 w-full bg-gradient-to-r from-[#373B44] to-[#4286f4] shadow-md z-50 ">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer transform rotate-12">
            <OceanLogo />
          </div>
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wide drop-shadow-md">FloatChat</h1>
            <p className="text-sm md:text-base font-light opacity-90 drop-shadow-sm">AI-Powered Ocean Data Discovery</p>
          </div>
        </div>

      
        <nav className="flex gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-green-300 ${
                location.pathname === item.href ? 'underline underline-offset-4 text-green-200' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M12 13c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium">{user.username}</p>
                <p className="text-xs capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 hover:text-red-400"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 
                   0 01-3 3H6a3 3 0 01-3-3V7a3 3 
                   0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      
      </div>

    </header>
  );
};
export default Navbar;