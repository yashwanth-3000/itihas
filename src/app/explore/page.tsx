"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { AnimatedTestimonials } from "@/components/ui";
import VaporizeTextCycle, { Tag as VaporizeTag } from "@/components/ui/vaporize-text-cycle";
import { Home, MessageCircle, User, Compass } from "lucide-react";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
// Apple system font stack for a clean, native feel
const APPLE_SYSTEM_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, system-ui, sans-serif";

export default function ExplorePage() {
  const router = useRouter();
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
    { name: 'Communities', url: '/explore/communities', icon: User },
    { name: 'About', url: '/sharable-link', icon: User }
  ];



  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && !files?.length) return;
    // Navigate to dedicated results page with query param
    const q = encodeURIComponent(message.trim());
    router.push(`/explore/results?q=${q}`);
  };

  const handleThinkModeChange = (newThinkMode: boolean) => {
    setIsThinkMode(newThinkMode);
  };

  // Show line, start vapor after initialDelay, hide after vapor completes
  useEffect(() => {
    // Keep intro visible long enough for the single bottom line to vaporize
    const total = HEADLINE_ANIM.initialDelayMs + HEADLINE_ANIM.vaporizeDurationMs + 200;
    const timer = setTimeout(() => setShowIntro(false), total);
    return () => clearTimeout(timer);
  }, []);

  // Fit headline to viewport to avoid clipping (bigger sizes; two-line friendly)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    let size = 52;
    if (w < 360) size = 30;
    else if (w < 420) size = 32;
    else if (w < 480) size = 34;
    else if (w < 640) size = 40;
    else if (w < 768) size = 48;
    else if (w < 1024) size = 60;
    else if (w < 1280) size = 74;
    else size = 88;
    setHeadlineFontSize(size);
  }, []);

  const isExploring = currentPhase === 'exploring';

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${isExploring ? '/background.png' : '/explore.png'})`,
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
          <div className="flex flex-col items-center min-h-screen px-4 pt-[15vh] md:pt-[17vh] lg:pt-[17vh]">

            {/* Prompt box visible from the start (no entrance animation) */}
            <div className="w-full max-w-2xl">
              <PromptInputBox 
                onSend={handleSendMessage}
                placeholder="What would you like to explore? (e.g., 'Locate all the temples around me')"
                isLoading={isLoading}
                onThinkModeChange={handleThinkModeChange}
                isThinkMode={isThinkMode}
                className="bg-white/95 backdrop-blur-md border-2 border-orange-400/60 shadow-2xl ring-2 ring-yellow-400/30"
                // Explore: Search always on, hide Think/Logs, show Location button, auto-detect location
                searchAlwaysOn
                hideThinkAndLogs
                showLocationButton
                autoDetectLocation
              />
            </div>



            {/* Single vanishing line - below prompt box */}
            {showIntro && (
              <div className="w-full max-w-[1100px] mt-6 text-center">
                <div className="w-full h-[64px] sm:h-[84px] md:h-[104px] lg:h-[120px]">
                  <VaporizeTextCycle
                    texts={["Save your culture before it fades away."]}
                    font={{ fontFamily: APPLE_SYSTEM_FONT, fontSize: `${headlineFontSize}px`, fontWeight: 800 }}
                    color="rgba(255,255,255,0.95)"
                    spread={3}
                    density={4}
                    animation={{
                      vaporizeDuration: HEADLINE_ANIM.vaporizeDurationMs/1000,
                      fadeInDuration: HEADLINE_ANIM.fadeInDurationMs/1000,
                      waitDuration: HEADLINE_ANIM.waitDurationMs/1000,
                      initialDelayMs: HEADLINE_ANIM.initialDelayMs,
                    }}
                    direction="left-to-right"
                    alignment="center"
                    tag={VaporizeTag.H1}
                  />
                </div>
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
          <div className="flex items-start justify-center min-h-screen px-4 pt-[18vh]">
            <div className="w-full max-w-5xl">
              <AnimatedTestimonials
                autoplay
                testimonials={[
                  {
                    quote:
                      `Exploring: ${exploreTopic}. The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.`,
                    name: "Sarah Chen",
                    designation: "Product Manager at TechFlow",
                    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1600&auto=format&fit=crop",
                  },
                  {
                    quote:
                      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
                    name: "Michael Rodriguez",
                    designation: "CTO at InnovateSphere",
                    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1600&auto=format&fit=crop",
                  },
                  {
                    quote:
                      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
                    name: "Emily Watson",
                    designation: "Operations Director at CloudScale",
                    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=1600&auto=format&fit=crop",
                  },
                  {
                    quote:
                      "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
                    name: "James Kim",
                    designation: "Engineering Lead at DataPro",
                    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=1600&auto=format&fit=crop",
                  },
                  {
                    quote:
                      "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
                    name: "Lisa Thompson",
                    designation: "VP of Technology at FutureNet",
                    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=1600&auto=format&fit=crop",
                  },
                ]}
              />
            </div>
          </div>
        )}


      </div>
    </div>
  );
} 