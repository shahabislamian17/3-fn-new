
'use client';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 dark:bg-gray-900 text-center p-6">
      <h1 className="text-3xl font-bold text-red-700 mb-2">Payment Canceled</h1>
      <p className="text-gray-700 dark:text-gray-300">Your payment process was canceled. You have not been charged.</p>
      <Link href="/projects" className="mt-6 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
        Return to Projects
      </Link>
    </div>
  );
}
