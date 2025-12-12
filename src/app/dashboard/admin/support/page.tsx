
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tickets: any[] = [];

const disputes: any[] = [];

export default function SupportPage() {
  const { toast } = useToast();

  const handleViewTicket = (ticketId: string) => {
    toast({
      title: 'Viewing Ticket',
      description: `Opening ticket ${ticketId}... (Feature in development)`,
    });
  };

  const handleReviewDispute = (disputeId: string) => {
     toast({
      title: 'Reviewing Dispute',
      description: `Opening dispute ${disputeId} for review... (Feature in development)`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support & Disputes</CardTitle>
        <CardDescription>
          Manage user support tickets and resolve investment disputes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>
          <TabsContent value="tickets">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono">{ticket.id}</TableCell>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>{ticket.user}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.status === 'Open' ? 'destructive' : ticket.status === 'In Progress' ? 'secondary' : 'default'}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No tickets found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="disputes">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Dispute ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {disputes.length > 0 ? disputes.map((dispute) => (
                        <TableRow key={dispute.id}>
                            <TableCell className="font-mono">{dispute.id}</TableCell>
                            <TableCell>{dispute.type}</TableCell>
                            <TableCell>{dispute.project}</TableCell>
                            <TableCell>{dispute.amount}</TableCell>
                            <TableCell>
                               <Badge variant="destructive">{dispute.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleReviewDispute(dispute.id)}>
                                    Review
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No disputes found.
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
