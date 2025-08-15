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
  // Optional maps and street view data
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'newest';
    
    // Get authenticated user to check their votes
    const user = await getAuthenticatedUser(request);
    const userId = user?.id; // Only use authenticated user, no fallback

    // Build the query with user join for author information
    let query = supabase
      .from('places')
      .select(`
        *,
        communities!inner(name, category),
        users!places_created_by_fkey(full_name, avatar_url, username)
      `);

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Execute query
    const { data: places, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Query successful, places count:', places?.length || 0);

    if (!places) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get user votes 
    let userVotes: { [placeId: string]: string } = {};
    const { data: votes } = await supabase
      .from('user_votes')
      .select('place_id, vote_type')
      .eq('user_id', userId);
    
    if (votes) {
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.place_id] = vote.vote_type;
        return acc;
      }, {} as { [placeId: string]: string });
    }

    // Transform database data to match frontend interface
    const transformedPlaces: CommunityPlace[] = places.map((place: any) => ({
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
      userVote: (userVotes[place.id] as 'up' | 'down') || null,
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
    }));

    // Sort places
    transformedPlaces.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'saves':
          return b.saves - a.saves;
        case 'upvotes':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'trending':
          // Sort by engagement score (upvotes + views, weighted by recency)
          const aScore = (a.upvotes + (a.views / 10)) * (Date.now() - new Date(a.dateAdded).getTime() > 7 * 24 * 60 * 60 * 1000 ? 0.5 : 1);
          const bScore = (b.upvotes + (b.views / 10)) * (Date.now() - new Date(b.dateAdded).getTime() > 7 * 24 * 60 * 60 * 1000 ? 0.5 : 1);
          return bScore - aScore;
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return NextResponse.json({
      success: true,
      data: transformedPlaces
    });
  } catch (error) {
    console.error('Error fetching community places:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community places' },
      { status: 500 }
    );
  }
}

