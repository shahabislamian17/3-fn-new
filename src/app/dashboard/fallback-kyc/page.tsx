// frontend/src/app/dashboard/fallback-kyc/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getFallbackKycStatus, startFallbackKyc, uploadFallbackKycDocs } from "@/lib/api-fallback-kyc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function FallbackKycPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docUrls, setDocUrls] = useState({ bank: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFallbackKycStatus();
      setStatus(res);
    } catch (err: any) {
      setError(err.message ?? "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStart = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await startFallbackKyc();
      setStatus(res);
      setSuccess("Fallback verification started. You can now upload your documents.");
    } catch (err: any) {
      setError(err.message ?? "Failed to start");
    } finally {
        setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!status?.id) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await uploadFallbackKycDocs(status.id, {
        bankDocumentUrl: docUrls.bank || undefined,
        proofOfAddressUrl: docUrls.address || undefined,
      });
      await load();
      setSuccess("Documents submitted for review.");
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/account?tab=payouts"><ArrowLeft/></Link>
        </Button>
        <div>
            <h1 className="text-2xl font-semibold">Additional Verification for Payouts</h1>
            <p className="text-sm text-muted-foreground">
                For regions without automated bank verification, we require these documents to enable payouts.
            </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
             <AlertTitle>Success</AlertTitle>
             <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fallback Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-lg">
              Current Status:{" "}
              <span className="capitalize font-mono p-1 rounded bg-secondary text-secondary-foreground">{status?.status ?? "not_started"}</span>
            </p>

            {!status || status.status === "none" ? (
              <div>
                <p className="text-sm mb-4 text-muted-foreground">You have not started the fallback verification process.</p>
                <Button onClick={handleStart} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Start Fallback Verification
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                    Please provide links to the following documents. You can upload them to a secure cloud service (like Google Drive or Dropbox) and paste the shareable links below.
                    <br />• Bank statement or RIB showing account holder name and number.
                    <br />• Recent proof of address (utility bill, bank statement, etc.).
                </p>
                
                 <div>
                  <Label htmlFor="bankDoc">Bank Document URL</Label>
                  <Input
                    id="bankDoc"
                    placeholder="https://storage.googleapis.com/..."
                    value={docUrls.bank}
                    onChange={(e) =>
                      setDocUrls((prev) => ({ ...prev, bank: e.target.value }))
                    }
                  />
                </div>
                <div>
                   <Label htmlFor="addressDoc">Proof of Address URL</Label>
                  <Input
                    id="addressDoc"
                    placeholder="https://storage.googleapis.com/..."
                    value={docUrls.address}
                    onChange={(e) =>
                      setDocUrls((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>
                <Button onClick={handleUpload} disabled={saving}>
                  {saving ? "Submitting..." : "Submit Documents for Review"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Our compliance team will review your documents within 2-3 business days. Once approved, payouts will be enabled on your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
