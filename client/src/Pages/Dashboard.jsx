import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import MainContent from '../Components/Maincontent';
import Navbar from '../Components/Navbar';
import { TbMessageChatbot } from "react-icons/tb";

const ChatbotIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const chatbotRef = useRef(null);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div>
            <div
                className="fixed bottom-4 right-4 p-3 bg-gray-200 text-black rounded-full shadow-lg cursor-pointer hover:bg-gray-300 transition"
                onClick={toggleChatbot}
                title="Chatbot"
            >
                <TbMessageChatbot size={30} color="blue" />
            </div>

            {isOpen && (
                <div
                    ref={chatbotRef}
                    className="fixed bottom-16 right-4 w-80 h-96 bg-white rounded-lg shadow-lg p-4"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Chatbot</h3>
                        <button
                            className="text-black font-bold"
                            onClick={toggleChatbot}
                        >
                            X
                        </button>
                    </div>

                    <iframe
                        src="https://aravindhprabu2005.github.io/botAI/"
                        title="Chatbot"
                        className="w-full h-full"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <MainContent />
                <ChatbotIcon />
            </div>
        </div>
    );
};

export default Dashboard;
