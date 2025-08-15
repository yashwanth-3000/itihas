"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["cultural", "historical", "meaningful", "inspiring", "timeless"],
    []
  );

  // Sanskrit letters for floating effect
  const sanskritLetters = [
    "ॐ", "श्री", "ज्ञान", "शांति"
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div 
      className="w-full min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Floating Sanskrit Letters - Left Bottom Corner */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-0">
        {sanskritLetters.slice(0, 2).map((letter, index) => (
          <motion.div
            key={`left-${index}`}
            className="absolute text-white/25 font-light select-none"
            style={{
              fontSize: "20px",
            }}
            initial={{ 
              opacity: 0, 
              x: 0, 
              y: 0,
              scale: 0.8
            }}
            animate={{ 
              opacity: [0, 0.4, 0.3, 0.1],
              x: [0, 200, 350, 400],
              y: [0, -150, -300, -400],
              scale: [0.8, 1, 1.1, 0.9],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "loop",
              delay: index * 0.8,
              ease: "easeInOut"
            }}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* Floating Sanskrit Letters - Right Bottom Corner */}
      <div className="absolute bottom-4 right-4 pointer-events-none z-0">
        {sanskritLetters.slice(2, 4).map((letter, index) => (
          <motion.div
            key={`right-${index}`}
            className="absolute text-white/25 font-light select-none"
            style={{
              fontSize: "20px",
            }}
            initial={{ 
              opacity: 0, 
              x: 0, 
              y: 0,
              scale: 0.8
            }}
            animate={{ 
              opacity: [0, 0.4, 0.3, 0.1],
              x: [0, -200, -350, -400],
              y: [0, -150, -300, -400],
              scale: [0.8, 1, 1.1, 0.9],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "loop",
              delay: (index + 2) * 0.8,
              ease: "easeInOut"
            }}
          >
            {letter}
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="flex gap-8 py-16 lg:py-32 items-center justify-center flex-col min-h-screen">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20">
              Stories of Culture & Heritage <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-white font-bold">itihas is</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-white"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-white/90 max-w-2xl text-center">
              Discover and share the rich tapestry of human culture and heritage. 
              Explore historical places, learn about traditions, and contribute to preserving our collective memory.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4 bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm" variant="outline" asChild>
              <Link href="/sharable-link">
                Learn More <Info className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" className="gap-4 bg-white text-black hover:bg-white/90" asChild>
              <Link href="/explore/communities">
                Explore Places <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero }; 