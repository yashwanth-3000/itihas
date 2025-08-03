"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, MessageCircle, User, Compass, BookOpen, ArrowLeft, Sparkles, Telescope, Map, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ExplorePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Comics', url: '/comics', icon: BookOpen },
    { name: 'About', url: '/sharable-link', icon: User }
  ];

  const exploreCategories = [
    {
      title: "AI Discovery",
      description: "Explore the latest AI capabilities and experiments",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      items: ["GPT Models", "Image Generation", "Voice Synthesis", "Code Assistant"]
    },
    {
      title: "Knowledge Base",
      description: "Deep dive into various topics and subjects",
      icon: Telescope,
      color: "from-blue-500 to-cyan-500",
      items: ["Science & Tech", "History", "Philosophy", "Literature"]
    },
    {
      title: "Creative Tools",
      description: "Unleash your creativity with AI-powered tools",
      icon: Lightbulb,
      color: "from-orange-500 to-red-500",
      items: ["Story Generator", "Art Creation", "Music Composer", "Poetry Writer"]
    },
    {
      title: "Interactive Maps",
      description: "Navigate through different AI capabilities",
      icon: Map,
      color: "from-green-500 to-emerald-500",
      items: ["Skill Tree", "Learning Paths", "Feature Map", "Progress Tracker"]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black text-gray-300' 
        : 'bg-white text-black'
    }`}>
      <NavBar items={navItems} isDarkMode={isDarkMode} />
      
      {/* Spacer for navbar on desktop */}
      <div className="hidden sm:block h-16"></div>
      
      {/* Header */}
      <div className={`sticky top-0 sm:top-16 z-40 border-b transition-colors ${
        isDarkMode 
          ? 'bg-black/95 border-gray-800 backdrop-blur-sm' 
          : 'bg-white/95 border-gray-200 backdrop-blur-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-black'
              }`}
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className={`p-2 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Explore AI</h1>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Discover AI capabilities and tools
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Explore AI Capabilities</h2>
          <p className={`text-sm max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Dive into different aspects of AI technology. From creative tools to knowledge exploration, 
            discover what's possible with modern artificial intelligence.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exploreCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className={`rounded-lg border p-6 transition-all hover:scale-105 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-800/50' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${category.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{category.title}</h3>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`px-3 py-2 rounded text-xs text-center transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">More features coming soon!</span>
          </div>
        </div>
      </div>
    </div>
  );
} 