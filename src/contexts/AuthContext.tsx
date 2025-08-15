'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User as DatabaseUser } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  profile: DatabaseUser | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<DatabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        // For testing: load demo user profile
        loadDemoProfile()
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        // For testing: load demo user profile
        loadDemoProfile()
      }
    })

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth loading timeout - forcing loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const loadDemoProfile = async () => {
    try {
      // Load Yashwanth's profile for testing when not authenticated
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', '1ee6046f-f3fd-4687-aced-ecb258ba2975')
        .single()

      if (!error && data) {
        setProfile(data)
        console.log('Demo profile loaded with avatar:', {
          name: data.full_name,
          avatar: data.avatar_url,
          email: data.email
        }) // Enhanced debug log
      } else {
        console.error('Failed to load demo profile:', error)
      }
    } catch (error) {
      console.error('Error loading demo profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If no profile found, try to create one from auth.users data
        await createProfileFromAuth(userId)
      } else {
        setProfile(data)
        console.log('Profile loaded:', data) // Debug log
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfileFromAuth = async (userId: string) => {
    try {
      // Get user data from auth.users and sync to public.users
      const { data: authUser } = await supabase.auth.getUser()
      if (authUser.user) {
        const metadata = authUser.user.user_metadata
        const { data: newProfile, error } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: authUser.user.email,
            full_name: metadata.full_name || metadata.name,
            avatar_url: metadata.avatar_url || metadata.picture
          })
          .select()
          .single()

        if (!error && newProfile) {
          setProfile(newProfile)
          console.log('Profile created/updated:', newProfile) // Debug log
        }
      }
    } catch (error) {
      console.error('Error creating profile from auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/explore/communities`
      }
    })
    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<DatabaseUser>) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    // Refresh profile data
    await fetchProfile(user.id)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}