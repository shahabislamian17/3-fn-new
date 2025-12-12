
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
import { Landmark, DollarSign, FileText, Check, X } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
};

const payoutRequests = [
    {
        id: 'payout1',
        campaignTitle: 'EcoDrone Innovations',
        campaignSlug: 'eco-drone-innovations',
        amount: 280000,
        status: 'Pending',
    },
];

export default function AccountingOperatorDashboard() {
  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle>Accounting Dashboard</CardTitle>
        <CardDescription>Reconcile payouts, track commissions, and manage financial reports.</CardDescription>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payoutRequests.reduce((sum, p) => sum + p.amount, 0))}</div>
            <p className="text-xs text-muted-foreground">{payoutRequests.length} requests to process</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(45231.89)}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Payout Reconciliation Queue</CardTitle>
          <CardDescription>Review and approve fund disbursements for completed campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payoutRequests.map((request) => (
                <TableRow key={request.id}>
                    <TableCell>
                    <Link href={`/projects/${request.campaignSlug}`} className="font-medium hover:underline">
                        {request.campaignTitle}
                    </Link>
                    </TableCell>
                    <TableCell className="text-right">
                    {formatCurrency(request.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                    <Badge variant={request.status === 'Pending' ? 'secondary' : 'default'}>
                            {request.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                        {request.status === 'Pending' && (
                            <>
                                <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                                    <Check className="h-4 w-4 mr-1" />
                                    Reconcile
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                                    <X className="h-4 w-4 mr-1" />
                                    Flag
                                </Button>
                            </>
                        )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Reports & Ledgers</CardTitle>
          <CardDescription>Download financial statements and transaction logs.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Export Payout Ledger</Button>
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Export Commission Report</Button>
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Generate Tax Documents</Button>
        </CardContent>
      </Card>

    </div>
  );
}
