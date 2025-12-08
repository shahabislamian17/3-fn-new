
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
  sendPasswordResetEmail,
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
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  login: () => { throw new Error('Not implemented') },
  signup: () => { throw new Error('Not implemented') },
  logout: () => { throw new Error('Not implemented') },
  resetPassword: () => { throw new Error('Not implemented') },
  refreshUser: () => { throw new Error('Not implemented') },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<AppUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!auth?.currentUser || !firestore) return;
    const dbUser = await getUser(firestore, auth.currentUser.uid);
    if (dbUser) {
      setUser({ ...(auth.currentUser as any), ...dbUser });
    }
  }

  useEffect(() => {
    if (!auth || !firestore) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const dbUser = await getUser(firestore, firebaseUser.uid);
        if (dbUser) {
            setUser({ ...(firebaseUser as any), ...dbUser });
        } else {
            // This case handles newly signed up users before their DB record is created
             setUser({
              ...(firebaseUser as any),
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              role: 'Investor' // Default role
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const value = useMemo(() => {
    const login = async (email: string, pass: string) => {
      if (!auth) {
        throw new Error('Auth is not initialized');
      }
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
      });
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
      
      setUser({ ...(firebaseUser as any), ...newUser } as AppUser);
      
       // Set session cookie
      const idToken = await firebaseUser.getIdToken();
       await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      return userCredential;
    };
    
    const resetPassword = async (email: string) => {
        if (!auth) {
            throw new Error('Auth is not initialized');
        }
        await sendPasswordResetEmail(auth, email);
    }

    const logout = async () => {
      if (!auth) {
        throw new Error('Auth is not initialized');
      }
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
    };

    return { user, loading, error, login, signup, logout, resetPassword, refreshUser };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
