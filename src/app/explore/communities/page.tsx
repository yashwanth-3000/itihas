"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { PlaceUploadForm } from "@/components/ui/place-upload-form";

import { Home, MessageCircle, User, Compass, Plus, Star, MapPin, Filter, X, ArrowUp, ArrowDown, Search, ChevronUp, ChevronDown, CheckCircle, Flame, Award, Shield, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Apple system font stack for a clean, native feel
const APPLE_SYSTEM_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, system-ui, sans-serif";

// Simple silhouette avatar components
const MaleAvatar = ({ size = 32 }: { size?: number }) => (
  <div 
    className="bg-white/20 rounded-full flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  </div>
);

const FemaleAvatar = ({ size = 32 }: { size?: number }) => (
  <div 
    className="bg-white/20 rounded-full flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 7C13.18 7 14.16 7.84 14.16 8.86C14.16 10.22 12.89 11.24 12 12.86C11.11 11.24 9.84 10.22 9.84 8.86C9.84 7.84 10.82 7 12 7ZM12 14C15.31 14 18 15.79 18 18V22H6V18C6 15.79 8.69 14 12 14Z"/>
    </svg>
  </div>
);

// Simple function to determine avatar based on name (for demo purposes)
const getAvatarComponent = (name: string, size?: number) => {
  // Simple heuristic based on common names - in real app, this would be a profile setting
  const femaleNames = ['Maya', 'Sarah', 'Elena', 'Lisa', 'Emily', 'Anna', 'Maria', 'Jessica'];
  const firstName = name.split(' ')[0];
  const isFemale = femaleNames.some(fn => firstName.includes(fn));
  
  return isFemale ? <FemaleAvatar size={size} /> : <MaleAvatar size={size} />;
};

interface CommunityPlace {
  id: string;
  name: string;
  significance: string;
  facts: string[];
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  images: string[];
  rating: number;
  saves: number;
  views: number;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  userSaved?: boolean;
  // Optional maps and street view data
  mapsUrl?: string;
  streetViewUrl?: string;
  hasStreetView?: boolean;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
    totalContributions?: number;
  };
  dateAdded: Date;
  category: 'cultural' | 'natural' | 'historical' | 'spiritual';
  status: 'published' | 'pending' | 'featured';
  verificationLevel: 'unverified' | 'community' | 'expert' | 'official';
}

// Mock data for demonstration
const mockPlaces: CommunityPlace[] = [
  {
    id: "1",
    name: "Hidden Temple of Serenity",
    significance: "A 400-year-old temple hidden in dense forest, known only to local tribes for its unique healing rituals.",
    facts: [
      "Built without any metal nails or screws",
      "Natural spring water flows through the temple",
      "Only accessible during low tide"
    ],
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: "Hidden Valley, Mountain Range"
    },
    images: [
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800"
    ],
    rating: 9.2,
    saves: 234,
    views: 1205,
    upvotes: 187,
    downvotes: 12,
    userVote: null,
    userSaved: false,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=40.7128,-74.0060",
    hasStreetView: true,
    streetViewUrl: "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.7128,-74.0060",
    author: {
      name: "Maya Patel",
      avatar: "",
      verified: true,
      totalContributions: 23
    },
    dateAdded: new Date("2024-01-15"),
    category: "spiritual",
    status: "featured",
    verificationLevel: "expert"
  },
  {
    id: "2",
    name: "Whispering Caves",
    significance: "Natural caves with unique acoustic properties where ancient storytellers gathered for centuries.",
    facts: [
      "Echo lasts exactly 7 seconds",
      "Temperature remains constant year-round",
      "Home to rare glowing minerals"
    ],
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: "Northern Cliffs, Coastal Region"
    },
    images: [
      "https://images.unsplash.com/photo-1551524164-6cf64ac2c4b6?w=800"
    ],
    rating: 8.7,
    saves: 156,
    views: 892,
    upvotes: 142,
    downvotes: 8,
    userVote: null,
    userSaved: false,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=40.7580,-73.9855",
    hasStreetView: false,
    author: {
      name: "Chen Wei",
      avatar: "",
      verified: false,
      totalContributions: 7
    },
    dateAdded: new Date("2024-01-20"),
    category: "natural",
    status: "published",
    verificationLevel: "community"
  }
];

