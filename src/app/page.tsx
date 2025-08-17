"use client"

import { Hero } from '../components/ui/animated-hero';
import { NavBar } from '../components/ui/tubelight-navbar';
import { Home, MessageCircle, User, Info } from "lucide-react";

export default function HomePage() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Communities', url: '/explore/communities', icon: User },
    { name: 'About', url: '/about', icon: Info }
  ];

  return (
    <div className="min-h-screen">
      <NavBar items={navItems} />
      
      {/* Hero Section */}
      <Hero />
    </div>
  );
}
