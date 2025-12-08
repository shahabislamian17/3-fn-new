
'use client';
import React, { useState, useEffect, useContext, createContext } from 'react';
import { initializeFirebase } from '.';
import { AuthProvider } from './auth/use-auth';
import { firebaseConfig } from './config';

import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableNetwork } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseServices | null>(null);

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !services) {
      if (!firebaseConfig.apiKey) {
        const errorMessage = "Firebase API Key is missing. Please check your .env file.";
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }

      const initializeAndConnect = async () => {
          try {
            const { firebaseApp } = initializeFirebase();
            const auth = getAuth(firebaseApp);
            const firestore = getFirestore(firebaseApp);
            
            // Explicitly enable the network and wait for it to be ready
            await enableNetwork(firestore);

            setServices({ firebaseApp, firestore, auth });
          } catch (e: any) {
            console.error("Firebase initialization failed:", e);
            setError(e.message);
          }
      };

      initializeAndConnect();
    }
  }, [services]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription>
            Could not initialize Firebase. Please ensure your `.env` file is correctly configured with your Firebase project credentials.
            <pre className="mt-2 rounded-md bg-muted p-2 text-xs font-mono">
              {error}
            </pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Connecting to Services...</span>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={services}>
      <AuthProvider>{children}</AuthProvider>
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useFirebase must be used within a FirebaseClientProvider");
    }
    return context;
};

export const useFirestore = () => {
  const { firestore } = useFirebase();
  if (!firestore) {
    throw new Error('useFirestore must be used within a FirebaseClientProvider');
  }
  return firestore;
};

export const useFirebaseApp = () => {
    const { firebaseApp } = useFirebase();
    if (!firebaseApp) {
        throw new Error("useFirebaseApp must be used within a FirebaseClientProvider");
    }
    return firebaseApp;
}
