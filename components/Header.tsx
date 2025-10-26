
import React from 'react';
import { AppTab } from '../types';
import ClapperboardIcon from './icons/ClapperboardIcon';
import ChatIcon from './icons/ChatIcon';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: AppTab.Storyboard, label: 'Storyboard Generator', icon: <ClapperboardIcon /> },
    { id: AppTab.Chat, label: 'Chat Assistant', icon: <ChatIcon /> },
  ];

  return (
    <header className="bg-base-200 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img src="https://www.gstatic.com/devrel-devsite/v132c91823cf0a8525b7415395786f05b5e135832a879038fad3721a37c49b56f/gemini/images/gemini-wordmark.svg" alt="Gemini Logo" className="h-6" />
            <h1 className="text-xl font-bold text-white">Storyboard AI</h1>
          </div>
          <nav className="flex space-x-2 bg-base-300 p-1 rounded-lg">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-brand-primary text-white'
                    : 'text-content-100 hover:bg-base-200 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
