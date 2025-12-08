
'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function JoinTheMovement() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        await new Promise(res => setTimeout(res, 1000));
        setSubmitting(false);
        setSubmitted(true);
        toast({
            title: "Subscription Successful!",
            description: "Thanks for joining. Check your inbox for the latest updates.",
        });
    };

    return (
        <section id="join" className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                    {t('Join thousands building a smarter, greener economy.')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                    {t('Get started today. Sign up for early access to new projects and receive AI-powered investment recommendations weekly.')}
                </p>
                {submitted ? (
                     <p className="text-lg text-green-600 font-semibold">{t('Thanks — check your inbox!')}</p>
                ) : (
                    <form onSubmit={submit} className="max-w-md mx-auto space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('Your email address')}
                                className="flex-1 text-base"
                                required
                            />
                            <Button type="submit" disabled={submitting} size="lg">
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('Get Started')}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center space-x-2">
                                <Checkbox id="ai_recommendations" />
                                <Label htmlFor="ai_recommendations" className="text-xs text-muted-foreground">
                                    Receive AI-powered investment recommendations weekly
                                </Label>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <Checkbox id="gdpr" required />
                                <Label htmlFor="gdpr" className="text-xs text-muted-foreground">
                                    {t('I agree to the ')}<a href="/terms" className="underline hover:text-primary">{t('terms')}</a>{t(' and ')}<a href="/privacy" className="underline hover:text-primary">{t('privacy policy')}</a>.
                                </Label>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
