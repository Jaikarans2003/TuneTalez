'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOut } from '@/firebase/auth';
import { UserProfile, createUserProfile, getUserProfile, updateUserRole } from '@/firebase/services';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateRole: (role: 'reader' | 'author' | 'admin') => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  updateRole: async () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // Try to get existing profile
          let userProfile = await getUserProfile(user.uid);
          
          // If no profile exists, create one with default role 'reader'
          if (!userProfile) {
            // Convert Firebase User to UserProfile format
            userProfile = await createUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
              role: 'reader'
            });
          }
          
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update loading state when profile is fetched and check admin status
  useEffect(() => {
    if (user && profile) {
      setLoading(false);
      setIsAdmin(profile.role === 'admin');
    }
  }, [user, profile]);

  const logout = async () => {
    await signOut();
  };

  const updateRole = async (role: 'reader' | 'author' | 'admin') => {
    if (user) {
      await updateUserRole(user.uid, role);
      // Update local profile state
      setProfile(prev => prev ? { ...prev, role } : null);
      // Update admin status if role changed
      setIsAdmin(role === 'admin');
    }
  };



  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, updateRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};