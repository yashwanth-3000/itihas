"use client";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { AnimatedTestimonials } from "@/components/ui";
import { Home, MessageCircle, User, Compass, MapPin } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

// Small curated set of landmarks with coordinates
const MONUMENTS: Monument[] = [
  {
    name: "Taj Mahal",
    city: "Agra",
    country: "India",
    lat: 27.1751,
    lng: 78.0421,
    era: "Mughal era",
    description: "A 17th‑century ivory‑white marble mausoleum built by Shah Jahan.",
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Qutub Minar",
    city: "Delhi",
    country: "India",
    lat: 28.5244,
    lng: 77.1855,
    era: "12th century",
    description: "A UNESCO World Heritage Site and one of the tallest brick minarets.",
    image: "https://images.unsplash.com/photo-1597167679723-36ad0f5bd8b7?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Eiffel Tower",
    city: "Paris",
    country: "France",
    lat: 48.8584,
    lng: 2.2945,
    era: "1889",
    description: "Iconic wrought‑iron lattice tower overlooking the Seine.",
    image: "https://images.unsplash.com/photo-1549643896-9de7c5e9b9f8?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Colosseum",
    city: "Rome",
    country: "Italy",
    lat: 41.8902,
    lng: 12.4922,
    era: "80 AD",
    description: "Ancient Roman amphitheatre famed for its grand architecture.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Pyramids of Giza",
    city: "Giza",
    country: "Egypt",
    lat: 29.9792,
    lng: 31.1342,
    era: "Ancient Egypt",
    description: "The Great Pyramid complex rising from the Giza Plateau.",
    image: "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Great Wall of China",
    city: "Beijing",
    country: "China",
    lat: 40.4319,
    lng: 116.5704,
    era: "Qin to Ming dynasties",
    description: "Series of fortifications spanning thousands of kilometers.",
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Statue of Liberty",
    city: "New York",
    country: "USA",
    lat: 40.6892,
    lng: -74.0445,
    era: "1886",
    description: "Neoclassical sculpture symbolizing freedom and democracy.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Golden Gate Bridge",
    city: "San Francisco",
    country: "USA",
    lat: 37.8199,
    lng: -122.4783,
    era: "1937",
    description: "Suspension bridge spanning the Golden Gate strait.",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Hawa Mahal",
    city: "Jaipur",
    country: "India",
    lat: 26.9239,
    lng: 75.8267,
    era: "1799",
    description: "The Palace of Winds, famed for its ornate facade.",
    image: "https://images.unsplash.com/photo-1558831847-72a097d503cc?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Red Fort",
    city: "Delhi",
    country: "India",
    lat: 28.6562,
    lng: 77.2410,
    era: "17th century",
    description: "Historic fort that served as the Mughal emperors' main residence.",
    image: "https://images.unsplash.com/photo-1603262110263-0b9c4f661fd9?q=80&w=1600&auto=format&fit=crop",
  },
];

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = decodeURIComponent(searchParams.get("q") ?? "");
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Get approximate location from browser
  useEffect(() => {
    if (!navigator?.geolocation) return;
    const id = navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
    return () => {
      // nothing to cleanup for getCurrentPosition
    };
  }, []);

  // Choose nearest monuments to the user
  const { testimonials, hasMore } = useMemo(() => {
    // Fallback to Delhi-ish center if we don't have coords
    const base = coords ?? { lat: 28.6139, lng: 77.2090 };
    const sorted = [...MONUMENTS].sort((a, b) =>
      haversineKm(base.lat, base.lng, a.lat, a.lng) - haversineKm(base.lat, base.lng, b.lat, b.lng)
    );
    const sliceCount = pageParam * 5;
    const visible = sorted.slice(0, sliceCount);
    const mapped: Testimonial[] = visible.map(m => ({
      name: m.name,
      historyPlace: m.era ?? "heritage site",
      designation: m.description,
      location: `${m.city}, ${m.country}`,
      quote: `Nearby: ${m.name}. ${m.description}`,
      src: m.image,
    }));
    return { testimonials: mapped, hasMore: sorted.length > sliceCount };
  }, [coords, pageParam]);

  const onShowMore = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(pageParam + 1));
    router.replace(`/explore/results?${params.toString()}`, { scroll: false });
  };

  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Chat", url: "/chat", icon: MessageCircle },
    { name: "Explore", url: "/explore", icon: Compass },
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
                Explore results for: <span className="font-bold">{topic || "Your Topic"}</span>
              </h2>
              <p className="text-white/80 mt-2 text-sm">Swipe or use arrows to browse discoveries</p>
              <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white/90 text-xs backdrop-blur-sm">
                  <MapPin className="h-4 w-4" />
                  {coords
                    ? `Your location: ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`
                    : `Using approximate location: 28.61, 77.21`}
                </span>
              </div>
            </div>
            <AnimatedTestimonials inverted testimonials={testimonials} />

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={onShowMore}
                  className="px-5 py-2.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                  Show more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

