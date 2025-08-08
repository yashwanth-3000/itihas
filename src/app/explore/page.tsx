"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Home, MessageCircle, User, Compass, BookOpen, ArrowLeft, Sparkles, Telescope, Map, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ExplorePage() {
  const [currentPhase, setCurrentPhase] = useState<'input' | 'exploring'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkMode, setIsThinkMode] = useState(false);
  const [exploreTopic, setExploreTopic] = useState('');

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Comics', url: '/comics', icon: BookOpen },
    { name: 'About', url: '/sharable-link', icon: User }
  ];



  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && !files?.length) return;
    
    setExploreTopic(message);
    setCurrentPhase('exploring');
    setIsLoading(true);
    
    // Simulate exploration process
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPhase('input');
    }, 3000);
  };

  const handleThinkModeChange = (newThinkMode: boolean) => {
    setIsThinkMode(newThinkMode);
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/explore.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <NavBar items={navItems} />
        
        {/* Input Phase */}
        {currentPhase === 'input' && (
          <div className="flex items-start justify-center min-h-screen px-4 pt-[25vh]">
            <div className="w-full max-w-2xl">
              <PromptInputBox 
                onSend={handleSendMessage}
                placeholder="What would you like to explore? (e.g., 'How does quantum computing work?')"
                isLoading={isLoading}
                onThinkModeChange={handleThinkModeChange}
                isThinkMode={isThinkMode}
                className="bg-white/95 backdrop-blur-md border-2 border-orange-400/60 shadow-2xl ring-2 ring-yellow-400/30"
              />
            </div>
          </div>
        )}

        {/* Exploring Phase */}
        {currentPhase === 'exploring' && (
          <div className="flex items-start justify-center min-h-screen px-4 pt-[25vh]">
            <div className="w-full max-w-2xl">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-lg font-medium text-gray-800">Exploring "{exploreTopic}"...</span>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
} 