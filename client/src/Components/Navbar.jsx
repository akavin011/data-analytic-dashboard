import React from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    
    // Don't show navbar on home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <nav className="bg-transparent text-white p-6">
            <div className="container mx-auto">
                <h1 className="text-5xl font-extrabold tracking-wider text-center relative">
                    <span className="text-blue-400 animate-pulse">Data</span>
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-transparent bg-clip-text hover:scale-105 transition-transform">
                        matic
                    </span>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"></div>
                </h1>
            </div>
        </nav>
    );
};

export default Navbar;
