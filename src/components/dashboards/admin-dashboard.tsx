
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { DollarSign, Briefcase, Users, Download, TrendingUp, Server, Clock, User, CircleDot, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import type { Project, User as AppUser } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchData() {
        if (!firestore) return;
        setLoading(true);
        try {
            const projectsQuery = query(collection(firestore, "projects"));
            const usersQuery = query(collection(firestore, "users"));

            const [projectSnapshot, userSnapshot] = await Promise.all([
                getDocs(projectsQuery),
                getDocs(usersQuery),
            ]);

            const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
            
            setProjects(projectList);
            setUsers(userList);

        } catch (error) {
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [firestore]);

  const totalRaised = projects.reduce((acc, p) => acc + (p.raisedAmount || 0), 0);
  const activeCampaigns = projects.filter(p => p.status === 'live').length;
  const totalInvestors = users.filter(u => u.role === 'Investor').length;
  const commissionRevenue = projects
    .filter(p => p.raisedAmount >= p.targetAmount)
    .reduce((acc, p) => acc + (p.raisedAmount * 0.05), 0);

  const topCampaigns = [...projects]
    .filter(p => p.status === 'live')
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .slice(0, 5);


  if (loading) {
      return (
          <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
              </div>
              <Skeleton className="h-96" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
       <CardHeader className="p-0 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Platform-wide overview and management tools.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
             <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRaised)}</div>
            <p className="text-xs text-muted-foreground">+0.0% from last month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Revenue</CardTitle>
             <Link href="/dashboard/admin/commissions" className="h-4 w-4 text-muted-foreground">
                <DollarSign />
             </Link>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(commissionRevenue)}</div>
            <p className="text-xs text-muted-foreground">+0.0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">+0 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
             <Link href="/dashboard/admin/users" className="h-4 w-4 text-muted-foreground">
                <Users />
             </Link>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
            <p className="text-xs text-muted-foreground">+0 this month</p>
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-6 lg:grid-cols-3">
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
             <CardDescription>Campaigns with the highest funding velocity this week.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Amount Raised</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {topCampaigns.length > 0 ? topCampaigns.map(p => {
                        const percentage = Math.round((p.raisedAmount / p.targetAmount) * 100);
                        return (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <Link href={`/projects/${p.slug}`} className="font-medium hover:underline">{p.title}</Link>
                                    <div className="text-xs text-muted-foreground">{p.owner.name}</div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(p.raisedAmount)}</TableCell>
                                <TableCell className="text-center w-32">
                                     <Progress value={percentage} className="h-2" />
                                     <span className="text-xs text-muted-foreground">{percentage}%</span>
                                </TableCell>
                            </TableRow>
                        )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No live campaigns to display.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Project Readiness</CardTitle>
                  <CardDescription>Average scores across all submitted projects.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Competitiveness</p>
                      <p className="text-3xl font-bold">0.0<span className="text-base font-normal">/10</span></p>
                  </div>
                   <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Success Prospect</p>
                      <p className="text-3xl font-bold">0.0<span className="text-base font-normal">/10</span></p>
                  </div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Health of key platform services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-3">
                      <ul className="grid gap-3">
                          <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-2">
                                  <Server className="h-4 w-4" />
                                  Stripe API
                              </span>
                              <div className="flex items-center gap-2">
                                  <span className="text-sm">Operational</span>
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                              </div>
                          </li>
                          <li className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-2">
                                  <Server className="h-4 w-4" />
                                  AI Generation Service
                              </span>
                              <div className="flex items-center gap-2">
                                  <span className="text-sm">Operational</span>
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                              </div>
                          </li>
                      </ul>
                  </div>
              </CardContent>
          </Card>
        </div>
       </div>

       <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>An audit trail of important activities happening on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><div className="flex items-center gap-2"><Clock className="h-4 w-4" />Timestamp</div></TableHead>
                  <TableHead><div className="flex items-center gap-2"><User className="h-4 w-4" />Actor</div></TableHead>
                  <TableHead><div className="flex items-center gap-2"><CircleDot className="h-4 w-4" />Action</div></TableHead>
                  <TableHead><div className="flex items-center gap-2"><Fingerprint className="h-4 w-4" />Entity</div></TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    No log entries yet.
                    </TableCell>
                </TableRow>
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
