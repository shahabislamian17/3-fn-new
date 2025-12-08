
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useState, useEffect } from 'react';
import { Briefcase, HandCoins, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { gtm } from '@/lib/gtm';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['ProjectOwner', 'Investor'], {
    required_error: 'You need to select an account type.',
  }),
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signup } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const selectedRole = form.watch('role');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    
    try {
        await signup(values.email, values.password, { 
            displayName: values.name,
            role: values.role,
        });

        // Track GTM event
        gtm.push({
            event: 'signup',
            role: values.role
        });

        // Track registration event with Facebook Pixel
        if (window.fbq) {
            window.fbq('track', 'CompleteRegistration', {
            role: values.role
            });
        }
        router.push('/dashboard');
    } catch (err: any) {
        setError(err.message || "An unknown error occurred during signup.");
    } finally {
        setIsLoading(false);
    }
  }

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <Logo />
            <span className="font-bold text-lg">3JN CrowdFunding</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join our platform and start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <Card className={cn("cursor-pointer transition-all", selectedRole === 'ProjectOwner' ? "border-primary ring-2 ring-primary" : "hover:border-primary/50")}>
                                <div className="p-4 flex flex-col items-center justify-center text-center">
                                    <RadioGroupItem value="ProjectOwner" id="projectowner" className="sr-only"/>
                                    <Label htmlFor="projectowner" className="cursor-pointer">
                                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="font-semibold">Project Owner</p>
                                        <p className="text-xs text-muted-foreground">I want to raise capital for my business.</p>
                                    </Label>
                                </div>
                            </Card>
                          </FormControl>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <Card className={cn("cursor-pointer transition-all", selectedRole === 'Investor' ? "border-primary ring-2 ring-primary" : "hover:border-primary/50")}>
                                <div className="p-4 flex flex-col items-center justify-center text-center">
                                    <RadioGroupItem value="Investor" id="investor" className="sr-only"/>
                                    <Label htmlFor="investor" className="cursor-pointer">
                                        <HandCoins className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="font-semibold">Investor</p>
                                        <p className="text-xs text-muted-foreground">I want to invest in innovative projects.</p>
                                    </Label>
                                </div>
                            </Card>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline font-semibold hover:text-primary">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
