
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowUpRight, DollarSign, Briefcase, TrendingUp, Bell, FileText, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
import { suggestProjects, SuggestProjectsOutput } from '@/ai/flows/suggest-projects';
import type { Project, User as AppUser, Investment, Notification } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth, useFirestore } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where } from 'firebase/firestore';

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });

const chartData = [
  { month: 'January', portfolioValue: 10000 },
  { month: 'February', portfolioValue: 10500 },
  { month: 'March', portfolioValue: 11200 },
  { month: 'April', portfolioValue: 11000 },
  { month: 'May',
    portfolioValue: 11800 },
  { month: 'June', portfolioValue: 12500 },
];

const chartConfig = {
  portfolioValue: {
    label: 'Portfolio Value',
    color: 'hsl(var(--primary))',
  },
} satisfies import('@/components/ui/chart').ChartConfig;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

function ProjectSuggestions({ user, allProjects, investments }: { user: AppUser | null, allProjects: Project[], investments: Investment[] }) {
    const [suggestions, setSuggestions] = useState<SuggestProjectsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchSuggestions() {
            setIsLoading(true);
            try {
                const investorProfile = {
                    riskAppetite: user?.risk_tolerance || "medium",
                    preferredCategories: user?.preferred_categories || ['Technology & Digital Platforms', 'Financial & Business Services'],
                    preferredCountries: user?.preferred_countries || [],
                    portfolio: investments.map(inv => ({
                        id: inv.project.slug,
                        title: inv.project.title,
                        category: allProjects.find(p => p.slug === inv.project.slug)?.category || '',
                        type: inv.project.type,
                        location: allProjects.find(p => p.slug === inv.project.slug)?.location || '',
                        shortDescription: allProjects.find(p => p.slug === inv.project.slug)?.shortDescription || '',
                    })),
                    preferredInvestmentTypes: user?.preferred_investment_types
                };

                const availableProjects = allProjects.map(p => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    type: p.type,
                    location: p.location,
                    shortDescription: p.shortDescription,
                }));

                const result = await suggestProjects({
                    investorProfile,
                    availableProjects
                });
                setSuggestions(result);

            } catch (error) {
                console.error("Failed to fetch project suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSuggestions();
    }, [user, allProjects, investments]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!suggestions || suggestions.suggestions.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-8">No new suggestions at this time.</p>
    }
    
    const suggestedProjects = suggestions.suggestions.map(s => {
        const project = allProjects.find(p => p.id === s.projectId);
        return project ? { ...project, reasoning: s.reasoning, matchScore: s.matchScore } : null;
    }).filter((p): p is Project & { reasoning: string, matchScore: number } => p !== null);


    return (
        <div className="space-y-4">
            {suggestedProjects.map(proj => (
                <Card key={proj.id} className="bg-secondary/50">
                    <CardHeader className="pb-2 flex-row justify-between items-start">
                        <div>
                            <Link href={`/projects/${proj.slug}`}>
                                <CardTitle className="text-base hover:underline">{proj.title}</CardTitle>
                            </Link>
                            <CardDescription>{proj.location}</CardDescription>
                        </div>
                        <Badge>{proj.matchScore?.toFixed(0)}% Match</Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic">"{proj.reasoning}"</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function InvestorDashboard() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const totalInvested = useMemo(() => investments.reduce((sum, inv) => sum + inv.amount, 0), [investments]);
  const portfolioValue = useMemo(() => investments.reduce((sum, inv) => sum + (inv.amount * (1 + inv.roi / 100)), 0), [investments]);
  const overallRoi = totalInvested > 0 ? ((portfolioValue / totalInvested) - 1) * 100 : 0;
  
  const appUser = user as AppUser | null;
  const needsKyc = true; 
  const cumulativeInvestment = 55000;
  const investmentThreshold = 50000;

  useEffect(() => {
    async function fetchData() {
      if (!firestore || !user?.id) return;
      setLoading(true);
      try {
        const investmentsQuery = query(collection(firestore, "investments"), where("userId", "==", user.id));
        const projectsQuery = query(collection(firestore, "projects"), where("status", "==", "live"));
        
        const [investmentsSnapshot, projectsSnapshot] = await Promise.all([
            getDocs(investmentsQuery),
            getDocs(projectsQuery),
        ]);

        const investmentsData = investmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
        setInvestments(investmentsData);

        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(projectsData);
        
        const idToken = await user.getIdToken();
        const notificationsRes = await fetch('/api/notifications', { 
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData || []);

      } catch (error) {
        // Silently fail on dashboard
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, firestore]);

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
                <Skeleton className="h-96 lg:col-span-3" />
                <Skeleton className="h-96 lg:col-span-2" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle>Investor Dashboard</CardTitle>
        <CardDescription>Track your investments and portfolio performance.</CardDescription>
      </CardHeader>

      {needsKyc && (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required: Complete Your Profile</AlertTitle>
            <div className="flex justify-between items-center">
                 <AlertDescription>
                    Please complete your identity verification (KYC) to enable all platform features and avoid investment delays.
                </AlertDescription>
                <Button asChild>
                    <Link href="/dashboard/account?tab=verification">Complete KYC</Link>
                </Button>
            </div>
        </Alert>
      )}

      {cumulativeInvestment > investmentThreshold && (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required: Additional Verification Needed</AlertTitle>
            <div className="flex justify-between items-center">
                <AlertDescription>
                    Because your cumulative investments have exceeded {formatCurrency(investmentThreshold)}, additional verification (EDD) is required. Please provide the requested information to continue investing.
                </AlertDescription>
                <Button asChild variant="secondary">
                    <Link href="/dashboard/account?tab=verification">Start Verification</Link>
                </Button>
            </div>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalInvested)} total invested</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallRoi.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(portfolioValue - totalInvested)} total returns
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Your portfolio value over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <defs>
                    <linearGradient id="fillPortfolioValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-portfolioValue)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-portfolioValue)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <Area dataKey="portfolioValue" type="natural" fill="url(#fillPortfolioValue)" stroke="var(--color-portfolioValue)" stackId="a" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <Tabs defaultValue="notifications">
                <CardHeader>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="ai_matches">AI Matches</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <TabsContent value="notifications">
                    <CardContent className="space-y-4">
                       {notifications.length > 0 ? (
                            notifications.map(notification => (
                            <div key={notification.id} className="flex items-start gap-3">
                                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!notification.read ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground">{format(parseISO(notification.date), "PPP")}</p>
                                </div>
                            </div>
                        ))
                        ) : (
                           <div className="text-center text-sm text-muted-foreground py-8">No notifications yet.</div>
                        )}
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/dashboard/transactions"><FileText className="mr-2 h-4 w-4" /> View All Tax Documents</Link>
                        </Button>
                    </CardContent>
                </TabsContent>
                <TabsContent value="ai_matches">
                    <CardContent>
                         <ProjectSuggestions user={appUser} allProjects={projects} investments={investments} />
                    </CardContent>
                </TabsContent>
            </Tabs>
        </Card>
      </div>

    </div>
  );
}
