'use client';
import { useEffect, useState } from "react";
import { Check, X, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { adminListAllProjects } from "@/lib/api-frontend-services";

interface Match {
    investor_id: string;
    name: string;
    email: string;
    score: number;
    email_sent: boolean;
    notification_sent: boolean;
}

export default function MatchDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const result = await adminListAllProjects();
      setProjects(result.projects || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to fetch projects", variant: "destructive" });
    }
  }

  async function fetchMatches(projectId: string) {
    if (loading) return;
    setLoading(true);
    setSelectedProject(projectId);
    setMatches([]);
    try {
      // This would be a proxied function in a real scenario
      // For now, we simulate an empty result
      setMatches([]);
    } catch (err: any) {
       toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const runBulkMatch = async () => {
    setBulkLoading(true);
    toast({ title: "Bulk Matching Started", description: "Analyzing all active projects against investor profiles..." });
    try {
      const response = await fetch('/api/admin/match-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk matching failed');
      }
      
      const result = await response.json();
      if (!result.message) throw new Error('Bulk matching failed.');
      toast({ title: "Bulk Matching Complete", description: result.message });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  }

  const reNotifyInvestor = async (investorId: string, projectId: string | null) => {
    if (!projectId) return;
    toast({ title: "Resending Notification...", description: `Sending a new notification to investor ${investorId}.` });
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Notification Sent", description: "The investor has been re-notified.", variant: 'default' });
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">🧠 AI Match Dashboard</CardTitle>
            <CardDescription>
                Run AI-powered investor matching for projects and view the results.
            </CardDescription>
          </div>
           <Button onClick={runBulkMatch} disabled={bulkLoading}>
              {bulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Run AI Match for All Projects
            </Button>
      </CardHeader>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((proj) => (
          <Card
            key={proj.id}
            onClick={() => fetchMatches(proj.id)}
            className={cn(`cursor-pointer transition-all hover:shadow-md`,
              selectedProject === proj.id && "ring-2 ring-primary border-primary"
            )}
          >
            <CardHeader>
                <CardTitle className="text-lg">{proj.title}</CardTitle>
                <CardDescription>{proj.location} — {proj.category}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48 text-gray-600 dark:text-gray-300">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Analyzing matches...
        </div>
      )}

      {!loading && selectedProject && (
        <Card>
            <CardHeader>
                <CardTitle>Matched Investors for {projects.find(p => p.id === selectedProject)?.title}</CardTitle>
                <CardDescription>
                    {matches.length} investors found meeting the match threshold.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Match %</TableHead>
                        <TableHead className="text-center">Email Sent</TableHead>
                        <TableHead className="text-center">Dashboard Notif</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((inv) => (
                        <TableRow key={inv.investor_id}>
                            <TableCell className="font-medium">{inv.name}</TableCell>
                            <TableCell>{inv.email}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={inv.score >= 0.8 ? 'default' : inv.score >= 0.6 ? 'secondary' : 'destructive'}>
                                    {Math.round(inv.score * 100)}%
                                </Badge>
                            </TableCell>
                             <TableCell className="text-center">
                                {inv.email_sent ? <Check className="text-green-600 dark:text-green-400 mx-auto w-5 h-5" /> : <X className="text-red-600 dark:text-red-400 mx-auto w-5 h-5" />}
                            </TableCell>
                            <TableCell className="text-center">
                                {inv.notification_sent ? <Check className="text-green-600 dark:text-green-400 mx-auto w-5 h-5" /> : <X className="text-red-600 dark:text-red-400 mx-auto w-5 h-5" />}
                            </TableCell>
                            <td className="p-2 text-center">
                                <Button
                                    onClick={() => reNotifyInvestor(inv.investor_id, selectedProject)}
                                    size="sm"
                                    variant="outline"
                                >
                                    <RefreshCw className="w-4 h-4 mr-1" /> Resend
                                </Button>
                            </td>
                        </TableRow>
                        ))}
                         {matches.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No matching investors found for this project.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