export default function CommunitiesPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [places, setPlaces] = useState<CommunityPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<CommunityPlace | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Communities', url: '/explore/communities', icon: User },
    { name: 'About', url: '/sharable-link', icon: User }
  ];

  const categories = [
    { id: 'all', name: 'All Places', icon: '🌍' },
    { id: 'cultural', name: 'Cultural', icon: '🏛️' },
    { id: 'natural', name: 'Natural', icon: '🌿' },
    { id: 'historical', name: 'Historical', icon: '📜' },
    { id: 'spiritual', name: 'Spiritual', icon: '🕉️' }
  ];

  // Fetch places from API - ONLY SUPABASE DATA
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/communities?category=${filterCategory}`);
      const result = await response.json();
      
      if (result.success) {
        // Convert date strings back to Date objects
        const placesWithDates = result.data.map((place: any) => ({
          ...place,
          dateAdded: new Date(place.dateAdded)
        }));
        setPlaces(placesWithDates);
      } else {
        console.error('Failed to fetch places:', result.error);
        setPlaces([]); // Show empty state if API fails
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]); // Show empty state if API fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [filterCategory]);

  const filteredPlaces = places.filter((p) => {
    const matchesText = locationQuery.trim()
      ? p.location.address.toLowerCase().includes(locationQuery.trim().toLowerCase()) ||
        p.name.toLowerCase().includes(locationQuery.trim().toLowerCase())
      : true;
    const matchesCategory = filterCategory === 'all' ? true : p.category === filterCategory;
    return matchesText && matchesCategory;
  });

  const handlePlaceSubmit = async (formData: any) => {
    try {
          // Anyone can add places now

      let imageUrls: string[] = [];
      
      // Upload images to Supabase Storage if any
      if (formData.images && formData.images.length > 0) {
        const uploadFormData = new FormData();
        formData.images.forEach((file: File) => {
          uploadFormData.append('files', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.success) {
          imageUrls = uploadResult.data.urls;
        } else {
          console.error('Failed to upload images:', uploadResult.error);
          // Use fallback image if upload fails
          imageUrls = ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'];
        }
      } else {
        // Use fallback image if no images provided
        imageUrls = ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'];
      }

      const placeData = {
        name: formData.name,
        significance: formData.significance,
        facts: formData.facts.filter((fact: string) => fact.trim()),
        location: formData.location,
        images: imageUrls,
        rating: formData.rating,
        category: formData.category
      };

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placeData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the places list
        fetchPlaces();
      } else {
        console.error('Failed to submit place:', result.error);
        // Add to local state as fallback
        const newPlace: CommunityPlace = {
          ...placeData,
          id: Date.now().toString(),
          saves: 0,
          views: 0,
          upvotes: 0,
          downvotes: 0,
          userVote: null,
          userSaved: false,
          mapsUrl: placeData.location.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeData.location.address)}` : undefined,
          hasStreetView: false,
          author: {
            name: user?.email?.split('@')[0] || 'You',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            verified: false
          },
          dateAdded: new Date(),
          images: formData.images.map((file: File) => URL.createObjectURL(file)),
          status: 'published',
          verificationLevel: 'unverified'
        };
        setPlaces(prev => [newPlace, ...prev]);
      }
    } catch (error) {
      console.error('Error submitting place:', error);
    }
  };

  const handlePlaceClick = async (place: CommunityPlace) => {
    try {
      // Increment views on server
      await fetch('/api/communities', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: place.id,
          action: 'increment_views'
        }),
      });
      
      // Navigate to individual place page
      router.push(`/explore/communities/${place.id}`);
    } catch (error) {
      console.error('Error updating views:', error);
      // Still navigate even if API fails
      router.push(`/explore/communities/${place.id}`);
    }
  };



  const handleVote = async (placeId: string, voteType: 'up' | 'down') => {
    // Anyone can vote now

    try {
      const place = places.find(p => p.id === placeId);
      const previousVote = place?.userVote;
      
      // Update local state optimistically
      setPlaces(prev => prev.map(p => {
        if (p.id !== placeId) return p;
        
        let newUpvotes = p.upvotes;
        let newDownvotes = p.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Handle previous vote removal
        if (p.userVote === 'up') newUpvotes--;
        if (p.userVote === 'down') newDownvotes--;
        
        // Handle new vote (or toggle off if same vote)
        if (p.userVote === voteType) {
          newUserVote = null; // Remove vote if clicking same button
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...p,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote
        };
      }));



      // Update on server
      const response = await fetch('/api/communities', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: placeId,
          action: 'vote',
          voteType: voteType
        }),
      });

      const result = await response.json();
      if (!result.success) {
        // Revert optimistic update on error
        setPlaces(prev => prev.map(p => {
          if (p.id !== placeId) return p;
          return { ...p, userVote: previousVote };
        }));
        console.error('Failed to update vote:', result.error);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      // You could add a revert mechanism here
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Glass overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-none"></div>
      
      <div className="relative z-10">
        <NavBar items={navItems} showAuth={true} exploreTheme={true} />
        
        <div className="px-4 pt-24 pb-8">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 
                className="text-4xl md:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: APPLE_SYSTEM_FONT }}
              >
                Community Places
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto">
                Discover and share hidden cultural and natural treasures known only to locals
              </p>
            </motion.div>

            {/* Modern Controls Bar - Matching Navbar Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              {/* Main Search and Controls Container - White & Light Orange Theme */}
              <div className="flex items-center gap-3 backdrop-blur-lg py-2 px-2 rounded-full shadow-lg bg-white/95 border border-orange-200/60 mb-4">
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-3 bg-orange-50/80 backdrop-blur-sm rounded-full px-4 py-2.5 border border-orange-100">
                  <Search className="w-4 h-4 text-orange-600" />
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search place name or location..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-medium"
                  />
                  {locationQuery && (
                    <button 
                      onClick={() => setLocationQuery('')} 
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-orange-100 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>



                {/* Filters Button */}
                <div className="relative" ref={filterDropdownRef}>
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`relative cursor-pointer text-xs font-semibold px-4 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 ${
                      filtersOpen
                        ? 'bg-orange-200 text-gray-800 shadow-md border border-orange-300'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-orange-100/50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {filtersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {/* Modern Filter Dropdown - White Theme */}
                  {filtersOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_8px_30px_rgba(251,146,60,0.15)] z-[100]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-800 font-semibold text-sm">Filters</h3>
                        <span className="text-gray-500 text-xs bg-orange-100 px-2 py-1 rounded-full">{filteredPlaces.length} places</span>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Category pills */}
                        <div>
                          <p className="text-xs text-gray-600 mb-2 font-medium">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => setFilterCategory(category.id)}
                                className={`inline-flex items-center rounded-full text-xs font-medium transition-all duration-200 ${
                                  filterCategory === category.id
                                    ? 'bg-orange-500 text-white border border-orange-400 shadow-md'
                                    : 'bg-orange-50 text-gray-700 border border-orange-200 hover:bg-orange-100 hover:text-gray-900'
                                } gap-2 py-2 px-3`}
                              >
                                <span>{category.name}</span>
                                {filterCategory === category.id && (
                                  <X className="w-3 h-3" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share a Place Button - Light Orange Theme */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-500 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={18} />
                  Share a Place
                </button>
              </div>
            </motion.div>
          </div>

          {/* Places Grid */}
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-white/20"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-3 bg-white/20 rounded w-full"></div>
                      <div className="h-3 bg-white/20 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 group relative"
                >


                  {/* Image */}
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => handlePlaceClick(place)}>
                    <img 
                      src={place.images[0]} 
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Rating & Category Overlay */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm font-medium">{place.rating}</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-xs font-medium">{place.category.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Gradient Overlay for bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title with status indicator */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-lg line-clamp-1 cursor-pointer" onClick={() => handlePlaceClick(place)}>
                        {place.name}
                      </h3>
                      {place.status === 'pending' && (
                        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                          <Clock size={12} />
                          Pending
                        </div>
                      )}
                    </div>
                    
                    <p className="text-white/70 text-sm mb-4 line-clamp-2 cursor-pointer" onClick={() => handlePlaceClick(place)}>
                      {place.significance}
                    </p>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{place.location.address}</span>
                    </div>

                    {/* Voting Section */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Left side - Voting */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(place.id, 'up');
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            place.userVote === 'up'
                              ? 'bg-green-500 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <ArrowUp size={16} />
                        </button>
                        
                        <div className="px-3 py-1 bg-white/10 rounded-lg">
                          <span className="text-white font-medium text-sm">
                            {(place.upvotes - place.downvotes) > 0 ? '+' : ''}{place.upvotes - place.downvotes}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(place.id, 'down');
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            place.userVote === 'down'
                              ? 'bg-red-500 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>


                    </div>



                    {/* Author */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAvatarComponent(place.author.name, 32)}
                        <div className="flex flex-col">
                          <span className="text-white/70 text-sm">by {place.author.name}</span>
                          {place.author.totalContributions && (
                            <span className="text-white/50 text-xs">
                              {place.author.totalContributions} contributions
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}

            {!loading && filteredPlaces.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-white text-xl font-bold mb-2">No places found</h3>
                  <p className="text-white/70 mb-6">No places match your current filters. Try adjusting your search criteria.</p>
                  <button
                    onClick={() => setFilterCategory('all')}
                    className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-white/90 transition-all duration-200"
                  >
                    Show All Places
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <PlaceUploadForm 
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        onSubmit={handlePlaceSubmit}
      />

      {/* Place Detail Modal */}
      <AnimatePresence>
        {selectedPlace && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categories.find(c => c.id === selectedPlace.category)?.icon}</span>
                  <div>
                    <h2 className="text-white text-2xl font-bold">{selectedPlace.name}</h2>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <MapPin size={14} />
                      <span>{selectedPlace.location.address}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh]">
                {/* Image Gallery */}
                <div className="relative h-64 md:h-80">
                  <img 
                    src={selectedPlace.images[0]} 
                    alt={selectedPlace.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{selectedPlace.rating}</span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Significance */}
                  <div>
                    <h3 className="text-white font-bold text-lg mb-3">Significance</h3>
                    <p className="text-white/80 leading-relaxed">{selectedPlace.significance}</p>
                  </div>

                  {/* Facts */}
                  {selectedPlace.facts.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold text-lg mb-3">Interesting Facts</h3>
                      <ul className="space-y-2">
                        {selectedPlace.facts.map((fact, index) => (
                          <li key={index} className="text-white/80 flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Voting & Engagement Section */}
                  <div className="pt-4 border-t border-white/20 space-y-4">
                    {/* Voting Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                          <button
                            onClick={() => handleVote(selectedPlace.id, 'up')}
                            className={`p-3 rounded-lg transition-all duration-200 ${
                              selectedPlace.userVote === 'up'
                                ? 'bg-green-500 text-white'
                                : 'text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                          >
                            <ArrowUp size={20} />
                          </button>
                          
                          <div className="px-4 py-2">
                            <div className="text-center">
                              <span className="text-white font-bold text-xl">
                                {(selectedPlace.upvotes - selectedPlace.downvotes) > 0 ? '+' : ''}{selectedPlace.upvotes - selectedPlace.downvotes}
                              </span>
                              <div className="text-white/60 text-xs">
                                {selectedPlace.upvotes + selectedPlace.downvotes} votes
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleVote(selectedPlace.id, 'down')}
                            className={`p-3 rounded-lg transition-all duration-200 ${
                              selectedPlace.userVote === 'down'
                                ? 'bg-red-500 text-white'
                                : 'text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                          >
                            <ArrowDown size={20} />
                          </button>
                        </div>
                        

                      </div>


                    </div>

                    {/* Status Row */}
                    <div className="flex items-center justify-between text-white/70 text-sm bg-white/5 rounded-xl p-4">
                      {/* Status Indicators */}
                      <div className="flex items-center gap-2">
                        {selectedPlace.status === 'featured' && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                            <Flame size={12} />
                            FEATURED
                          </div>
                        )}
                        {selectedPlace.verificationLevel !== 'unverified' && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedPlace.verificationLevel === 'official' ? 'bg-blue-500/80 text-white' :
                            selectedPlace.verificationLevel === 'expert' ? 'bg-purple-500/80 text-white' :
                            'bg-green-500/80 text-white'
                          }`}>
                            {selectedPlace.verificationLevel === 'official' ? <Shield size={12} /> :
                             selectedPlace.verificationLevel === 'expert' ? <Award size={12} /> :
                             <CheckCircle size={12} />}
                            {selectedPlace.verificationLevel.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedPlace.author.avatar} 
                        alt={selectedPlace.author.name}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold">Shared by {selectedPlace.author.name}</p>
                          {selectedPlace.author.verified && (
                            <CheckCircle size={16} className="text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-white/60 text-sm">
                          <span>Local cultural enthusiast</span>
                          {selectedPlace.author.totalContributions && (
                            <span className="flex items-center gap-1">
                              <Star size={12} />
                              {selectedPlace.author.totalContributions} contributions
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white/60 text-xs mb-1">Preservation Score</div>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-500"
                            style={{ width: `${(selectedPlace.rating / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold text-sm">{selectedPlace.rating}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}