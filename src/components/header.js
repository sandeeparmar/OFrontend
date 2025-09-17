import React from 'react';
import { Bot, MapPin, BarChart3, Globe, Thermometer } from 'lucide-react';

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

export const Header = () => {
    return (
        <div className="bg-gradient-to-r from-blue-400 to-cyan-600 shadow-lg px-6 py-5 md:py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer transform rotate-12">
                        <OceanLogo />
                    </div>
                    <div className="text-white">
                        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide drop-shadow-md">
                            FloatChat
                        </h1>
                        <p className="text-sm md:text-base font-light opacity-90 drop-shadow-sm">
                            AI-Powered Ocean Data Discovery
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
