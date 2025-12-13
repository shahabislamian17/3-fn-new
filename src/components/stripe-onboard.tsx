
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StripeOnboard({ user }: { user: User }) {
    const { toast } = useToast();
    const [status, _setStatus] = useState(user.stripe_onboard_status || 'not_started');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reauth')) {
            toast({ title: 'Re-authentication needed', description: 'Please continue your Stripe onboarding.' });
        }
    }, [toast]);

    const createAccountAndRedirect = async () => {
        setLoading(true);
        try {
            const createAccountRes = await fetch('/api/stripe/create-connected-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!createAccountRes.ok) throw new Error('Failed to create Stripe account.');

            const createLinkRes = await fetch('/api/stripe/create-onboarding-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!createLinkRes.ok) throw new Error('Failed to create onboarding link.');
            const { url } = await createLinkRes.json();
            
            window.location.href = url;

        } catch (error: any) {
            toast({
                title: 'Onboarding Failed',
                description: error.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout Account Setup</CardTitle>
                <CardDescription>
                    To receive funds from your successful campaigns, you must connect a payout account. We use Stripe for secure payment processing.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                        {status === 'completed' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        )}
                        <div>
                            <p className="font-semibold">Stripe Express Onboarding</p>
                            <p className="text-sm text-muted-foreground capitalize">Status: {status.replace('_', ' ')}</p>
                        </div>
                    </div>
                     <Button onClick={createAccountAndRedirect} disabled={loading || status === 'completed'}>
                        {loading ? <Loader2 className="animate-spin" /> : (
                            status === 'completed' ? 'Onboarding Complete' :
                            status === 'pending' ? 'Continue Onboarding' : 'Connect with Stripe'
                        )}
                    </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                    By connecting your account, you agree to our payment provider's terms of service.
                </p>
            </CardContent>
        </Card>
    );
}
