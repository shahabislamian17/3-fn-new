// frontend/src/components/invest-button.tsx
"use client";

import { useKycGate } from "@/hooks/useKycGate";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';

export function InvestButton({ onInvest }: { onInvest: () => void }) {
  const { loading } = useAuth();
  const { allowed, reason, requiresKyc } = useKycGate("invest");

  if (loading) {
    return (
        <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
        </Button>
    )
  }

  if (!allowed) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full">
          Invest Now
        </Button>
        <p className="text-xs text-muted-foreground text-center">{reason}</p>
        {requiresKyc && (
          <Link href="/dashboard/account?tab=verification" className="text-xs underline text-center block hover:text-primary">
            Complete my KYC to invest
          </Link>
        )}
      </div>
    );
  }

  return (
    <Button onClick={onInvest} className="w-full" size="lg">
      Invest Now
    </Button>
  );
}
