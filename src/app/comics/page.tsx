"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Home, MessageCircle, User, Compass, BookOpen } from "lucide-react";
import { useState } from "react";

export default function ComicsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkMode, setIsThinkMode] = useState(false);

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Comics', url: '/comics', icon: BookOpen },
    { name: 'About', url: '/sharable-link', icon: User }
  ];

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && !files?.length) return;
    
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      console.log('Comic creation request:', message);
      if (files) console.log('Files:', files);
      setIsLoading(false);
    }, 1000);
  };

  const handleThinkModeChange = (newThinkMode: boolean) => {
    setIsThinkMode(newThinkMode);
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/comic.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10">
        <NavBar items={navItems} comicTheme={true} />
        
        {/* Main Content - Centered Prompt */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-2xl">
            <PromptInputBox 
              onSend={handleSendMessage}
              placeholder="Create a comic, tell a story, or start an interactive adventure..."
              isLoading={isLoading}
              onThinkModeChange={handleThinkModeChange}
              isThinkMode={isThinkMode}
              className="bg-white/95 backdrop-blur-md border-2 border-orange-400/60 shadow-2xl ring-2 ring-yellow-400/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 