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

interface Comment {
  id: string;
  placeId: string;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  datePosted: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  replies?: Comment[];
}

// In-memory storage (in production, use a proper database)
let communityPlaces: CommunityPlace[] = [
  {
    id: "1",
    name: "Hidden Temple of Serenity",
    significance: "A 400-year-old temple hidden in dense forest, known only to local tribes for its unique healing rituals. This sacred place has been a center of spiritual practice for generations, offering a unique glimpse into ancient traditions that have been preserved through oral history.",
    facts: [
      "Built without any metal nails or screws using traditional joinery techniques",
      "Natural spring water flows through the temple creating a gentle, meditative sound",
      "Only accessible during low tide when the hidden path is revealed",
      "The main hall features intricate wood carvings depicting local folklore",
      "Home to a rare species of luminescent moss that glows softly at night"
    ],
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: "Hidden Valley, Northern Mountain Range, Sacred Forest Reserve"
    },
    images: [
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800",
      "https://images.unsplash.com/photo-1478144592103-25e218a04891?w=800"
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
      avatar: "",
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
    significance: "Natural caves with unique acoustic properties where ancient storytellers gathered for centuries. The caves feature remarkable natural formations and serve as a window into the oral traditions of the indigenous peoples.",
    facts: [
      "Echo lasts exactly 7 seconds in the main chamber",
      "Temperature remains constant year-round at 55°F",
      "Home to rare glowing minerals that illuminate naturally",
      "Contains ancient petroglyphs dating back 2000 years",
      "Acoustic properties were used for ceremonial chanting"
    ],
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: "Northern Cliffs, Coastal Region, Heritage Conservation Area"
    },
    images: [
      "https://images.unsplash.com/photo-1551524164-6cf64ac2c4b6?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800"
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
      avatar: "",
      verified: false,
      totalContributions: 7
    },
    dateAdded: "2024-01-20T00:00:00.000Z",
    category: "natural",
    status: "published",
    verificationLevel: "community"
  }
];

let comments: Comment[] = [
  {
    id: "1",
    placeId: "1",
    author: {
      name: "Sarah Johnson",
      avatar: "",
      verified: true
    },
    content: "I visited this place last month and it was absolutely breathtaking! The spiritual energy here is unlike anything I've experienced. The locals were so welcoming and shared some incredible stories about the temple's history.",
    datePosted: "2024-01-10T00:00:00.000Z",
    upvotes: 12,
    downvotes: 1,
    userVote: null,
    replies: [
      {
        id: "1-1",
        placeId: "1",
        author: {
          name: "Maya Patel",
          avatar: ""
        },
        content: "Thank you for sharing! I'm so glad you had a meaningful experience there. The local community has been the guardians of this place for generations.",
        datePosted: "2024-01-11T00:00:00.000Z",
        upvotes: 8,
        downvotes: 0,
        userVote: null
      }
    ]
  },
  {
    id: "2",
    placeId: "1",
    author: {
      name: "David Chen",
      avatar: ""
    },
    content: "How accessible is this location? I'm planning a visit with elderly family members and want to make sure they can safely navigate the terrain.",
    datePosted: "2024-01-08T00:00:00.000Z",
    upvotes: 5,
    downvotes: 0,
    userVote: null
  },
  {
    id: "3",
    placeId: "1",
    author: {
      name: "Elena Rodriguez",
      avatar: ""
    },
    content: "The architecture here is fascinating! I'm an architectural historian and I'd love to study this place further. The construction techniques mentioned are quite rare for this region.",
    datePosted: "2024-01-05T00:00:00.000Z",
    upvotes: 9,
    downvotes: 0,
    userVote: null
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const placeId = params.id;
    const place = communityPlaces.find(p => p.id === placeId);
    
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    const placeComments = comments.filter(c => c.placeId === placeId);

    return NextResponse.json({
      success: true,
      data: {
        place,
        comments: placeComments
      }
    });
  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const placeId = params.id;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const place = communityPlaces.find(p => p.id === placeId);
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      placeId,
      author: {
        name: "You",
        avatar: ""
      },
      content: content.trim(),
      datePosted: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: null
    };

    comments.unshift(newComment);

    return NextResponse.json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}