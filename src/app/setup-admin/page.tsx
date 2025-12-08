'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function SetupAdminPage() {
  const { user } = useAuth();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if user is already SuperAdmin
  useEffect(() => {
    if (user && (user as any).role === 'SuperAdmin') {
      setIsSuperAdmin(true);
    }
  }, [user]);

  const handlePromoteToSuperAdmin = async () => {
    if (!user || !firestore || !auth?.currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action.',
        variant: 'destructive',
      });
      return;
    }

    const userId = auth.currentUser.uid;
    
    setLoading(true);
    try {
      // First, try to update via API (if it exists)
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('/api/admin/promote-superadmin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          toast({
            title: 'Success!',
            description: 'You have been promoted to SuperAdmin. Please refresh the page.',
          });
          setTimeout(() => {
            router.push('/dashboard');
            window.location.reload();
          }, 2000);
          return;
        }
      } catch (apiError) {
        console.log('API endpoint not available, trying direct Firestore update...');
      }

      // Fallback: Direct Firestore update (requires Firestore rules to allow this)
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await updateDoc(userDocRef, {
          id: userId,
          email: user.email || auth.currentUser.email || '',
          name: user.name || auth.currentUser.displayName || 'Super Admin',
          role: 'SuperAdmin',
          status: 'active',
        });
      } else {
        // Update existing user document
        await updateDoc(userDocRef, {
          role: 'SuperAdmin',
        });
      }

      toast({
        title: 'Success!',
        description: 'You have been promoted to SuperAdmin. Please refresh the page.',
      });
      
      setTimeout(() => {
        router.push('/dashboard');
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error promoting to SuperAdmin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to promote to SuperAdmin. You may need to update Firestore rules or use Firebase Console.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuperAdmin) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              Already SuperAdmin
            </CardTitle>
            <CardDescription>
              You already have SuperAdmin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Setup SuperAdmin Account
          </CardTitle>
          <CardDescription>
            Promote your account to SuperAdmin role for initial setup. This allows you to approve projects and manage the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This page is for initial setup only. After promoting yourself to SuperAdmin, you can:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Approve submitted projects at /dashboard/admin/approvals</li>
                <li>Manage users and roles at /dashboard/admin/users</li>
                <li>Access all admin features</li>
              </ul>
            </AlertDescription>
          </Alert>

          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Current User:</p>
                <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                <p className="text-sm text-muted-foreground">Current Role: {(user as any).role || 'Not set'}</p>
              </div>

              <Button
                onClick={handlePromoteToSuperAdmin}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Promoting to SuperAdmin...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Promote to SuperAdmin
                  </>
                )}
              </Button>

              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> If this fails due to Firestore security rules, you can manually update your role in Firebase Console:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to Firebase Console → Firestore Database</li>
                    <li>Navigate to the <code>users</code> collection</li>
                    <li>Find your user document (by your Firebase Auth UID)</li>
                    <li>Update the <code>role</code> field to <code>SuperAdmin</code></li>
                    <li>Refresh this page</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Logged In</AlertTitle>
              <AlertDescription>
                Please log in first, then return to this page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

