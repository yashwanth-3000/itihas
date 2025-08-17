"use client";

import { NavBar } from '../../../../components/ui/tubelight-navbar';

import { Home, MessageCircle, User, MapPin, Calendar, ArrowUp, ArrowDown, ArrowLeft, Send, Map, Navigation, BookOpen, Megaphone, Info } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase } from "../../../../lib/supabase";

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
  views: number;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  // Optional maps and street view data
  mapsUrl?: string;
  streetViewUrl?: string;
  hasStreetView?: boolean;

  author: {
    name: string;
    avatar: string;
    verified?: boolean;

  };
  dateAdded: Date;
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
  datePosted: Date;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  replies?: Comment[];
}

export default function PlaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, session } = useAuth();
  
  const [place, setPlace] = useState<CommunityPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Helper function for authenticated API calls with token refresh
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> => {
    const timeoutDuration = 30000; // 30 seconds timeout
    
    // Create abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutDuration);

    try {
      const session = await supabase.auth.getSession();
      let token = session.data.session?.access_token;
      
      // If no token, try to refresh the session
      if (!token && retryCount === 0) {
        console.log('No token found, attempting to refresh session...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh failed:', refreshError);
          throw new Error('Authentication expired. Please sign in again.');
        }
        
        if (refreshData.session?.access_token) {
          token = refreshData.session.access_token;
          console.log('Session refreshed successfully');
        }
      }
      
      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        ...(options.headers as Record<string, string> || {}),
      };

      // Only add Content-Type if not FormData (browser sets it automatically for FormData)
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal, // Add abort signal for timeout
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      // If we get a 401 and haven't retried yet, try refreshing token once more
      if (response.status === 401 && retryCount === 0) {
        console.log('Received 401, attempting token refresh and retry...');
        return makeAuthenticatedRequest(url, options, 1);
      }

      return response;
    } catch (error) {
      // Clear timeout in case of error
      clearTimeout(timeoutId);
      
      console.error('makeAuthenticatedRequest error:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeoutDuration / 1000}s. Please try again.`);
        }
        
        if (error.message.includes('Authentication')) {
          setToast({ 
            message: 'Authentication expired. Please sign in again.', 
            type: 'error' 
          });
        }
      }
      
      throw error;
    }
  };

  // Auto-clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Communities', url: '/explore/communities', icon: User },
    { name: 'About', url: '/about', icon: Info }
  ];

  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c98b?w=150",
        verified: true
      },
      content: "I visited this place last month and it was absolutely breathtaking! The spiritual energy here is unlike anything I've experienced. The locals were so welcoming and shared some incredible stories about the temple's history.",
      datePosted: new Date("2024-01-10"),
      upvotes: 12,
      downvotes: 1,
      userVote: null,
      replies: [
        {
          id: "1-1",
          author: {
            name: "Maya Patel",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
          },
          content: "Thank you for sharing! I'm so glad you had a meaningful experience there. The local community has been the guardians of this place for generations.",
          datePosted: new Date("2024-01-11"),
          upvotes: 8,
          downvotes: 0,
          userVote: null
        }
      ]
    },
    {
      id: "2",
      author: {
        name: "David Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      content: "How accessible is this location? I'm planning a visit with elderly family members and want to make sure they can safely navigate the terrain.",
      datePosted: new Date("2024-01-08"),
      upvotes: 5,
      downvotes: 0,
      userVote: null
    },
    {
      id: "3",
      author: {
        name: "Elena Rodriguez",
        avatar: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?w=150"
      },
      content: "The architecture here is fascinating! I'm an architectural historian and I'd love to study this place further. The construction techniques mentioned are quite rare for this region.",
      datePosted: new Date("2024-01-05"),
      upvotes: 9,
      downvotes: 0,
      userVote: null
    }
  ];

  // Fetch place data
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/communities/${params.id}`);
        const result = await response.json();
        
        if (result.success) {
          // Convert date strings back to Date objects
          const placeData = {
            ...result.data.place,
            dateAdded: new Date(result.data.place.dateAdded)
          };
          
          const commentsData = result.data.comments.map((comment: any) => ({
            ...comment,
            datePosted: new Date(comment.datePosted),
            replies: comment.replies?.map((reply: any) => ({
              ...reply,
              datePosted: new Date(reply.datePosted)
            }))
          }));
          
          setPlace(placeData);
          setComments(commentsData);
        } else {
          console.error('Failed to fetch place:', result.error);
        }
      } catch (error) {
        console.error('Error fetching place:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlace();
    }
  }, [params.id]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!place) return;
    
    // Check if user is authenticated
    if (!user) {
      setToast({ message: 'Please sign in to vote', type: 'error' });
      return;
    }
    
    try {
      const previousVote = place.userVote;
      const previousUpvotes = place.upvotes;
      const previousDownvotes = place.downvotes;
      
      // Update local state optimistically
      setPlace(prev => {
        if (!prev) return prev;
        
        let newUpvotes = prev.upvotes;
        let newDownvotes = prev.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Handle previous vote removal
        if (prev.userVote === 'up') newUpvotes--;
        if (prev.userVote === 'down') newDownvotes--;
        
        // Handle new vote (or toggle off if same vote)
        if (prev.userVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...prev,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote
        };
      });

      // Update on server with authentication
      const response = await makeAuthenticatedRequest('/api/communities', {
        method: 'PATCH',
        body: JSON.stringify({
          id: place.id,
          action: 'vote',
          voteType: voteType
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        // Revert optimistic update on error
        setPlace(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            upvotes: place.upvotes,
            downvotes: place.downvotes,
            userVote: previousVote
          };
        });
        setToast({ message: `Failed to update vote: ${result.error}`, type: 'error' });
        console.error('Failed to update vote:', result.error);
      } else {
        setToast({ message: 'Vote updated successfully!', type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Error updating vote. Please try again.', type: 'error' });
      console.error('Error updating vote:', error);
      // Revert optimistic update on error
      setPlace(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          upvotes: place.upvotes,
          downvotes: place.downvotes,
          userVote: place.userVote
        };
      });
    }
  };



  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !place) return;

    // Check if user is authenticated
    if (!user) {
      setToast({ message: 'Please sign in to post a comment', type: 'error' });
      return;
    }

    setIsSubmittingComment(true);
    
    try {
      const response = await makeAuthenticatedRequest(`/api/communities/${place.id}`, {
        method: 'POST',
        body: JSON.stringify({
          content: newComment.trim()
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const comment: Comment = {
          ...result.data,
          datePosted: new Date(result.data.datePosted)
        };

        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setToast({ message: 'Comment posted successfully!', type: 'success' });

      } else {
        setToast({ message: `Failed to post comment: ${result.error}`, type: 'error' });
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setToast({ message: 'Error posting comment. Please try again.', type: 'error' });

    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (!place) return;
    
    try {
      // Update local state optimistically
      const previousComment = comments.find(c => c.id === commentId);
      
      setComments(prev => prev.map(comment => {
        if (comment.id !== commentId) return comment;
        
        let newUpvotes = comment.upvotes;
        let newDownvotes = comment.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Handle previous vote removal
        if (comment.userVote === 'up') newUpvotes--;
        if (comment.userVote === 'down') newDownvotes--;
        
        // Handle new vote (or toggle off if same vote)
        if (comment.userVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...comment,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote
        };
      }));

      // Update on server
      const response = await fetch(`/api/communities/${place.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: commentId,
          voteType: voteType
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        // Revert optimistic update on error
        if (previousComment) {
          setComments(prev => prev.map(comment => 
            comment.id === commentId ? previousComment : comment
          ));
        }
        console.error('Failed to update comment vote:', result.error);
      }
    } catch (error) {
      console.error('Error updating comment vote:', error);
      // Revert optimistic update on error
      const previousComment = comments.find(c => c.id === commentId);
      if (previousComment) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? previousComment : comment
        ));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Place not found</div>
      </div>
    );
  }

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
          {/* Back Navigation */}
          <div className="max-w-6xl mx-auto mb-6">
            <Link 
              href="/explore/communities"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Communities
            </Link>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <img 
                  src={place.images[0]} 
                  alt={place.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                

                
                {/* Category Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">{place.category.toUpperCase()}</span>
                </div>
              </motion.div>

              {/* Title and Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                <h1 
                  className="text-3xl md:text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: APPLE_SYSTEM_FONT }}
                >
                  {place.name}
                </h1>
                
                <div className="flex items-center gap-4 text-white/70 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{place.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{place.dateAdded.toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-white/80 leading-relaxed text-lg">
                  {place.significance}
                </p>
              </motion.div>

              {/* Facts Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-white font-bold text-xl mb-4">Interesting Facts</h2>
                <ul className="space-y-3">
                  {place.facts.map((fact, index) => (
                    <li key={index} className="text-white/80 flex items-start gap-3">
                      <span className="text-yellow-400 mt-1 text-lg">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Image Gallery */}
              {place.images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                >
                  <h2 className="text-white font-bold text-xl mb-4">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {place.images.slice(1).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${place.name} ${index + 2}`}
                        className="w-full h-32 object-cover rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-white font-bold text-xl mb-6">Discussions ({comments.length})</h2>
                
                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="bg-white/10 rounded-xl border border-white/20 p-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this place..."
                      className="w-full bg-transparent text-white placeholder-white/60 resize-none focus:outline-none min-h-[100px]"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-white/60 text-sm">
                        {newComment.length}/500 characters
                      </span>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={16} />
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        {getAvatarComponent(comment.author.name, 40)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">{comment.author.name}</span>
                            <span className="text-white/60 text-sm">
                              {comment.datePosted.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-white/80 mb-3">{comment.content}</p>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCommentVote(comment.id, 'up')}
                                className={`p-1 rounded transition-colors ${
                                  comment.userVote === 'up'
                                    ? 'text-green-400'
                                    : 'text-white/60 hover:text-white'
                                }`}
                              >
                                <ArrowUp size={16} />
                              </button>
                              <span className="text-white/70 text-sm min-w-[20px] text-center">
                                {comment.upvotes - comment.downvotes}
                              </span>
                              <button
                                onClick={() => handleCommentVote(comment.id, 'down')}
                                className={`p-1 rounded transition-colors ${
                                  comment.userVote === 'down'
                                    ? 'text-red-400'
                                    : 'text-white/60 hover:text-white'
                                }`}
                              >
                                <ArrowDown size={16} />
                              </button>
                            </div>
                            <button className="text-white/60 hover:text-white text-sm transition-colors">
                              Reply
                            </button>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-4 border-l border-white/20 pl-4 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-3">
                                  {getAvatarComponent(reply.author.name, 32)}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-white font-medium text-sm">{reply.author.name}</span>
                                      <span className="text-white/60 text-xs">
                                        {reply.datePosted.toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-white/80 text-sm">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="sticky top-24 space-y-6 lg:h-fit">
              {/* Voting and Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                {/* Voting Section */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-1 bg-white/10 rounded-xl p-1 mb-4">
                    <button
                      onClick={() => handleVote('up')}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        place.userVote === 'up'
                          ? 'bg-green-500 text-white'
                          : 'text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <ArrowUp size={24} />
                    </button>
                    
                    <div className="px-4 py-2 min-w-[80px]">
                      <div className="text-center">
                        <span className="text-white font-bold text-2xl">
                          {(place.upvotes - place.downvotes) > 0 ? '+' : ''}{place.upvotes - place.downvotes}
                        </span>
                        <div className="text-white/60 text-xs">
                          {place.upvotes + place.downvotes} votes
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleVote('down')}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        place.userVote === 'down'
                          ? 'bg-red-500 text-white'
                          : 'text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <ArrowDown size={24} />
                    </button>
                  </div>




                </div>

                {/* Preservation Score */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-white/70 text-sm">
                    <span>Preservation Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
                          style={{ width: `${(place.rating / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{place.rating}/10</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4"
              >
                {/* Maps and Street View Buttons */}
                <div className="space-y-3">
                  {/* See on Maps Button */}
                  {(place.location.lat && place.location.lng) || place.mapsUrl ? (
                    <button
                      onClick={() => {
                        const url = place.mapsUrl || 
                          `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
                    >
                      <Map size={18} />
                      See on Maps
                    </button>
                  ) : null}

                  {/* Street View Button */}
                  {place.hasStreetView && (place.location.lat && place.location.lng) && (
                    <button
                      onClick={() => {
                        const url = place.streetViewUrl || 
                          `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.location.lat},${place.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
                    >
                      <Navigation size={18} />
                      Street View
                    </button>
                  )}
                </div>

                {/* Learn More Button */}
                <button
                  onClick={() => {
                    // You can customize this to open a modal, navigate to a detailed page, or show more info
                    const searchQuery = encodeURIComponent(`${place.name} ${place.location.address} history significance`);
                    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <BookOpen size={18} />
                  Learn More
                </button>

                {/* Raise Your Voice Button */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Create a pre-filled social media message
                      const message = encodeURIComponent(
                        `Help save ${place.name}! This ${place.category} site in ${place.location.address} needs our attention. ${place.significance} #SaveOurHeritage #CulturalPreservation #${place.category.charAt(0).toUpperCase() + place.category.slice(1)}Heritage`
                      );
                      // Open Twitter/X with pre-filled message
                      window.open(`https://twitter.com/intent/tweet?text=${message}`, '_blank');
                    }}
                    className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:bg-red-500/40 hover:from-red-500/40 hover:to-red-600/40 border border-orange-400/30 hover:border-red-500/60 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
                  >
                    <Megaphone size={18} />
                    Raise Your Voice
                  </button>
                  <p className="text-white/60 text-xs text-center leading-relaxed">
                    Start a social media campaign to save this place
                  </p>
                </div>
              </motion.div>

              {/* Author Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4">Shared by</h3>
                <div className="flex items-center gap-3">
                  {getAvatarComponent(place.author.name, 48)}
                  <div>
                    <div className="text-white font-medium">{place.author.name}</div>

                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>


      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>
  );
}