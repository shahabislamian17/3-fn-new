
'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/types';
import { generateReadinessScore, GenerateReadinessScoreOutput } from '@/ai/flows/generate-readiness-score';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

type CampaignWithAISuggestion = Project & {
    aiSuggestion?: GenerateReadinessScoreOutput;
};

const getScoreColorClass = (score: number) => {
    if (score >= 8) return 'bg-green-500 text-white';
    if (score >= 5) return 'bg-amber-500 text-white';
    return 'bg-red-500 text-white';
};


export default function ApprovalsPage() {
  const [campaignsForApproval, setCampaignsForApproval] = useState<CampaignWithAISuggestion[]>([]);
  const [usersForKyc, _setUsersForKyc] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchSubmittedProjects() {
        if (!firestore) return;
        setLoading(true);
        try {
            const projectsRef = collection(firestore, 'projects');
            const q = query(projectsRef, where('status', '==', 'submitted'));
            const querySnapshot = await getDocs(q);
            
            const submittedProjects: Project[] = [];
            querySnapshot.forEach((doc) => {
                submittedProjects.push({ id: doc.id, ...doc.data() } as Project);
            });
            
            const projectsWithSuggestions = await Promise.all(
              submittedProjects.map(async (project) => {
                try {
                  const suggestion = await generateReadinessScore({
                    sector: project.category,
                    location: project.location,
                    stage: project.investmentStage,
                    fundingType: project.type,
                    targetAmount: project.targetAmount,
                    description: project.longDescription,
                  });
                  return { ...project, aiSuggestion: suggestion };
                } catch (e) {
                  return { ...project, aiSuggestion: {
                    competitivenessScore: 0,
                    successScore: 0,
                    summary: 'AI analysis failed to run.',
                    improvementPlan: []
                  } };
                }
              })
            );

            setCampaignsForApproval(projectsWithSuggestions);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not fetch projects for approval.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }
    fetchSubmittedProjects();
  }, [toast, firestore]);


  const handleCampaignApproval = async (projectId: string, action: 'live' | 'rejected') => {
    if (!firestore) return;
    
    // Optimistically update the UI
    const originalCampaigns = [...campaignsForApproval];
    setCampaignsForApproval(prev => prev.filter(p => p.id !== projectId));
    
    toast({
        title: `Campaign ${action === 'live' ? 'Approved' : 'Rejected'}`,
        description: `The campaign status has been updated to ${action}.`,
    });

    try {
      const projectDocRef = doc(firestore, 'projects', projectId);
      await updateDoc(projectDocRef, { 
        status: action,
        updatedAt: new Date().toISOString()
      });
      console.log(`Project ${projectId} status updated to ${action}`);
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast({ 
        title: 'Update Failed', 
        description: error.message || 'Could not update the project status in the database.', 
        variant: 'destructive' 
      });
      // Revert UI change if API call fails
      setCampaignsForApproval(originalCampaigns);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Queue</CardTitle>
        <CardDescription>
          Review and approve new campaigns and user KYC/AML submissions. AI suggestions are provided as a guide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="kyc">User KYC</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>AI Readiness Score</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            <Loader2 className="animate-spin mx-auto text-primary" />
                        </TableCell>
                    </TableRow>
                ) : campaignsForApproval.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link href={`/projects/${project.slug}`} className="font-medium hover:underline">
                        {project.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">{project.type} / {project.category}</div>
                    </TableCell>
                    <TableCell>{project.owner.name}</TableCell>
                    <TableCell>
                        {project.aiSuggestion ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 cursor-help">
                                            <div className="flex flex-col items-center">
                                                <Badge className={cn("w-12 justify-center", getScoreColorClass(project.aiSuggestion.competitivenessScore))}>{project.aiSuggestion.competitivenessScore.toFixed(1)}</Badge>
                                                <span className="text-xs text-muted-foreground mt-1">Comp.</span>
                                            </div>
                                             <div className="flex flex-col items-center">
                                                <Badge className={cn("w-12 justify-center", getScoreColorClass(project.aiSuggestion.successScore))}>{project.aiSuggestion.successScore.toFixed(1)}</Badge>
                                                <span className="text-xs text-muted-foreground mt-1">Success</span>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent align="start">
                                        <p className="max-w-xs font-semibold">AI Summary</p>
                                        <p className="max-w-xs text-muted-foreground">{project.aiSuggestion.summary}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <span className="text-muted-foreground text-xs">Generating...</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency }).format(project.targetAmount)}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleCampaignApproval(project.id, 'live')}>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                        </Button>
                         <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleCampaignApproval(project.id, 'rejected')}>
                            <X className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {!loading && campaignsForApproval.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            No campaigns awaiting approval.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="kyc">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>AI Suggestion</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {usersForKyc.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No users awaiting KYC verification.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
