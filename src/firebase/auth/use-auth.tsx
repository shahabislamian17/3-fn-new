
'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { useFirebase, useFirestore } from '../client-provider';
import type { UserCredential, UserInfo } from 'firebase/auth';
import type { User as AppUser } from '@/lib/types';
import { getUser, createUser } from '@/services/user';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, pass: string) => Promise<UserCredential>;
  signup: (email: string, pass: string, userInfo: Partial<UserInfo> & { role: 'Investor' | 'ProjectOwner' }) => Promise<UserCredential>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  login: () => { throw new Error('Not implemented') },
  signup: () => { throw new Error('Not implemented') },
  logout: () => { throw new Error('Not implemented') },
  refreshUser: () => { throw new Error('Not implemented') },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, _setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!auth?.currentUser || !firestore) return;
    const dbUser = await getUser(firestore, auth.currentUser.uid);
    if (dbUser) {
      setUser({ ...auth.currentUser, ...dbUser });
    }
  }

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(true);
      return;
    }

    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      setLoading(true);
      if (firebaseUser) {
        try {
          const dbUser = await getUser(firestore, firebaseUser.uid);
          if (!isMounted) return;
          
          if (dbUser) {
            setUser({ ...firebaseUser, ...dbUser });
          } else {
            // This case handles newly signed up users before their DB record is created
            setUser({
              ...firebaseUser,
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              role: 'Investor' // Default role
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (!isMounted) return;
          // Fallback to basic user data
          setUser({
            ...firebaseUser,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            role: 'Investor'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [auth, firestore]);

  const value = useMemo(() => {
    const login = async (email: string, pass: string) => {
      if (!auth) {
        throw new Error('Auth is not initialized');
      }
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          credentials: 'include', // Ensure cookies are included
      });
      
      if (!response.ok) {
        throw new Error('Failed to set session cookie');
      }
      
      // Small delay to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return cred;
    };

    const signup = async (email: string, pass: string, userInfo: Partial<UserInfo> & { role: 'Investor' | 'ProjectOwner' }) => {
      if (!auth || !firestore) {
        throw new Error('Auth is not initialized');
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      
      const { user: firebaseUser } = userCredential;

      await updateProfile(firebaseUser, {
        displayName: userInfo.displayName,
        photoURL: userInfo.photoURL || `https://avatar.vercel.sh/${userInfo.displayName || firebaseUser.email}.png`
      });

      const newUser: Partial<AppUser> = {
          id: firebaseUser.uid,
          name: userInfo.displayName || 'New User',
          email: firebaseUser.email!,
          role: userInfo.role,
          status: 'active',
      }
      await createUser(firestore, firebaseUser.uid, newUser);
      
      setUser({ ...firebaseUser, ...newUser } as AppUser);
      
       // Set session cookie
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: 'include', // Ensure cookies are included
      });
      
      if (!response.ok) {
        throw new Error('Failed to set session cookie');
      }
      
      // Small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return userCredential;
    };

    const logout = async () => {
      if (!auth) {
        throw new Error('Auth is not initialized');
      }
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
    };

    return { user, loading, error, login, signup, logout, refreshUser };
  }, [user, loading, error, auth, firestore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
