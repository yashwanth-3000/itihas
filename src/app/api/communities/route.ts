import { NextRequest, NextResponse } from 'next/server';

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
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
    totalContributions?: number;
  };
  dateAdded: string;
  category: 'cultural' | 'natural' | 'historical' | 'spiritual';
  status: 'published' | 'pending' | 'featured';
  verificationLevel: 'unverified' | 'community' | 'expert' | 'official';
}

// In-memory storage (in production, use a proper database)
let communityPlaces: CommunityPlace[] = [
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
    author: {
      name: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150",
      verified: true,
      totalContributions: 23
    },
    dateAdded: "2024-01-15T00:00:00.000Z",
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
    author: {
      name: "Chen Wei",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      verified: false,
      totalContributions: 7
    },
    dateAdded: "2024-01-20T00:00:00.000Z",
    category: "natural",
    status: "published",
    verificationLevel: "community"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'newest';

    let filteredPlaces = communityPlaces;

    // Filter by category
    if (category && category !== 'all') {
      filteredPlaces = filteredPlaces.filter(place => place.category === category);
    }

    // Sort places
    filteredPlaces.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'saves':
          return b.saves - a.saves;
        case 'upvotes':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'trending':
          // Sort by engagement score (upvotes + saves + views, weighted by recency)
          const aScore = (a.upvotes + a.saves + (a.views / 10)) * (Date.now() - new Date(a.dateAdded).getTime() > 7 * 24 * 60 * 60 * 1000 ? 0.5 : 1);
          const bScore = (b.upvotes + b.saves + (b.views / 10)) * (Date.now() - new Date(b.dateAdded).getTime() > 7 * 24 * 60 * 60 * 1000 ? 0.5 : 1);
          return bScore - aScore;
        case 'controversial':
          // Sort by controversy score (high total votes but close upvote/downvote ratio)
          const aControversy = (a.upvotes + a.downvotes) * (1 - Math.abs(a.upvotes - a.downvotes) / (a.upvotes + a.downvotes));
          const bControversy = (b.upvotes + b.downvotes) * (1 - Math.abs(b.upvotes - b.downvotes) / (b.upvotes + b.downvotes));
          return bControversy - aControversy;
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: filteredPlaces
    });
  } catch (error) {
    console.error('Error fetching community places:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community places' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPlace: CommunityPlace = {
      id: Date.now().toString(),
      name: body.name,
      significance: body.significance,
      facts: body.facts?.filter((fact: string) => fact?.trim()) || [],
      location: body.location,
      images: body.images || [],
      rating: body.rating || 5,
      saves: 0,
      views: 0,
      author: {
        name: body.author?.name || "Anonymous",
        avatar: body.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      },
      dateAdded: new Date().toISOString(),
      category: body.category || "cultural"
    };

    // Validate required fields
    if (!newPlace.name || !newPlace.significance || !newPlace.location.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    communityPlaces.unshift(newPlace);

    return NextResponse.json({
      success: true,
      data: newPlace
    });
  } catch (error) {
    console.error('Error creating community place:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create community place' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, value, voteType } = body;

    const placeIndex = communityPlaces.findIndex(place => place.id === id);
    if (placeIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'increment_views':
        communityPlaces[placeIndex].views += 1;
        break;
      case 'toggle_save':
        if (communityPlaces[placeIndex].userSaved) {
          communityPlaces[placeIndex].saves -= 1;
          communityPlaces[placeIndex].userSaved = false;
        } else {
          communityPlaces[placeIndex].saves += 1;
          communityPlaces[placeIndex].userSaved = true;
        }
        break;
      case 'vote':
        const place = communityPlaces[placeIndex];
        const previousVote = place.userVote;
        
        // Remove previous vote
        if (previousVote === 'up') place.upvotes -= 1;
        if (previousVote === 'down') place.downvotes -= 1;
        
        // Add new vote or remove if same vote
        if (previousVote === voteType) {
          place.userVote = null; // Remove vote
        } else {
          place.userVote = voteType;
          if (voteType === 'up') place.upvotes += 1;
          if (voteType === 'down') place.downvotes += 1;
        }
        break;
      case 'update_rating':
        if (typeof value === 'number' && value >= 1 && value <= 10) {
          communityPlaces[placeIndex].rating = value;
        }
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: communityPlaces[placeIndex]
    });
  } catch (error) {
    console.error('Error updating community place:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update community place' },
      { status: 500 }
    );
  }
}