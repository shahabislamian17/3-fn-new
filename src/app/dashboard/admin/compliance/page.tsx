
'use client';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';


const complianceRuns = [
    {
        id: 'run-uuid-123',
        projectTitle: 'C-RECYCLE - Plastic Pellet Plant',
        projectSlug: 'eco-drone-innovations', // Using existing slug for link
        initiatedBy: 'system',
        initiatedAt: new Date(),
        status: 'escalated',
        aiRiskScore: 52.5,
        aiRecommendation: 'manual_review',
    },
    {
        id: 'run-uuid-456',
        projectTitle: 'Fintech Connect App',
        projectSlug: 'fintech-connect-app',
        initiatedBy: 'system',
        initiatedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        status: 'completed',
        aiRiskScore: 25.0,
        aiRecommendation: 'auto_release',
    },
     {
        id: 'run-uuid-789',
        projectTitle: 'Artisan Roast Collective',
        projectSlug: 'artisan-roast-collective',
        initiatedBy: 'admin-user-1',
        initiatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        status: 'blocked',
        aiRiskScore: 78.0,
        aiRecommendation: 'block',
    }
];

export default function ComplianceRunsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>Compliance Runs</CardTitle>
            <CardDescription>
            Review automated compliance checks for funded projects.
            </CardDescription>
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Run ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>AI Recommendation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <Link href={`/projects/${run.projectSlug}`} className="font-medium hover:underline">
                    {run.projectTitle}
                  </Link>
                   <div className="text-xs text-muted-foreground">{format(run.initiatedAt, 'PPP p')} by {run.initiatedBy}</div>
                </TableCell>
                <TableCell className="font-mono text-xs">{run.id}</TableCell>
                <TableCell>
                   <Badge variant={run.status === 'completed' ? 'default' : run.status === 'blocked' ? 'destructive' : 'secondary'}>
                        {run.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={run.aiRiskScore > 70 ? 'destructive' : run.aiRiskScore > 40 ? 'secondary' : 'default'} className="font-mono">
                        {run.aiRiskScore.toFixed(1)}
                    </Badge>
                </TableCell>
                 <TableCell>
                    <Badge variant="outline" className="capitalize">{run.aiRecommendation.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/admin/compliance/${run.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Run
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
