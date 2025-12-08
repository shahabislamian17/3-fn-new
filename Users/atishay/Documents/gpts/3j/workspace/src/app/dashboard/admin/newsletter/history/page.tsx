
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getNewsletterHistory } from "@/lib/api-frontend-services";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterHistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getNewsletterHistory()
      .then(setRecords)
      .catch(err => {
        toast({
          title: "Error fetching history",
          description: err.message,
          variant: "destructive"
        })
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/newsletter"><ArrowLeft/></Link>
            </Button>
            <h1 className="text-2xl font-semibold">Newsletter History</h1>
        </div>

      <div className="grid gap-4">
        {records.length > 0 ? records.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                 <div>
                    <CardTitle>{entry.subject}</CardTitle>
                    <CardDescription>
                        Sent: {entry.sentAt ? format(new Date(entry.sentAt._seconds * 1000), 'PPP p') : "—"} | Topic: {entry.topic}
                    </CardDescription>
                 </div>
                  <Badge variant={entry.status === 'sent' ? 'default' : 'secondary'} className="capitalize">{entry.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Audience:</strong> <span className="capitalize">{entry.audience.replace('_', ' ')}</span></p>
              <p><strong>Recipients:</strong> {entry.recipientCount ?? "N/A"}</p>
              <details>
                <summary className="cursor-pointer text-xs text-primary hover:underline">
                  View HTML Preview
                </summary>
                <div
                  className="border rounded mt-2 p-2 bg-white max-h-64 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: entry.html }}
                />
              </details>
            </CardContent>
          </Card>
        )) : (
            <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                    No newsletter history found.
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
