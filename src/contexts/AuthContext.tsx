'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User as DatabaseUser } from '../lib/database.types'

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
  
  // Check if user has explicitly signed out (persisted in localStorage)
  const getHasSignedOut = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSignedOut') === 'true'
    }
    return false
  }
  
  const setHasSignedOut = (value: boolean) => {
    if (typeof window !== 'undefined') {
      if (value) {
        localStorage.setItem('hasSignedOut', 'true')
      } else {
        localStorage.removeItem('hasSignedOut')
      }
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        // No demo profile loading - user must sign in to see profile
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        setHasSignedOut(false) // Reset sign out flag when user signs in
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        // No demo profile loading - user must sign in to see profile
        setLoading(false)
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
    setHasSignedOut(true) // Mark that user has explicitly signed out
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