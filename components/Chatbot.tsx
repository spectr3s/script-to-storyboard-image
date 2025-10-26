
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import Spinner from './Spinner';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = geminiService.createChat();
    setMessages([{
        role: 'model',
        content: 'Hello! How can I help you with your script or filmmaking questions today?'
    }]);
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.sendMessage(chatRef.current, input);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-base-200 rounded-lg shadow-xl animate-fade-in">
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white"><BotIcon /></div>}
              <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-base-300 text-content-100'}`}>
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-white"><UserIcon /></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white"><BotIcon /></div>
              <div className="max-w-md p-3 rounded-lg bg-base-300 text-content-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-content-200 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-content-200 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-content-200 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-base-300">
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-grow bg-base-300 border border-base-100 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Spinner /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
