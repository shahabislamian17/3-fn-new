
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type CampaignRow = {
  id: string;
  title: string;
  owner_email: string;
  owner_stripe_account_id?: string;
  stripe_onboard_status?: string;
  total_cents: number;
  currency: string;
  payments_count: number;
};

export default function PayoutsAdminPage() {
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchPending() {
    setLoading(true);
    try {
      // In a real app, this would hit a protected API endpoint.
      // For this demo, we are mocking the data.
      setRows([]);
    } catch (err) {
      toast({ title: 'Failed to load pending campaigns', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchPending();
  }, []);

  async function doAction(id: string, action: 'release' | 'refund') {
    if (!confirm(`Are you sure you want to ${action} campaign ${id}? This is a stubbed action.`)) return;
    setActionLoading(id + ':' + action);
    try {
      // Stub the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
          title: `${action.charAt(0).toUpperCase() + action.slice(1)} Succeeded`,
          description: `Action '${action}' for campaign ${id} was successful.`
      });
      fetchPending();
    } catch (err: any) {
      toast({ title: `Action failed: ${err.message || err}`, variant: 'destructive'});
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
       <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Pending Payouts</CardTitle>
                    <CardDescription>
                        Review and process payouts for successfully funded campaigns with completed owner onboarding.
                    </CardDescription>
                </div>
                 <Button
                    onClick={fetchPending}
                    disabled={loading}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Campaign</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Onboarding</TableHead>
                            <TableHead className="text-right">Total Raised</TableHead>
                            <TableHead className="text-center">Payments</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.title}</TableCell>
                            <TableCell>{r.owner_email}</TableCell>
                            <TableCell>
                                <Badge variant={r.stripe_onboard_status === 'completed' ? 'default' : 'secondary'}>
                                {r.stripe_onboard_status || 'pending'}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1 font-mono">{r.owner_stripe_account_id || '—'}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono">{(r.total_cents / 100).toFixed(2)} {r.currency?.toUpperCase() || 'USD'}</TableCell>
                            <TableCell className="text-center">{r.payments_count}</TableCell>
                            <TableCell className="text-center space-x-2">
                                <Button
                                size="sm"
                                variant="outline"
                                onClick={() => doAction(r.id, 'release')}
                                disabled={actionLoading !== null || r.stripe_onboard_status !== 'completed'}
                                >
                                {actionLoading === r.id + ':release' ? <Loader2 className="animate-spin" /> : 'Release'}
                                </Button>
                                <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => doAction(r.id, 'refund')}
                                disabled={actionLoading !== null}
                                >
                                {actionLoading === r.id + ':refund' ? <Loader2 className="animate-spin" /> : 'Refund'}
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        {!rows.length && !loading && (
                            <TableRow>
                            <TableCell colSpan={6} className="p-6 text-center text-gray-500">No pending payouts found.</TableCell>
                            </TableRow>
                        )}
                         {loading && (
                             <TableRow>
                                <TableCell colSpan={6} className="p-6 text-center text-gray-500">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                         )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
