import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-16 h-screen bg-transparent backdrop-blur-sm fixed left-0 top-0 flex flex-col items-center py-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-yellow-400 animate-pulse"></div>
        </div>
    );
};

export default Sidebar;
