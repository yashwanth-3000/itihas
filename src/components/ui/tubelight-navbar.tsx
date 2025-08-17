"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, User, LogIn, LogOut } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from '../../contexts/AuthContext'


interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: readonly NavItem[]
  className?: string
  isDarkMode?: boolean
  comicTheme?: boolean
  exploreTheme?: boolean
  isMinimized?: boolean
  showAuth?: boolean // New prop to show auth button
}

export function NavBar({ items, className, isDarkMode, comicTheme, exploreTheme, isMinimized, showAuth }: NavBarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Debug profile data and handle loading states
  useEffect(() => {
    console.log('Profile data in navbar:', {profile, user, loading})
    
    // If user exists but profile is null and not loading, try to trigger profile fetch
    if (user && !profile && !loading) {
      console.log('User exists but profile is null, this might indicate a profile loading issue')
    }
  }, [profile, user, loading])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Only set initial value after component mounts to avoid hydration mismatch
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const target = event.target as Element
        if (!target.closest('.profile-menu-container')) {
          setShowProfileMenu(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileMenu])

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
        // Place nav near bottom on mobile, near top on desktop. Avoid full-height overlay.
        "fixed left-1/2 -translate-x-1/2 z-[60] pointer-events-none bottom-6 sm:bottom-auto sm:top-4",
        className,
      )}
    >
                   <div className={`flex items-center gap-3 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg pointer-events-auto ${
               comicTheme
                 ? 'bg-yellow-400/90 border border-orange-400/60'
                 : exploreTheme
                   ? 'bg-orange-50/80 border border-orange-200/40'
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
                   : exploreTheme
                     ? "text-gray-700 hover:text-gray-900"
                     : isDarkMode !== undefined 
                       ? (isDarkMode 
                           ? "text-gray-300 hover:text-white" 
                           : "text-gray-700 hover:text-gray-900")
                       : "text-gray-700 hover:text-gray-900",
                isActive && (comicTheme
                  ? "bg-orange-500 text-white shadow-lg border border-orange-600"
                  : exploreTheme
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
                      : exploreTheme
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
                      : exploreTheme
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
                        : exploreTheme
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
                        : exploreTheme
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
                        : exploreTheme
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
        
        {/* Auth Button */}
        {showAuth && (
          <>
            {/* Separator */}
                               <div className={`w-px h-8 ${
                     comicTheme
                       ? 'bg-black/20'
                       : exploreTheme
                         ? 'bg-orange-300/40'
                         : isDarkMode !== undefined 
                           ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                           : 'bg-gray-300'
                   }`} />
            
            {loading ? (
              <div className="px-4 py-2">
                <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${
                  comicTheme
                    ? 'border-black/50'
                    : exploreTheme
                      ? 'border-white/50'
                      : 'border-gray-500'
                }`} />
              </div>
            ) : user ? (
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={cn(
                    "relative cursor-pointer text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2",
                                               comicTheme
                             ? "text-black hover:text-gray-800 hover:bg-orange-400/20"
                             : exploreTheme
                               ? "text-gray-700 hover:text-gray-900 hover:bg-orange-100/50"
                               : isDarkMode !== undefined 
                                 ? (isDarkMode 
                                     ? "text-gray-300 hover:text-white hover:bg-gray-700" 
                                     : "text-gray-700 hover:text-gray-900 hover:bg-gray-100")
                                 : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'User'} 
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        console.error('Avatar failed to load:', profile.avatar_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Avatar loaded successfully:', profile.avatar_url);
                      }}
                    />
                  ) : (
                    <User size={16} />
                  )}
                  {/* Debug info - moved to useEffect */}
                  <span className="hidden md:inline">
                    {loading ? 'Loading...' : (profile?.full_name || user?.email?.split('@')[0] || 'Profile')}
                  </span>
                </button>
                
                {/* Profile Menu */}
                {showProfileMenu && (
                                           <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border backdrop-blur-lg z-50 ${
                           comicTheme
                             ? 'bg-yellow-50/95 border-orange-400/60'
                             : exploreTheme
                               ? 'bg-orange-50/95 border-orange-200/60'
                               : isDarkMode !== undefined 
                                 ? (isDarkMode 
                                     ? 'bg-gray-800/95 border-gray-700' 
                                     : 'bg-white/95 border-gray-200')
                                 : 'bg-white/95 border-gray-200'
                         }`}>
                    <div className="p-3 border-b border-gray-200/50">
                      <div className="flex items-center gap-3">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt={profile.full_name || 'User'} 
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              console.error('Profile menu avatar failed to load:', profile.avatar_url);
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('Profile menu avatar loaded successfully:', profile.avatar_url);
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User size={20} />
                          </div>
                        )}
                        <div>
                          <div className={`font-medium text-sm ${
                            comicTheme ? 'text-black' : exploreTheme ? 'text-gray-800' : 'text-gray-900'
                          }`}>
                            {profile?.full_name || 'User'}
                          </div>
                          <div className={`text-xs ${
                            comicTheme ? 'text-gray-600' : exploreTheme ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await signOut()
                          setShowProfileMenu(false)
                        } catch (error) {
                          console.error('Sign out failed:', error)
                          // Still close the menu even if sign out fails
                          setShowProfileMenu(false)
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                        comicTheme
                          ? 'text-black hover:bg-orange-100'
                          : exploreTheme
                            ? 'text-gray-800 hover:bg-orange-100/60'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className={cn(
                  "relative cursor-pointer text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2",
                                           comicTheme
                           ? "text-black hover:text-gray-800 bg-orange-500/20 hover:bg-orange-500/30"
                           : exploreTheme
                             ? "text-gray-700 hover:text-gray-900 bg-orange-100/60 hover:bg-orange-200/60"
                             : isDarkMode !== undefined 
                               ? (isDarkMode 
                                   ? "text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600" 
                                   : "text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200")
                               : "text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
                )}
              >
                <LogIn size={16} />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
} 