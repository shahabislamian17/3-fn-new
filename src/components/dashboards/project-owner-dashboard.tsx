
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { DollarSign, Briefcase, Users, PlusCircle, FilePen, Activity, CheckCircle2, TrendingUp, AlertCircle, Eye, Shield, Send, Check, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Project, User as AppUser } from '@/lib/types';
import { useAuth, useFirestore, useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const readinessHistory: any[] = [];

const initialPostFundingAssets: any[] = [];

export default function ProjectOwnerDashboard() {
  const { toast } = useToast();
  const [postFundingAssets, setPostFundingAssets] = useState(initialPostFundingAssets);
  const [regeneratingAsset, setRegeneratingAsset] = useState<string | null>(null);
  const [myCampaigns, setMyCampaigns] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { auth } = useFirebase();
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchCampaigns() {
        if (!user || !firestore) return;
        setLoading(true);
        try {
            const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
            const res = await fetch('/api/user/campaigns', {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMyCampaigns(data.campaigns || []);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    }
    fetchCampaigns();
  }, [user, firestore]);

  const totalRaised = myCampaigns.reduce((sum, camp) => sum + camp.raisedAmount, 0);
  const totalInvestors = myCampaigns.reduce((sum, camp) => sum + camp.investorCount, 0);
  const royaltyCampaigns = myCampaigns.filter(c => c.type === 'Royalty');
  const successfullyFundedCampaigns = myCampaigns.filter(c => c.raisedAmount >= c.targetAmount);

  const investorRoster: Record<string, AppUser[]> = {};
  myCampaigns.forEach(campaign => {
      investorRoster[campaign.id] = [];
  });

  const handleRequestKyc = () => {
    toast({
      title: "Requests Sent",
      description: "Automated KYC requests have been sent to all unverified investors.",
    });
  };
  
  const handleAssetAction = (assetName: string, newStatus: 'accepted' | 'edit_requested') => {
    setPostFundingAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.name === assetName ? { ...asset, status: newStatus } : asset
      )
    );
    toast({
      title: `Asset Status Updated`,
      description: `${assetName} has been marked as '${newStatus.replace('_', ' ')}'.`
    });
  };

  const handleRegenerate = async (assetName: string) => {
    setRegeneratingAsset(assetName);
    toast({
        title: "Regenerating Asset...",
        description: `The AI is creating a new version of the ${assetName}.`
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI thinking time

    setPostFundingAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.name === assetName
            ? { ...asset, status: 'generated', confidence: Math.random() * (0.98 - 0.85) + 0.85 } // New random confidence
            : asset
        )
      );

    setRegeneratingAsset(null);
    toast({
        title: "Asset Regenerated!",
        description: `A new version of the ${assetName} has been regenerated.`
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <CardHeader className="p-0 mb-6">
        <CardTitle>Project Owner Dashboard</CardTitle>
        <CardDescription>Manage your campaigns and track their performance.</CardDescription>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funds Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRaised)}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">Currently fundraising</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
            <p className="text-xs text-muted-foreground">Backing your projects</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Campaign Health &amp; Status</CardTitle>
            <CardDescription>Monitor the status of your funded campaigns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {myCampaigns.filter(p => p.status === 'funded_pending_checks').map(project => (
                <Card className="bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800" key={project.id}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="text-amber-600"/>
                            <Link href={`/projects/${project.slug}`} className="hover:underline">{project.title}</Link>: Compliance checks in progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Payout Pending</p>
                            <p className="text-xs text-muted-foreground">Funds are on hold until all checks are complete.</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Investor KYC Completion</label>
                            <Progress value={85} className="h-2 mt-1" />
                            <p className="text-xs text-muted-foreground mt-1">85% of investors verified.</p>
                        </div>
                        <div className="flex items-center">
                            <Button size="sm" onClick={handleRequestKyc}><Send className="mr-2"/>Request Investors to Complete KYC</Button>
                        </div>
                    </CardContent>
                </Card>
             ))}
             {myCampaigns.find(p => p.status === 'blocked') && (
                <Card className="bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="text-red-600"/>
                            <Link href={`/projects/artisan-roast-collective`} className="hover:underline">Artisan Roast Collective</Link>: Blocked
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-800 dark:text-red-300">Your campaign has been blocked due to a high-risk flag on a major investor. Please contact support for next steps.</p>
                    </CardContent>
                </Card>
             )}
             {myCampaigns.find(p => p.status === 'funded_documents_sent') && (
                 <Card className="bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="text-green-600"/>
                            <Link href={`/projects/${myCampaigns.find(p => p.status === 'funded_documents_sent')?.slug}`} className="hover:underline">
                                {myCampaigns.find(p => p.status === 'funded_documents_sent')?.title}
                            </Link>: Funded &amp; Awaiting Signatures
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4 items-center">
                        <div>
                            <p className="text-sm font-semibold">Action Required</p>
                            <p className="text-xs text-muted-foreground">Please review and sign the generated legal documents to proceed with fund disbursement.</p>
                        </div>
                         <div>
                            <label className="text-sm font-semibold">Signature Progress</label>
                            <Progress value={10} className="h-2 mt-1" />
                            <p className="text-xs text-muted-foreground mt-1">1/10 required signatures complete.</p>
                        </div>
                        <div className="flex items-center">
                            <Button variant="secondary" asChild>
                                <Link href="/dashboard/admin/compliance/run-uuid-456">
                                    <FilePen className="mr-2"/> Review &amp; Sign Documents
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            {!myCampaigns.some(p => ['funded_pending_checks', 'blocked', 'funded_documents_sent'].includes(p.status || '')) && (
                 <div className="text-center py-10 text-muted-foreground">No active campaigns require health checks.</div>
            )}
        </CardContent>
      </Card>
      
        {successfullyFundedCampaigns.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Post-Funding Assets</CardTitle>
                    <CardDescription>Review AI-generated business assets for your successfully funded campaign.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead>AI Confidence</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {postFundingAssets.length > 0 ? postFundingAssets.map(asset => (
                                <TableRow key={asset.name}>
                                    <TableCell className="font-semibold">{asset.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={asset.confidence > 0.9 ? 'default' : 'secondary'}>
                                            {(asset.confidence * 100).toFixed(0)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={asset.status === 'accepted' ? 'default' : 'secondary'} className="capitalize">{asset.status.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">Preview</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{asset.name}</DialogTitle>
                                                    <DialogDescription>AI-Generated Content Preview</DialogDescription>
                                                </DialogHeader>
                                                <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto p-1 text-muted-foreground">
                                                    Content preview is not available.
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="sm" onClick={() => handleAssetAction(asset.name, 'accepted')} disabled={asset.status === 'accepted'}>
                                            <Check className="mr-2 h-4 w-4"/>Accept
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleAssetAction(asset.name, 'edit_requested')}>
                                            <Edit className="mr-2 h-4 w-4"/>Request Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleRegenerate(asset.name)} disabled={!!regeneratingAsset}>
                                            {regeneratingAsset === asset.name ? <Loader2 className="animate-spin" /> : 'Regenerate'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                 <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No post-funding assets generated yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}


       <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>My Campaigns</CardTitle>
              <CardDescription>An overview of your fundraising campaigns.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/create-project">
                New Campaign
                <PlusCircle className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress (Amount Raised vs Target)</TableHead>
                  <TableHead className="text-right">Investors</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myCampaigns.length > 0 ? myCampaigns.map((project) => {
                    const percentage = Math.round((project.raisedAmount / project.targetAmount) * 100);
                    return (
                        <TableRow key={project.id}>
                            <TableCell>
                            <div className="font-medium">{project.title}</div>
                            <div className="text-sm text-muted-foreground">{project.type}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={project.status === 'live' ? 'default' : 'secondary'} className="capitalize">{project.status}</Badge>
                            </TableCell>
                             <TableCell>
                                <div className="flex flex-col gap-1">
                                    <Progress value={percentage} className="h-2 w-full" />
                                    <span className="text-xs text-muted-foreground">{formatCurrency(project.raisedAmount, project.currency)} of {formatCurrency(project.targetAmount, project.currency)} ({percentage}%)</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{project.investorCount}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/projects/${project.slug}`}>
                                    <FilePen className="mr-2 h-4 w-4" />
                                    Manage
                                  </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                }) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">You haven't created any campaigns yet.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {successfullyFundedCampaigns.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Investor Rosters</CardTitle>
                <CardDescription>Contact information for investors in your successfully funded campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {successfullyFundedCampaigns.map((project) => (
                        <AccordionItem value={`item-${project.id}`} key={project.id}>
                            <AccordionTrigger>{project.title}</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Location</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {investorRoster[project.id]?.length > 0 ? investorRoster[project.id].map(investor => (
                                            <TableRow key={investor.id}>
                                                <TableCell>{investor.name}</TableCell>
                                                <TableCell>{investor.email}</TableCell>
                                                <TableCell>{investor.phone || 'N/A'}</TableCell>
                                                <TableCell>{investor.city}, {investor.country}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No investors for this campaign yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>AI-Suggested Optimizations</CardTitle>
                <CardDescription>Recommendations to improve your campaign performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
                    <Activity className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <p className="font-semibold">Update your pitch for 'EcoDrone Innovations'</p>
                        <p className="text-sm text-muted-foreground">Consider adding more details about your team's experience to build more investor trust. An updated pitch could increase investment velocity by up to 15%.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <p className="font-semibold">Improve Your Readiness Score</p>
                        <p className="text-sm text-muted-foreground">Your 'Artisan Roast Collective' project has a moderate success score. Try adding more details about your supply chain to improve it.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Readiness History</CardTitle>
                <CardDescription>Track your project readiness scores over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Competitiveness</TableHead>
                            <TableHead>Success Prospect</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {readinessHistory.length > 0 ? readinessHistory.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.competitivenessScore}/10</TableCell>
                                <TableCell>{item.successScore}/10</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="icon">
                                        <Link href="/dashboard/readiness">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No readiness history found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       {royaltyCampaigns.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Projected Royalty Repayments</CardTitle>
                <CardDescription>An overview of projected returns for your royalty-based campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Campaign</TableHead>
                            <TableHead className="text-right">Total Return Multiple</TableHead>
                            <TableHead className="text-right">Projected Payback</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {royaltyCampaigns.map(proj => (
                             <TableRow key={proj.id}>
                                <TableCell className="font-medium">{proj.title}</TableCell>
                                <TableCell className="text-right">{proj.repaymentMultiple}x</TableCell>
                                <TableCell className="text-right">~18 months</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
       )}
    </div>
  );
}
