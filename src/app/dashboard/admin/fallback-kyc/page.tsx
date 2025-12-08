// frontend/src/app/dashboard/admin/fallback-kyc/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getPendingFallbackKyc, decideFallbackKyc } from "@/lib/api-admin-fallback-kyc";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminFallbackKycPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionReason, setDecisionReason] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingFallbackKyc();
      setItems(res);
    } catch (err: any) {
      setError(err.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    setError(null);
    try {
      await decideFallbackKyc(id, decision, decisionReason[id] || undefined);
      toast({
        title: "Decision Recorded",
        description: `Request ${id} has been ${decision}.`
      });
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to decide");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Fallback KYC Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Review documents for users in unsupported countries or cases requiring enhanced due diligence.
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
      ) : items.length === 0 ? (
        <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
                No pending fallback KYC requests.
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>
                  User: {item.userId} ({item.role}) — {item.country}
                </CardTitle>
                <CardDescription>
                    Request ID: {item.id} | Reason: {item.reason}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-medium mb-1">Bank Document</p>
                        {item.bankDocumentUrl ? (
                            <a
                            href={item.bankDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-sm underline"
                            >
                            View Bank Document
                            </a>
                        ) : (
                            <p className="text-xs text-muted-foreground">Not provided</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-medium mb-1">Proof of Address</p>
                        {item.proofOfAddressUrl ? (
                            <a
                            href={item.proofOfAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-sm underline"
                            >
                            View Proof of Address
                            </a>
                        ) : (
                            <p className="text-xs text-muted-foreground">Not provided</p>
                        )}
                    </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-1">Review Note (internal)</p>
                  <Textarea
                    rows={2}
                    value={decisionReason[item.id] ?? ""}
                    onChange={(e) =>
                      setDecisionReason((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="Reason for approval or rejection..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDecision(item.id, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDecision(item.id, "approved")}
                  >
                    Approve & Unblock Payouts
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}