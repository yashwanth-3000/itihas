import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  mapsUrl?: string;
  streetViewUrl?: string;
  hasStreetView?: boolean;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  dateAdded: string;
  category: 'cultural' | 'natural' | 'historical' | 'spiritual';
  status: 'published' | 'pending' | 'featured';
  verificationLevel: 'unverified' | 'community' | 'expert' | 'official';
}

interface Comment {
  id: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const placeId = params.id;

    // Fetch place from database with user information
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select(`
        *,
        communities!inner(name, category),
        users!places_created_by_fkey(full_name, avatar_url, username)
      `)
      .eq('id', placeId)
      .single();

    if (placeError || !place) {
      console.error('Error fetching place:', placeError);
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase.rpc('increment_place_views', { place_uuid: placeId });

    // Transform place data to match frontend interface
    const transformedPlace: CommunityPlace = {
      id: place.id,
      name: place.name,
      significance: place.description || '',
      facts: place.tags || [],
      location: {
        address: place.address || 'Unknown location'
      },
      images: place.images || ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'],
      rating: parseFloat(place.rating || '0'),
      saves: 0, // Not implemented yet
      views: place.view_count || 0,
      upvotes: place.upvote_count || 0,
      downvotes: place.downvote_count || 0,
      userVote: null, // TODO: Implement user-specific votes
      userSaved: false, // TODO: Implement user preferences
      mapsUrl: place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}` : undefined,
      hasStreetView: false, // TODO: Implement street view detection
      author: {
        name: place.users?.full_name || 'Community Member',
        avatar: place.users?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150',
        verified: place.verified || false
      },
      dateAdded: place.created_at,
      category: place.category as 'cultural' | 'natural' | 'historical' | 'spiritual',
      status: place.featured ? 'featured' : 'published',
      verificationLevel: place.verified ? 'community' : 'unverified'
    };

    // Fetch comments for this place
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        upvote_count,
        downvote_count,
        created_at,
        users(full_name, avatar_url, username)
      `)
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    // Transform comments data
    const comments: Comment[] = (commentsData || []).map((comment: any) => ({
      id: comment.id,
      author: {
        name: comment.users?.full_name || 'Community Member',
        avatar: comment.users?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150',
        verified: false
      },
      content: comment.content,
      datePosted: comment.created_at,
      upvotes: comment.upvote_count || 0,
      downvotes: comment.downvote_count || 0,
      userVote: null,
      replies: [] // TODO: Implement nested comments
    }));

    return NextResponse.json({
      success: true,
      data: {
        place: transformedPlace,
        comments: comments
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

// Helper function to get authenticated user from request
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Handle comment posting
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const placeId = params.id;
    const body = await request.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Get authenticated user (optional - fallback to demo user)
    const user = await getAuthenticatedUser(request);
    const userId = user?.id || '1ee6046f-f3fd-4687-aced-ecb258ba2975'; // Fallback to Yashwanth's ID

    const { data: newComment, error: commentError } = await supabase
      .from('comments')
      .insert({
        place_id: placeId,
        content: body.content.trim(),
        user_id: userId // Use real user ID
      })
      .select(`
        id,
        content,
        upvote_count,
        downvote_count,
        created_at,
        users(full_name, avatar_url, username)
      `)
      .single();

    if (commentError || !newComment) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Transform comment data
    const transformedComment: Comment = {
      id: newComment.id,
      author: {
        name: newComment.users?.full_name || 'Community Member',
        avatar: newComment.users?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150',
        verified: false
      },
      content: newComment.content,
      datePosted: newComment.created_at,
      upvotes: newComment.upvote_count || 0,
      downvotes: newComment.downvote_count || 0,
      userVote: null,
      replies: []
    };

    return NextResponse.json({
      success: true,
      data: transformedComment
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}

// Handle comment voting
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { commentId, voteType } = body;

    if (!commentId || !voteType || (voteType !== 'up' && voteType !== 'down')) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment vote request' },
        { status: 400 }
      );
    }

    // Get authenticated user (optional - comment voting open to all)
    const user = await getAuthenticatedUser(request);

    // Use RPC function to increment comment votes
    const rpcFunction = voteType === 'up' ? 'increment_comment_upvotes' : 'increment_comment_downvotes';
    const { data, error } = await supabase
      .rpc(rpcFunction, { comment_uuid: commentId });

    if (error) {
      console.error('Error updating comment vote:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update comment vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        upvotes: data.upvote_count,
        downvotes: data.downvote_count,
        userVote: voteType
      }
    });
  } catch (error) {
    console.error('Error handling comment vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to handle comment vote' },
      { status: 500 }
    );
  }
}