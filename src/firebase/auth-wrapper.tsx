
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/firebase/auth/use-auth';
import { Loader2 } from 'lucide-react';

export function AuthWrapper({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
