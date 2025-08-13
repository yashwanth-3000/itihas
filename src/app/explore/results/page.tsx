"use client";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { AnimatedTestimonials, GoogleStreetView } from "@/components/ui";
import Image from "next/image";
import { Home, MessageCircle, User, Compass, MapPin, ArrowRight, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, Suspense, useRef } from "react";
import type { Testimonial } from "@/components/ui/animated-testimonials";

type Monument = {
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  era?: string;
  description: string;
  image: string;
};

type ExploreItem = {
  title: string;
  description: string;
  location: string | null;
  tags: string[];
  url: string | null;
  coordinates?: { lat: number; lng: number } | null;
  image?: string | null;
  address?: string | null;
};

type ExploreAPIResult = {
  success: boolean;
  query: string;
  plan: string;
  notes: string;
  result: {
    query: string;
    summary: string;
    items: ExploreItem[];
    sources: string[];
  };
  timestamp: string;
};

// Removed static MONUMENTS array - now using only AI search results

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ExploreResultsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-sm text-white/80">Loading results…</div>}>
      <ExploreResultsContent />
    </Suspense>
  );
}

function ExploreResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQ = decodeURIComponent(searchParams.get("q") ?? "");
  const { searchTerm, locationFromQuery } = useMemo(() => {
    const searchMatch = rawQ.match(/\[\s*Search:\s*([^\]]+)\]/i);
    const locationMatch = rawQ.match(/\[\s*Location:\s*([^\]]+)\]/i);
    const searchTerm = (searchMatch?.[1] || rawQ)
      .replace(/\[[^\]]+\]/g, "")
      .trim();
    const locationFromQuery = locationMatch?.[1]?.trim() || null;
    return { searchTerm, locationFromQuery };
  }, [rawQ]);
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(locationFromQuery);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);
  const [viewDisplay, setViewDisplay] = useState<"street" | "directions">("street");
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const [showMapSection, setShowMapSection] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [exploreData, setExploreData] = useState<ExploreAPIResult | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Get appropriate image URL - prefer agent-discovered images, fallback to Unsplash
  const getImageForItem = (item: ExploreItem, index: number): string => {
    // Use agent-discovered image if available and valid
    if (item.image && 
        item.image !== 'null' && 
        !item.image.includes('example.com') &&
        (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
      
      // Check if it's likely a direct image URL (has image file extension)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const isDirectImage = imageExtensions.some(ext => 
        item.image!.toLowerCase().includes(ext)
      );
      
      if (isDirectImage) {
        console.log(`Using agent-discovered direct image for ${item.title}:`, item.image);
        return item.image;
      } else {
        console.log(`Agent image for ${item.title} appears to be a webpage, not direct image:`, item.image);
        // Don't use webpage URLs as images - fall through to Unsplash
      }
    }
    
    // Fallback to Unsplash with search terms from title and location
    const searchTerms = [
      item.title.replace(/\s+/g, '+'),
      item.location?.split(',')[0]?.replace(/\s+/g, '+')
    ].filter(Boolean).join('+');
    
    const fallbackUrl = `https://source.unsplash.com/800x600/?${searchTerms}+architecture+building`;
    console.log(`Using Unsplash fallback for ${item.title}:`, fallbackUrl);
    return fallbackUrl;
  };

  const distanceKm = useMemo(() => {
    if (!selectedMonument) return null;
    // Don't calculate distance if coordinates are not valid (e.g., 0,0 before geocoding)
    if (selectedMonument.lat === 0 && selectedMonument.lng === 0) return null;
    const base = coords ?? { lat: 28.6139, lng: 77.2090 };
    return haversineKm(base.lat, base.lng, selectedMonument.lat, selectedMonument.lng);
  }, [coords, selectedMonument]);

  // Get approximate location from browser
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  }, []);

  // Reverse geocode coords into a friendly place name if not provided in the query
  useEffect(() => {
    if (!coords || locationName) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
        const res = await fetch(url, { 
          headers: { Accept: "application/json" }, 
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          console.warn("Reverse geocoding failed:", res.status);
          return;
        }
        const data = await res.json();
        const a = data?.address || {};
        const parts = [a.city || a.town || a.village || a.hamlet, a.state, a.country].filter(Boolean);
        setLocationName(parts.join(", ") || data?.display_name || "Current Location");
      } catch (error) {
        console.warn("Reverse geocoding error:", error);
        setLocationName("Current Location");
      }
    };
    run();
    return () => controller.abort();
  }, [coords, locationName]);

  const geocodePlace = async (name: string, locationHint?: string | null) => {
    try {
      setIsGeocoding(true);
      
      // Try multiple search variations for better geocoding success
      const searchQueries = [
        [name, locationHint || ""].filter(Boolean).join(", "),
        name, // Just the name
        `${name} ${locationHint?.split(',')[0] || ""}`.trim(), // Name + city
      ].filter(Boolean);
      
      // First try Nominatim (free) - with better error handling
      for (const q of searchQueries) {
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
          
          const res = await fetch(nominatimUrl, { 
            headers: { 
              Accept: "application/json",
              "User-Agent": "ExploreApp/1.0"
            },
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          
          if (res.ok) {
            const arr = await res.json();
            if (Array.isArray(arr) && arr.length > 0) {
              const first = arr[0];
              const lat = Number(first.lat);
              const lng = Number(first.lon);
              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                console.log(`Nominatim geocoded "${q}" to: ${lat}, ${lng}`);
                return { lat, lng } as { lat: number; lng: number };
              }
            }
          } else {
            console.warn(`Nominatim HTTP error for "${q}": ${res.status}`);
          }
        } catch (error) {
          console.warn(`Nominatim failed for "${q}":`, error);
          // Continue to next query or Google fallback
        }
      }
      
      // Fallback to Google Geocoding API if available
      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (googleApiKey) {
        for (const q of searchQueries) {
          try {
            const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${googleApiKey}`;
            const res = await fetch(googleUrl);
            
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'OK' && data.results?.length > 0) {
                const result = data.results[0];
                const lat = result.geometry.location.lat;
                const lng = result.geometry.location.lng;
                console.log(`Google geocoded "${q}" to: ${lat}, ${lng}`);
                return { lat, lng } as { lat: number; lng: number };
              }
            }
          } catch (error) {
            console.warn(`Google geocoding failed for "${q}":`, error);
          }
        }
      }
      
      console.error(`All geocoding attempts failed for "${name}"`);
      return null;
    } catch (error) {
      console.error(`Geocoding error for "${name}":`, error);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  // Call Explore API for AI-driven results
  useEffect(() => {
    if (!searchTerm) {
      console.log("No search term provided, skipping API call");
      setApiError("No search query provided. Please add ?q=your-search-term to the URL.");
      return;
    }

    // Prevent multiple calls for the same search term
    if (exploreData?.query === searchTerm) {
      console.log("Already have data for this search term, skipping API call");
      return;
    }

    const controller = new AbortController();
    let isStale = false;

    const run = async () => {
      console.log("Search term:", searchTerm);
      setApiLoading(true);
      setApiError(null);
      
      try {
        console.log("Making API call to:", "http://localhost:8002/explore");
        console.log("Query:", searchTerm);
        
        const res = await fetch("http://localhost:8002/explore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchTerm }),
          signal: controller.signal,
        });
        
        console.log("API response status:", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const data: ExploreAPIResult = await res.json();
        console.log("API response data:", data);
        
        // Only update state if the request hasn't been cancelled
        if (!isStale && !controller.signal.aborted) {
          setExploreData(data);
        }
      } catch (e: any) {
        if (!isStale && !controller.signal.aborted) {
          console.error("API call failed:", e);
          // Don't show AbortError to user - it's normal when navigating away
          if (e.name !== 'AbortError') {
            setApiError(e?.message || "Failed to load exploration results");
          }
        }
      } finally {
        if (!isStale) {
          setApiLoading(false);
        }
      }
    };

    run();

    return () => {
      isStale = true;
      controller.abort();
    };
  }, [searchTerm, exploreData?.query]);

  // Choose nearest monuments to the user
  const { testimonials, hasMore, nearest } = useMemo(() => {
    // If we have AI exploration items, map them first
    const aiItems: Testimonial[] | null = exploreData?.result?.items?.length
      ? exploreData.result.items.slice(0, pageParam * 5).map((it, i) => ({
          name: it.title,
          historyPlace: it.tags?.[0],
          designation: it.description,
          location: it.location || undefined,
          quote: it.url ? `Learn more: ${it.url}` : it.description,
          // Provide unique placeholder per item to avoid duplicate keys collisions upstream  
          // Use different fallback images based on content type
          src: getImageForItem(it, i),
        }))
      : null;

    if (aiItems && aiItems.length > 0 && exploreData?.result?.items?.[0]) {
      // Create a monument from the first AI result for street view
      const firstItem = exploreData.result.items[0];
      const mockNearest: Monument = {
        name: firstItem.title,
        city: firstItem.location?.split(',')[0] || 'Unknown',
        country: firstItem.location?.split(',').slice(-1)[0] || 'Unknown',
        era: firstItem.tags?.[0] || 'heritage site',
        description: firstItem.description,
        image: getImageForItem(firstItem, 0),
        // Use agent-discovered coordinates if available, otherwise will need geocoding
        lat: firstItem.coordinates?.lat || 0,
        lng: firstItem.coordinates?.lng || 0,
      };
      return { testimonials: aiItems, hasMore: false, nearest: mockNearest };
    }

    // Don't show default monuments - only show AI results or empty state
    return { testimonials: [], hasMore: false, nearest: null };
  }, [coords, pageParam, exploreData]);

  useEffect(() => {
    if (!selectedMonument && nearest) setSelectedMonument(nearest);
  }, [nearest, selectedMonument]);

  // If user navigates back/forward or after hot reload, ensure map shows when a monument is already selected by actions
  useEffect(() => {
    if (selectedMonument && showMapSection) {
      // Make sure we scroll and display correctly after hydration
      setTimeout(() => mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  }, [selectedMonument, showMapSection]);

  const onShowMore = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(pageParam + 1));
    router.replace(`/explore/results?${params.toString()}`, { scroll: false });
  };

  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Chat", url: "/chat", icon: MessageCircle },
    { name: "Explore", url: "/explore", icon: Compass },
    { name: "Communities", url: "/explore/communities", icon: User },
    { name: "About", url: "/sharable-link", icon: User },
  ] as const;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10">
        <NavBar items={navItems} />

        <div className="flex items-start justify-center min-h-screen px-4 pt-[12vh] md:pt-[14vh]">
          <div className="w-full max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-white text-3xl md:text-4xl font-semibold tracking-tight">
                Explore results for: <span className="font-bold">{searchTerm || "Your Topic"}</span>
              </h2>
              <p className="text-white/80 mt-2 text-sm">Swipe or use arrows to browse discoveries</p>
              <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white/90 text-xs backdrop-blur-sm">
                  <MapPin className="h-4 w-4" />
                  {exploreData?.result?.items?.[0]?.location
                    ? `Exploring: ${exploreData.result.items[0].location}`
                    : locationName
                    ? `Your location: ${locationName}`
                    : coords
                    ? `Location detected`
                    : `Using approximate location`}
                </span>
              </div>
            </div>
            {/* Enhanced Loading Page */}
            {apiLoading && !exploreData && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                {/* Main Loading Animation */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                
                {/* Loading Text */}
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-semibold text-white">Exploring Your Query</h3>
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 ring-1 ring-white/20 text-white/90 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                    </span>
                    <span className="text-sm">Finding places and compiling details…</span>
                  </div>
                </div>
                
                {/* Loading Steps */}
                <div className="max-w-md text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-white/70">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span>Planning research steps</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-white/70">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1.0s'}}></div>
                    </div>
                    <span>Searching the web with EXA</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-white/70">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1.4s'}}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1.6s'}}></div>
                    </div>
                    <span>Synthesizing with IBM AI</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Compact loading indicator when results are already shown */}
            {apiLoading && exploreData && (
              <div className="flex items-center justify-center my-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 ring-1 ring-white/20 text-white/90 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                  </span>
                  <span className="text-sm">Updating results…</span>
                </div>
              </div>
            )}
            {/* AI Exploration summary and error states */}
            <div className="mb-6">
              {apiError && (
                <div className="rounded-xl border border-red-500/20 bg-red-900/20 p-4 text-red-300">
                  <h3 className="font-semibold mb-1">Error</h3>
                  <p className="text-sm">{apiError}</p>
                  {apiError.includes("No search query") && (
                    <div className="mt-3 text-xs text-red-200">
                      <p>Try visiting: <code className="bg-black/20 px-1 rounded text-xs">localhost:3000/explore/results?q=temples in Hyderabad</code></p>
                    </div>
                  )}
                  {apiError.includes("Failed to fetch") && (
                    <div className="mt-3 text-xs text-red-200">
                      <p>• Check if the backend server is running on port 8002</p>
                      <p>• Backend should be accessible at: <code className="bg-black/20 px-1 rounded text-xs">http://localhost:8002</code></p>
                    </div>
                  )}
                </div>
              )}
              {exploreData?.result?.summary && (
                <div className="rounded-xl border border-white/20 bg-black/30 p-4 text-white/90">
                  <h3 className="text-lg font-semibold mb-1">Summary</h3>
                  <p className="text-sm text-white/80">{exploreData.result.summary}</p>
                </div>
              )}
            </div>
            {/* No Results State */}
            {!apiLoading && !apiError && exploreData && testimonials.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white/60" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">No Results Found</h3>
                  <p className="text-white/70 max-w-md">
                    We couldn't find any places matching "{searchTerm}". Try a different search term or location.
                  </p>
                </div>
              </div>
            )}
            
            {/* Results Display */}
            {testimonials.length > 0 && (
              <AnimatedTestimonials 
                inverted 
                testimonials={testimonials}
              onOpenStreet={async (t) => {
                // Check if we have agent-discovered coordinates first
                const item = exploreData?.result?.items?.find(item => item.title === t.name);
                let coordinates = item?.coordinates;
                
                if (coordinates && coordinates.lat !== 0 && coordinates.lng !== 0) {
                  console.log(`Using agent-discovered coordinates for ${t.name}:`, coordinates);
                } else {
                  console.log(`No agent coordinates for ${t.name}, falling back to geocoding`);
                  // Fallback to geocoding if no coordinates from agent
                  const geo = await geocodePlace(t.name, t.location);
                  coordinates = geo;
                }
                
                if (coordinates) {
                  setSelectedMonument({
                    name: t.name,
                    city: t.location?.split(',')[0] || "",
                    country: t.location?.split(',').slice(-1)[0] || "",
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    description: t.designation,
                    image: t.src,
                    era: t.historyPlace,
                  });
                  console.log(`Set monument coordinates:`, coordinates);
                }
                setViewDisplay("street");
                setShowMapSection(true);
                setTimeout(() => mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
              }}
              onActiveChange={async (t) => {
                if (!showMapSection) return;
                if (selectedMonument?.name === t.name) return;
                
                // Check if we have agent-discovered coordinates first
                const item = exploreData?.result?.items?.find(item => item.title === t.name);
                let coordinates = item?.coordinates;
                
                if (coordinates && coordinates.lat !== 0 && coordinates.lng !== 0) {
                  console.log(`Using agent-discovered coordinates for ${t.name}:`, coordinates);
                } else {
                  console.log(`No agent coordinates for ${t.name}, falling back to geocoding`);
                  // Fallback to geocoding if no coordinates from agent
                  const geo = await geocodePlace(t.name, t.location);
                  coordinates = geo;
                }
                
                if (coordinates) {
                  setSelectedMonument({
                    name: t.name,
                    city: t.location?.split(',')[0] || "",
                    country: t.location?.split(',').slice(-1)[0] || "",
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    description: t.designation,
                    image: t.src,
                    era: t.historyPlace,
                  });
                  console.log(`Updated monument coordinates:`, coordinates);
                }
                setViewDisplay("street");
              }}
              />
            )}

            {/* Show More Button */}
            {testimonials.length > 0 && hasMore && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onShowMore}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                  <span>More places</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {showMapSection && selectedMonument && (
              <div ref={mapSectionRef} className="mt-10 rounded-xl border border-white/20 bg-black/20 p-4 text-white/90">
                {/* Location Details Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-yellow-400" />
                      <span className="text-lg font-semibold">{selectedMonument.name}</span>
                    </div>
                    <button
                      type="button"
                      aria-label="Close map section"
                      onClick={() => setShowMapSection(false)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-white/80 hover:bg-white/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Location Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">Location:</span>
                      <span className="font-medium">{exploreData?.result?.items?.[0]?.location || `${selectedMonument.city}${selectedMonument.country && `, ${selectedMonument.country}`}`}</span>
                    </div>
                    {selectedMonument.era && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">Era:</span>
                        <span className="font-medium">{selectedMonument.era}</span>
                      </div>
                    )}
                    {distanceKm !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">Distance:</span>
                        <span className="font-medium text-yellow-300">{distanceKm.toFixed(1)} km away</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Agent-discovered Address */}
                  {exploreData?.result?.items?.find(item => item.title === selectedMonument.name)?.address && (
                    <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-white/70 flex-shrink-0">Address:</span>
                        <span className="font-medium text-white/90">
                          {exploreData.result.items.find(item => item.title === selectedMonument.name)?.address}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Description */}
                  {selectedMonument.description && (
                    <p className="mt-3 text-sm text-white/80 leading-relaxed">
                      {selectedMonument.description}
                    </p>
                  )}
                </div>
                
                {/* Street View Section */}
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <span className="text-white/70">Street View 360°</span>
                  {isGeocoding && (
                    <span className="text-yellow-300">• Locating panorama…</span>
                  )}
                </div>
                
                {/* Only show GoogleStreetView when we have valid coordinates */}
                {selectedMonument.lat !== 0 && selectedMonument.lng !== 0 ? (
                  <div className="space-y-3">
                    <GoogleStreetView
                      className="rounded-lg"
                      initialLocation={{ lat: selectedMonument.lat, lng: selectedMonument.lng }}
                      location={{ lat: selectedMonument.lat, lng: selectedMonument.lng }}
                      userCoords={coords ?? undefined}
                      displayMode={viewDisplay}
                    />
                    {/* Rate limiting info */}
                    <div className="text-xs text-white/50 bg-black/20 p-2 rounded border border-white/10">
                      💡 If Street View shows "Too Many Requests" errors, wait a few seconds and try refreshing the page. Google's API has rate limits.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-800 border border-gray-600 h-96 flex items-center justify-center">
                    <div className="text-center text-white/70">
                      {isGeocoding ? (
                        <div className="space-y-2">
                          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p>Locating {selectedMonument.name}...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p>📍 Location not found</p>
                          <p className="text-sm">Unable to geocode {selectedMonument.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

