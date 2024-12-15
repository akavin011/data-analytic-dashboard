import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-60 h-screen bg-gray-900 text-white p-6">
            <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
            <ul className="list-none p-0 space-y-4">
                <li className="cursor-pointer hover:bg-gray-700 p-2 rounded">
                    <span className="text-gray-400 hover:text-white">Home</span>
                </li>
                <li className="cursor-pointer hover:bg-gray-700 p-2 rounded">
                    <span className="text-gray-400 hover:text-white">Analytics</span>
                </li>
                <li className="cursor-pointer hover:bg-gray-700 p-2 rounded">
                    <span className="text-gray-400 hover:text-white">Reports</span>
                </li>
                <li className="cursor-pointer hover:bg-gray-700 p-2 rounded">
                    <span className="text-gray-400 hover:text-white">Settings</span>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