// Helper function to get authenticated user
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.significance || !body.location?.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, significance, and location.address are required' },
        { status: 400 }
      );
    }

    // Get authenticated user - require authentication for creating places
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = user.id;

    // First, we need to get or create a community for this place
    // For now, let's get the first available community or create a default one
    const { data: communities, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .limit(1);

    if (communityError) {
      console.error('Error fetching communities:', communityError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch communities' },
        { status: 500 }
      );
    }

    let communityId: string;

    if (!communities || communities.length === 0) {
      // Create a default community
      const { data: newCommunity, error: createError } = await supabase
        .from('communities')
        .insert({
          name: 'Community Places',
          description: 'A collection of community-shared places',
          category: body.category || 'cultural',
          created_by: userId
        })
        .select('id')
        .single();

      if (createError || !newCommunity) {
        console.error('Error creating default community:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create community' },
          { status: 500 }
        );
      }
      
      communityId = newCommunity.id;
    } else {
      communityId = communities[0].id;
    }

    // Prepare place data for database
    const placeData = {
      community_id: communityId,
      name: body.name,
      description: body.significance,
      address: body.location.address,
      images: body.images || ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'],
      category: body.category || 'cultural',
      tags: body.facts?.filter((fact: string) => fact?.trim()) || [],
      rating: parseFloat(body.rating || '5'),
      upvote_count: 0,
      downvote_count: 0,
      comment_count: 0,
      view_count: 0,
      verified: false,
      featured: false,
      created_by: userId
    };

    // Insert the new place
    const { data: newPlace, error: insertError } = await supabase
      .from('places')
      .insert(placeData)
      .select(`
        id,
        name,
        description,
        address,
        images,
        category,
        tags,
        rating,
        upvote_count,
        downvote_count,
        comment_count,
        view_count,
        featured,
        verified,
        created_at
      `)
      .single();

    if (insertError || !newPlace) {
      console.error('Error inserting place:', insertError);
      console.error('Place data attempted:', placeData);
      return NextResponse.json(
        { success: false, error: `Failed to create place in database: ${insertError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Transform the database response to match frontend interface
    const transformedPlace: CommunityPlace = {
      id: newPlace.id,
      name: newPlace.name,
      significance: newPlace.description || '',
      facts: newPlace.tags || [],
      location: {
        address: newPlace.address || 'Unknown location'
      },
      images: newPlace.images || ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'],
      rating: parseFloat(newPlace.rating || '0'),
      saves: 0,
      views: newPlace.view_count || 0,
      upvotes: newPlace.upvote_count || 0,
      downvotes: newPlace.downvote_count || 0,
      userVote: null,
      userSaved: false,
      mapsUrl: newPlace.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newPlace.address)}` : undefined,
      hasStreetView: false,
      author: {
        name: body.author?.name || 'Community Member',
        avatar: body.author?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150',
        verified: newPlace.verified || false
      },
      dateAdded: newPlace.created_at,
      category: newPlace.category as 'cultural' | 'natural' | 'historical' | 'spiritual',
      status: newPlace.featured ? 'featured' : 'published',
      verificationLevel: newPlace.verified ? 'community' : 'unverified'
    };

    return NextResponse.json({
      success: true,
      data: transformedPlace
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Place ID is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'increment_views':
        {
          // Use RPC function to increment views
          const { data, error } = await supabase
            .rpc('increment_place_views', { place_uuid: id });

          if (error) {
            console.error('Error incrementing views:', error);
            return NextResponse.json(
              { success: false, error: 'Failed to update views' },
              { status: 500 }
            );
          }

          // Transform and return updated place
          const transformedPlace: CommunityPlace = {
            id: data.id,
            name: data.name,
            significance: data.description || '',
            facts: data.tags || [],
            location: {
              address: data.address || 'Unknown location'
            },
            images: data.images || ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'],
            rating: parseFloat(data.rating || '0'),
            saves: 0,
            views: data.view_count || 0,
            upvotes: data.upvote_count || 0,
            downvotes: data.downvote_count || 0,
            userVote: null,
            userSaved: false,
            mapsUrl: data.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}` : undefined,
            hasStreetView: false,
            author: {
              name: 'Community Member',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150',
              verified: data.verified || false
            },
            dateAdded: data.created_at,
            category: data.category as 'cultural' | 'natural' | 'historical' | 'spiritual',
            status: data.featured ? 'featured' : 'published',
            verificationLevel: data.verified ? 'community' : 'unverified'
          };

          return NextResponse.json({
            success: true,
            data: transformedPlace
          });
        }

      case 'vote':
        {
          if (!voteType || (voteType !== 'up' && voteType !== 'down')) {
            return NextResponse.json(
              { success: false, error: 'Invalid vote type' },
              { status: 400 }
            );
          }

          // Get authenticated user for voting - require authentication
          const user = await getAuthenticatedUser(request);
          if (!user) {
            return NextResponse.json({ error: 'Authentication required for voting' }, { status: 401 });
          }
          const userId = user.id;

          // Use smart voting RPC function
          const { data, error } = await supabase
            .rpc('vote_on_place', { 
              place_uuid: id, 
              user_uuid: userId, 
              vote_type: voteType 
            });

          if (error) {
            console.error('Error updating vote:', error);
            return NextResponse.json(
              { success: false, error: 'Failed to update vote' },
              { status: 500 }
            );
          }

          // Return simplified vote response
          return NextResponse.json({
            success: true,
            data: {
              id: data.id,
              upvotes: data.upvote_count,
              downvotes: data.downvote_count,
              userVote: data.user_vote
            }
          });
        }

      case 'update_rating':
        {
          if (typeof value !== 'number' || value < 1 || value > 10) {
            return NextResponse.json(
              { success: false, error: 'Rating must be a number between 1 and 10' },
              { status: 400 }
            );
          }

          const { data, error } = await supabase
            .from('places')
            .update({ rating: value })
            .eq('id', id)
            .select(`
              id,
              name,
              description,
              address,
              images,
              category,
              tags,
              rating,
              upvote_count,
              downvote_count,
              comment_count,
              view_count,
              featured,
              verified,
              created_at
            `)
            .single();

          if (error) {
            console.error('Error updating rating:', error);
            return NextResponse.json(
              { success: false, error: 'Failed to update rating' },
              { status: 500 }
            );
          }

          // Transform and return updated place
          const transformedPlace: CommunityPlace = {
            id: data.id,
            name: data.name,
            significance: data.description || '',
            facts: data.tags || [],
            location: {
              address: data.address || 'Unknown location'
            },
            images: data.images || ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800'],
            rating: parseFloat(data.rating || '0'),
            saves: 0,
            views: data.view_count || 0,
            upvotes: data.upvote_count || 0,
            downvotes: data.downvote_count || 0,
            userVote: null,
            userSaved: false,
            mapsUrl: data.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}` : undefined,
            hasStreetView: false,
            author: {
              name: 'Community Member',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150',
              verified: data.verified || false
            },
            dateAdded: data.created_at,
            category: data.category as 'cultural' | 'natural' | 'historical' | 'spiritual',
            status: data.featured ? 'featured' : 'published',
            verificationLevel: data.verified ? 'community' : 'unverified'
          };

          return NextResponse.json({
            success: true,
            data: transformedPlace
          });
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating community place:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update community place' },
      { status: 500 }
    );
  }
}