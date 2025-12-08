
'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { gtm } from '@/lib/gtm';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export default function Success() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // This is a simplified example. In a real app, you'd fetch session details from your backend
    // to get the accurate amount and currency for security reasons.
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');

    if (amount && currency) {
        const value = parseFloat(amount);
        // GTM Event
        gtm.push({
            event: 'investment_completed',
            value: value,
            currency: currency,
        });

        // Facebook Pixel Event
        if (window.fbq) {
            window.fbq('track', 'Purchase', {
                value: value,
                currency: currency,
            });
        }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 dark:bg-gray-900 text-center p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-2">✅ Payment Successful!</h1>
      <p className="text-gray-700 dark:text-gray-300">Thank you for your investment. A confirmation has been sent to your email.</p>
      <Link href="/dashboard" className="mt-6 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
        Go to Dashboard
      </Link>
    </div>
  );
}
