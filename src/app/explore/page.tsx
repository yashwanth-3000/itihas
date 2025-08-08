"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import VaporizeTextCycle, { Tag as VaporizeTag } from "@/components/ui/vaporize-text-cycle";
import { Home, MessageCircle, User, Compass, BookOpen, ArrowLeft, Sparkles, Telescope, Map, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Merriweather } from "next/font/google";

// Serif font for heritage vibe (must be module scope)
const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });

export default function ExplorePage() {
  const [currentPhase, setCurrentPhase] = useState<'input' | 'exploring'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkMode, setIsThinkMode] = useState(false);
  const [exploreTopic, setExploreTopic] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [headlineFontSize, setHeadlineFontSize] = useState(40);


  // Headline animation timings (ms)
  const HEADLINE_ANIM = {
    initialDelayMs: 3000,
    vaporizeDurationMs: 3200,
    fadeInDurationMs: 900,
    waitDurationMs: 1400,
  } as const;

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

  // Show line, start vapor after initialDelay, hide after vapor completes
  useEffect(() => {
    const total = HEADLINE_ANIM.initialDelayMs + HEADLINE_ANIM.vaporizeDurationMs + 200;
    const timer = setTimeout(() => setShowIntro(false), total);
    return () => clearTimeout(timer);
  }, []);

  // Fit headline to viewport to avoid clipping (bigger sizes; two-line friendly)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    let size = 44;
    if (w < 360) size = 24;
    else if (w < 420) size = 26;
    else if (w < 480) size = 28;
    else if (w < 640) size = 32;
    else if (w < 768) size = 38;
    else if (w < 1024) size = 48;
    else if (w < 1280) size = 60;
    else size = 68;
    setHeadlineFontSize(size);
  }, []);

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
          <div className="flex flex-col items-center min-h-screen px-4 pt-[20vh] md:pt-[22vh] lg:pt-[22vh]">
            {/* Vaporize headline at ~1/3 of page, then hide after ~2.6s */}
            {showIntro && (
              <div className={`w-full max-w-[1100px] mb-8 space-y-2 md:space-y-3 text-center ${merriweather.className}`}>
                <div className="w-full h-[60px] sm:h-[76px] md:h-[92px] lg:h-[104px]">
                  <VaporizeTextCycle
                    texts={["Uncover your lost stories, preserve your heritage"]}
                    font={{ fontFamily: "Merriweather, serif", fontSize: `${headlineFontSize}px`, fontWeight: 800 }}
                    color="rgba(255,255,255,0.98)"
                    spread={3}
                    density={4}
                    animation={{ vaporizeDuration: HEADLINE_ANIM.vaporizeDurationMs/1000, fadeInDuration: HEADLINE_ANIM.fadeInDurationMs/1000, waitDuration: HEADLINE_ANIM.waitDurationMs/1000, initialDelayMs: HEADLINE_ANIM.initialDelayMs }}
                    direction="left-to-right"
                    alignment="center"
                    tag={VaporizeTag.H1}
                  />
                </div>
                <div className="w-full h-[56px] sm:h-[72px] md:h-[88px] lg:h-[100px]">
                  <VaporizeTextCycle
                    texts={["and culture before it fades away."]}
                    font={{ fontFamily: "Merriweather, serif", fontSize: `${Math.max(28, headlineFontSize - 4)}px`, fontWeight: 700 }}
                    color="rgba(255,255,255,0.95)"
                    spread={3}
                    density={4}
                    animation={{ vaporizeDuration: HEADLINE_ANIM.vaporizeDurationMs/1000, fadeInDuration: HEADLINE_ANIM.fadeInDurationMs/1000, waitDuration: HEADLINE_ANIM.waitDurationMs/1000, initialDelayMs: HEADLINE_ANIM.initialDelayMs + 100 }}
                    direction="left-to-right"
                    alignment="center"
                    tag={VaporizeTag.H1}
                  />
                </div>
              </div>
            )}

            {/* Prompt box appears after intro with soft fade/slide */}
            {!showIntro && (
              <div className="w-full max-w-2xl animate-[promptIn_600ms_ease-out_both]">
                <PromptInputBox 
                  onSend={handleSendMessage}
                  placeholder="What would you like to explore? (e.g., 'How does quantum computing work?')"
                  isLoading={isLoading}
                  onThinkModeChange={handleThinkModeChange}
                  isThinkMode={isThinkMode}
                  className="bg-white/95 backdrop-blur-md border-2 border-orange-400/60 shadow-2xl ring-2 ring-yellow-400/30"
                />
              </div>
            )}

            <style jsx>{`
              @keyframes promptIn {
                0% { opacity: 0; transform: translateY(12px) scale(0.98); }
                60% { opacity: 1; transform: translateY(0) scale(1.01); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
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