// frontend/src/components/invest-button.tsx
"use client";

import { useKycGate } from "@/hooks/useKycGate";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function InvestButton({ onInvest }: { onInvest: () => void }) {
  const { allowed, reason, requiresKyc } = useKycGate("invest");

  if (!allowed) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full">
          Invest Now
        </Button>
        <p className="text-xs text-muted-foreground text-center">{reason}</p>
        {requiresKyc && (
          <Link href="/dashboard/account?tab=verification" className="text-xs underline text-center block">
            Complete my KYC to invest
          </Link>
        )}
      </div>
    );
  }

  return (
    <Button onClick={onInvest} className="w-full">
      Invest Now
    </Button>
  );
}
