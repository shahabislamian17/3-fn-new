
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
import Link from 'next/link';

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
};

const commissionRate = 0.05; // 5%

const commissionData: any[] = [];


export default function CommissionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Revenue</CardTitle>
        <CardDescription>
          An overview of commissions earned from successfully funded campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Total Raised</TableHead>
              <TableHead className="text-right">Commission ({(commissionRate * 100).toFixed(0)}%)</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissionData.length > 0 ? commissionData.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell>
                  <Link href={`/projects/${commission.slug}`} className="font-medium hover:underline">
                    {commission.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(commission.totalRaised, commission.currency)}
                </TableCell>
                 <TableCell className="text-right text-green-600">
                  {formatCurrency(commission.commissionEarned, commission.currency)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge>{commission.status}</Badge>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No commission data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
