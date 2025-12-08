
'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, DollarSign, TrendingUp, Users, PlusCircle, FilePen, Loader2 } from "lucide-react";
import type { Investment, Project, User as AppUser } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getPlaceholderImage } from "@/lib/assets/placeholder-images";


const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
};

function InvestorPortfolioView({ investments: allInvestments, type }: { investments: Investment[], type: 'All' | 'Equity' | 'Royalty' }) {
    const investments = type === 'All' ? allInvestments : allInvestments.filter(inv => inv.project.type === type);
    const totalInvested = useMemo(() => investments.reduce((sum, inv) => sum + inv.amount, 0), [investments]);
    const avgRoi = useMemo(() => {
        if (investments.length === 0) return 0;
        const totalRoi = investments.reduce((sum, inv) => sum + inv.roi, 0);
        return totalRoi / investments.length;
    }, [investments]);

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{investments.length}</div>
                        <p className="text-xs text-muted-foreground">{type} investments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInvested, 'USD')}</div>
                         <p className="text-xs text-muted-foreground">in {type} projects</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${avgRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{avgRoi.toFixed(1)}%</div>
                         <p className="text-xs text-muted-foreground">across {type} projects</p>
                    </CardContent>
                </Card>
            </div>
             <div className="divide-y divide-border rounded-lg border">
                {investments.length > 0 ? investments.map(investment => {
                    const project = investment.project;
                    const totalReturn = project.repaymentMultiple ? investment.amount * project.repaymentMultiple : 0;
                    const returnProgress = totalReturn > 0 ? ((investment.repaid || 0) / totalReturn) * 100 : 0;
                    const image = getPlaceholderImage(project.imageHint);

                    return (
                        <div key={investment.id} className="block first:rounded-t-lg last:rounded-b-lg transition-colors p-4">
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <Link href={`/projects/${project.slug}`} className="flex-shrink-0">
                                    <Image 
                                        src={image.imageUrl}
                                        alt={project.title}
                                        width={120}
                                        height={80}
                                        className="rounded-md object-cover w-full sm:w-[120px] h-auto sm:h-[80px]"
                                        data-ai-hint={image.imageHint}
                                    />
                                </Link>
                                <div className="flex-grow grid gap-2 w-full">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Link href={`/projects/${project.slug}`} className="font-semibold hover:underline">{project.title}</Link>
                                        <Badge variant={project.type === 'Equity' ? 'default' : 'secondary'}>{project.type}</Badge>
                                        <Badge variant={investment.status === 'Active' ? 'outline' : 'default'} className="ml-auto sm:ml-0">{investment.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                                        <div>
                                            <div className="text-muted-foreground">Invested</div>
                                            <div className="font-semibold">{formatCurrency(investment.amount, 'USD')}</div>
                                        </div>
                                         <div>
                                            <div className="text-muted-foreground">Current ROI</div>
                                            <div className={`font-semibold ${investment.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>{investment.roi.toFixed(1)}%</div>
                                        </div>
                                        {investment.project.type === 'Equity' && (
                                            <div>
                                                <div className="text-muted-foreground">Ownership</div>
                                                <div className="font-semibold">{investment.ownership?.toFixed(3)}%</div>
                                            </div>
                                        )}
                                        {investment.project.type === 'Royalty' && (
                                            <div>
                                                <div className="text-muted-foreground">Total Repaid</div>
                                                <div className="font-semibold">{formatCurrency(investment.repaid || 0, 'USD')}</div>
                                            </div>
                                        )}
                                    </div>
                                    {investment.project.type === 'Royalty' && (
                                        <div className="mt-2">
                                            <label className="text-xs text-muted-foreground">Return Progress ({project.repaymentMultiple}x)</label>
                                            <Progress value={returnProgress} className="h-2" />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>{formatCurrency(investment.repaid || 0, 'USD')}</span>
                                                <span>{formatCurrency(totalReturn, 'USD')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center p-8 text-muted-foreground">
                        No {type} investments found.
                    </div>
                )}
            </div>
        </div>
    )
}

function OwnerCampaignsView({ myCampaigns }: { myCampaigns: Project[] }) {
  const totalRaised = myCampaigns.reduce((sum, camp) => sum + camp.raisedAmount, 0);
  const totalInvestors = myCampaigns.reduce((sum, camp) => sum + camp.investorCount, 0);

  return (
    <div>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
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
                    <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRaised, 'USD')}</div>
                    <p className="text-xs text-muted-foreground">Across all campaigns</p>
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
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            You have not created any campaigns yet.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
    </div>
  );
}

export default function PortfolioPage() {
    const { user } = useAuth();
    const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
    const [myCampaigns, setMyCampaigns] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    
    const appUser = user as AppUser | null;
    const isInvestor = appUser?.role === 'Investor';

    useEffect(() => {
        async function fetchData() {
            if (!appUser) return;
            setLoading(true);
            try {
                if (isInvestor) {
                    const res = await fetch('/api/user/investments');
                    if (res.ok) {
                        const data = await res.json();
                        setMyInvestments(data.investments || []);
                    }
                } else if (appUser.role === 'ProjectOwner') {
                    const res = await fetch('/api/user/campaigns');
                    if (res.ok) {
                        const data = await res.json();
                        setMyCampaigns(data.campaigns || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch portfolio data", error);
            } finally {
                setLoading(false);
            }
        }
        if (appUser) {
            fetchData();
        }
    }, [appUser, isInvestor]);


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!appUser) {
        return null;
    }

    const equityInvestments = myInvestments.filter(inv => inv.project.type === 'Equity');
    const royaltyInvestments = myInvestments.filter(inv => inv.project.type === 'Royalty');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isInvestor ? 'My Investment Portfolio' : 'My Campaigns'}</CardTitle>
                <CardDescription>
                    {isInvestor 
                        ? 'An overview of all your investments. Filter by type to see a detailed breakdown.'
                        : 'Manage your campaigns and track their performance.'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isInvestor ? (
                    <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                            <TabsTrigger value="all">All Investments</TabsTrigger>
                            <TabsTrigger value="equity">Equity</TabsTrigger>
                            <TabsTrigger value="royalty">Royalty</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-6">
                            <InvestorPortfolioView investments={myInvestments} type="All" />
                        </TabsContent>
                        <TabsContent value="equity" className="mt-6">
                            <InvestorPortfolioView investments={equityInvestments} type="Equity" />
                        </TabsContent>
                        <TabsContent value="royalty" className="mt-6">
                            <InvestorPortfolioView investments={royaltyInvestments} type="Royalty" />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <OwnerCampaignsView myCampaigns={myCampaigns} />
                )}
            </CardContent>
        </Card>
    )
}
