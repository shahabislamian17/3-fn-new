
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
import { ShieldCheck, UserCheck, FileWarning, AlertTriangle, User, Eye, Check, X } from 'lucide-react';
import Link from 'next/link';

const kycQueue: any[] = [];

const amlAlerts: any[] = [];

export default function ComplianceOfficerDashboard() {
  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle>Compliance Dashboard</CardTitle>
        <CardDescription>Monitor KYC/AML queues, review flagged activities, and ensure regulatory adherence.</CardDescription>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC Verifications</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycQueue.length}</div>
            <p className="text-xs text-muted-foreground">New submissions requiring review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active AML Alerts</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{amlAlerts.length}</div>
            <p className="text-xs text-muted-foreground">High-priority flags for review</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>KYC Verification Queue</CardTitle>
          <CardDescription>Review and process pending user identity verifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>AI Risk Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycQueue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={item.riskLevel === 'High' ? 'destructive' : item.riskLevel === 'Medium' ? 'secondary' : 'default'}>
                      {item.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.submitted}</TableCell>
                   <TableCell className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review Documents
                        </Button>
                    </TableCell>
                </TableRow>
              ))}
              {kycQueue.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No pending KYC verifications.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>AML Transaction Monitoring</CardTitle>
          <CardDescription>Investigate potentially suspicious transactions flagged by the system.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Alert Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {amlAlerts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.user}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                       <Badge variant={item.level === 'High' ? 'destructive' : 'secondary'}>{item.level}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm">
                         Investigate
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {amlAlerts.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No active AML alerts.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
