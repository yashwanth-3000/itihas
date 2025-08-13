"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, MapPin, Camera } from "lucide-react";

// Deterministic PRNG to avoid hydration mismatch from Math.random on server vs client
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
  historyPlace?: string;
  location?: string;
};

export function AnimatedTestimonials({
  testimonials,
  autoplay = false,
  className,
  inverted = false,
  onOpenStreet,
  onActiveChange,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
  /** If true, optimizes colors for dark/photo backgrounds */
  inverted?: boolean;
  /** Called when user wants to open Street View for the active place */
  onOpenStreet?: (t: Testimonial) => void;
  /** Called whenever the active testimonial changes (via arrows/autoplay) */
  onActiveChange?: (t: Testimonial, index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const [streetAnimKey, setStreetAnimKey] = useState(0);

  const handleNext = () => {
    setActive(prev => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  // Notify parent when the active card changes
  useEffect(() => {
    if (typeof onActiveChange === "function" && testimonials.length > 0) {
      onActiveChange(testimonials[active], active);
    }
  }, [active, onActiveChange, testimonials]);

  // Precompute stable rotate angles for each card so SSR and client match
  const rotateAngles = useMemo(() => {
    const rand = createSeededRandom(1337);
    return testimonials.map(() => Math.floor(rand() * 21) - 10);
  }, [testimonials.length]);

  if (!testimonials?.length) return null;

  const buildPrefill = (t: Testimonial) => {
    const parts = [
      `Learn more about ${t.name}${t.historyPlace ? ` (${t.historyPlace})` : ""}${t.location ? ` in ${t.location}` : ""}.`,
      t.designation ? `Summary: ${t.designation}` : "",
      t.quote ? `Details: ${t.quote}` : "",
    ].filter(Boolean);
    return parts.join("\n\n");
  };

  return (
    <div className={cn("max-w-sm md:max-w-5xl lg:max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-10", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
        <div>
          <div className="relative h-72 md:h-[22rem] w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.9, z: -100, rotate: rotateAngles[index] }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : rotateAngles[index],
                    zIndex: isActive(index) ? 999 : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -40, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9, z: 100, rotate: rotateAngles[index] }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={800}
                    height={800}
                    draggable={false}
                    unoptimized={testimonial.src.startsWith('http') || testimonial.src.includes('.png?v=')}
                    onError={(e) => {
                      try {
                        // @ts-expect-error Next Image underlying img element
                        const target = e.currentTarget;
                        if (target.src !== '/explore.png') {
                          target.src = '/explore.png';
                        }
                      } catch (err) {
                        console.warn('Image fallback failed:', err);
                      }
                    }}
                    className={cn(
                      "h-full w-full rounded-3xl object-cover object-center",
                      inverted && "shadow-2xl ring-1 ring-white/20"
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className={cn("text-2xl font-bold flex items-baseline gap-2 flex-wrap", inverted ? "text-white" : "text-foreground")}
            >
              {testimonials[active].name}
              {testimonials[active].historyPlace && (
                <span className={cn("text-sm font-normal", inverted ? "text-white/70" : "text-muted-foreground")}>({testimonials[active].historyPlace})</span>
              )}
            </h3>
            <p className={cn("text-sm inline-flex items-center gap-2 flex-wrap", inverted ? "text-white/70" : "text-muted-foreground")}
            >
              <span>{testimonials[active].designation}</span>
              {Boolean(testimonials[active].location) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className={cn("h-4 w-4", inverted ? "text-white/80" : "text-foreground/80")} />
                  <span>{testimonials[active].location}</span>
                </span>
              )}
            </p>
            <motion.p className={cn("text-lg mt-6", inverted ? "text-white/80" : "text-muted-foreground") }>
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * index }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="mt-6 md:mt-8 flex items-center flex-wrap gap-4">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                inverted ? "bg-white/10 ring-1 ring-white/20 text-white" : "bg-secondary/60 text-foreground ring-1 ring-foreground/10"
              )}
              aria-live="polite"
            >
              {active + 1}/{testimonials.length}
            </span>
            <button onClick={handlePrev} className={cn("h-9 w-9 rounded-full flex items-center justify-center group/button transition-all shadow-sm hover:shadow-md", inverted ? "bg-white/10 ring-1 ring-white/20 hover:bg-white/20" : "bg-secondary ring-1 ring-foreground/10") }>
              <ArrowLeft className={cn("h-5 w-5 transition-transform duration-300", inverted ? "text-white group-hover/button:rotate-12" : "text-foreground group-hover/button:rotate-12") } />
            </button>
            <button onClick={handleNext} className={cn("h-9 w-9 rounded-full flex items-center justify-center group/button transition-all shadow-sm hover:shadow-md", inverted ? "bg-white/10 ring-1 ring-white/20 hover:bg-white/20" : "bg-secondary ring-1 ring-foreground/10") }>
              <ArrowRight className={cn("h-5 w-5 transition-transform duration-300", inverted ? "text-white group-hover/button:-rotate-12" : "text-foreground group-hover/button:-rotate-12") } />
            </button>
            <motion.button
              key={streetAnimKey}
              type="button"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={{ scale: [1, 1.0, 1.04, 1], boxShadow: inverted ? ["0 0 0 rgba(0,0,0,0)", "0 8px 20px rgba(255,255,255,0.08)", "0 8px 20px rgba(255,255,255,0.12)", "0 0 0 rgba(0,0,0,0)"] : ["0 0 0 rgba(0,0,0,0)", "0 8px 20px rgba(0,0,0,0.08)", "0 8px 20px rgba(0,0,0,0.12)", "0 0 0 rgba(0,0,0,0)"] }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onClick={() => {
                setStreetAnimKey((k) => k + 1);
                onOpenStreet?.(testimonials[active]);
              }}
              className={cn(
                "relative inline-flex items-center gap-2 ml-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                inverted ? "bg-white/10 ring-1 ring-white/25 text-white hover:bg-white/20" : "bg-secondary text-foreground ring-1 ring-foreground/10 hover:opacity-90"
              )}
            >
              <Camera className={cn("h-4 w-4", inverted ? "text-white/90" : "text-foreground/90")} />
              <span>Street View 260°</span>
            </motion.button>
            <Link
              prefetch={false}
              href={`/chat?prefill=${encodeURIComponent(buildPrefill(testimonials[active]))}`}
              className={cn(
                "ml-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm hover:shadow-md",
                inverted ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/85"
              )}
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

