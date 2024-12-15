import React from 'react';

const Navbar = () => {
    return (
        <nav className="bg-gray-900 text-white p-4 mb-20">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo with custom styling */}
                <h1 className="text-4xl font-bold tracking-widest">
                    <span className="text-blue-400">Data</span><span className="text-yellow-400">matic</span>
                </h1>
                <ul className="flex space-x-4">
                    <li>
                        <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600">
                            Admin
                        </button>
                    </li>

                    <li>
                        <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600">
                            Login
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
