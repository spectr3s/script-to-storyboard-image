
import React, { useState } from 'react';
import { AppTab } from './types';
import Header from './components/Header';
import StoryboardGenerator from './components/StoryboardGenerator';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Storyboard);

  return (
    <div className="min-h-screen bg-base-100 font-sans flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === AppTab.Storyboard && <StoryboardGenerator />}
        {activeTab === AppTab.Chat && <Chatbot />}
      </main>
      <footer className="text-center p-4 text-content-200 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
