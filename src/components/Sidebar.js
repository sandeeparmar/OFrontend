import React from 'react';
import {  Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Chatbot', href: '/chatbot' },
    { name: 'Visualisation' , href :'/testing'}
  ];

  if (user && user.role === 'admin') {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: '⚙️' });
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">

      <div className="flex top-0 items-center justify-center h-[6.5rem] px-7 py-[6.5] bg-gradient-to-r from-[#536976] to-[#BBD2C5]  shadow-lg border-b-4 border-blue-800 text-black">
       
        <div className="flex items-center gap-3">
          <div className="w-10 h-11 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
            <img 
              src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
              alt="Ocean Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center text-gray-700 text-xl 
             font-semibold mb-2 xs:mb-3 sm:mb-4  
             cursor-pointer hover:text-green-500 
             hover:bg-green-50 px-2 py-1 rounded-lg 
             transition-all duration-300 hover:scale-105 origin-left  ${
                location.pathname === item.href ? 'bg-ocean-light text-ocean-dark font-medium' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-ocean-medium rounded-full flex items-center justify-center text-white gap-3">
              <div className="text-black bg-gray-300 border-2 rounded-full shadow m-3
 ">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M12 13c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z"/>
                </svg>
              </div>


            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;