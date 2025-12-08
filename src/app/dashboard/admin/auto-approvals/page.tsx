// src/app/dashboard/admin/auto-approvals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAutoApprovalStats, getAutoApprovalHistory } from "@/lib/api-frontend-services";

interface AutoDecision {
  id: string;
  type: string;
  userId: string;
  entityId: string;
  decision: "approve" | "reject" | "escalate";
  reason: string;
  requiresManualReview: boolean;
  createdAt?: { _seconds: number };
}

export default function AutoApprovalsPage() {
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<AutoDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, h] = await Promise.all([
        getAutoApprovalStats(),
        getAutoApprovalHistory(),
      ]);
      setStats(s);
      setItems(h);
    } catch (err: any) {
      setError(err.message ?? "Failed to load auto-approval data");
       toast({
          variant: "destructive",
          title: "Failed to load data",
          description: err.message,
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderDecisionBadge = (d: AutoDecision["decision"]) => {
    if (d === "approve") return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    if (d === "reject") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Escalated</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Auto-Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Overview of automatic decisions made by the AI SuperAdmin engine in the last 7 days.
        </p>
      </div>

      {error && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Auto-approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {stats?.approved ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Auto-rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {stats?.rejected ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Escalated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {stats?.escalated ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {stats?.total ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History list */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI decisions</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No auto-approval decisions logged yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between border-b last:border-0 pb-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          {renderDecisionBadge(d.decision)}
                          <span className="text-xs rounded bg-secondary px-2 py-0.5 text-secondary-foreground capitalize">
                            {d.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          User: {d.userId} · Entity: {d.entityId}
                        </p>
                        <p className="text-xs">
                          Reason: <span className="text-foreground">{d.reason}</span>
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0 text-xs text-right text-muted-foreground">
                        {d.createdAt?._seconds
                          ? new Date(d.createdAt._seconds * 1000).toLocaleString()
                          : ""}
                        <br />
                        {d.requiresManualReview && (
                          <span className="inline-block mt-1 rounded bg-yellow-100 text-yellow-800 px-2 py-0.5">
                            Requires manual review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}