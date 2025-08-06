"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  isDarkMode?: boolean
  comicTheme?: boolean
  isMinimized?: boolean
}

export function NavBar({ items, className, isDarkMode, comicTheme, isMinimized }: NavBarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Only set initial value after component mounts to avoid hydration mismatch
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <motion.div
      initial={false}
      animate={{
        y: isMinimized ? (isMobile ? 100 : -100) : 0,
        opacity: isMinimized ? 0 : 1
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-[60] mb-6 sm:pt-4",
        className,
      )}
    >
      <div className={`flex items-center gap-3 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg ${
        comicTheme
          ? 'bg-yellow-400/90 border border-orange-400/60'
          : isDarkMode !== undefined 
            ? (isDarkMode 
                ? 'bg-gray-800/90 border border-gray-700' 
                : 'bg-white/90 border border-gray-200')
            : 'bg-white/90 border border-white/40'
      }`}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                "relative cursor-pointer text-xs font-semibold px-4 py-2 rounded-full transition-colors",
                comicTheme
                  ? "text-black hover:text-gray-800"
                  : isDarkMode !== undefined 
                    ? (isDarkMode 
                        ? "text-gray-300 hover:text-white" 
                        : "text-gray-700 hover:text-gray-900")
                    : "text-gray-700 hover:text-gray-900",
                isActive && (comicTheme
                  ? "bg-orange-500 text-white shadow-lg border border-orange-600"
                  : isDarkMode !== undefined 
                    ? (isDarkMode 
                        ? "bg-gray-700 text-white shadow-md" 
                        : "bg-gray-200 text-black shadow-md")
                    : "bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-md"),
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className={`absolute inset-0 w-full rounded-full -z-10 shadow-lg ${
                    comicTheme
                      ? "bg-orange-500"
                      : isDarkMode !== undefined 
                        ? (isDarkMode 
                            ? "bg-gray-700" 
                            : "bg-gray-200")
                        : "bg-gradient-to-r from-orange-400 to-red-400"
                  }`}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full shadow-md ${
                    comicTheme
                      ? "bg-orange-500"
                      : isDarkMode !== undefined 
                        ? (isDarkMode 
                            ? "bg-gray-600" 
                            : "bg-gray-400")
                        : "bg-gradient-to-r from-orange-400 to-red-400"
                  }`}>
                    <div className={`absolute w-12 h-6 rounded-full blur-md -top-2 -left-2 ${
                      comicTheme
                        ? "bg-orange-400/50"
                        : isDarkMode !== undefined 
                          ? (isDarkMode 
                              ? "bg-gray-600/40" 
                              : "bg-gray-400/40")
                          : "bg-orange-400/40"
                    }`} />
                    <div className={`absolute w-8 h-6 rounded-full blur-md -top-1 ${
                      comicTheme
                        ? "bg-yellow-400/45"
                        : isDarkMode !== undefined 
                          ? (isDarkMode 
                              ? "bg-gray-600/35" 
                              : "bg-gray-400/35")
                          : "bg-red-400/35"
                    }`} />
                    <div className={`absolute w-4 h-4 rounded-full blur-sm top-0 left-2 ${
                      comicTheme
                        ? "bg-yellow-300/40"
                        : isDarkMode !== undefined 
                          ? (isDarkMode 
                              ? "bg-gray-600/30" 
                              : "bg-gray-400/30")
                          : "bg-orange-300/30"
                    }`} />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
} 