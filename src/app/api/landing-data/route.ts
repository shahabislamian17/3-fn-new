
import { NextResponse } from 'next/server';

// In a real app, this data would come from a database or a service layer.
const SAMPLE_STATS = {
    countries: 15,
    investedUSD: "2.4M",
    projectsFunded: 267,
    co2Saved: "1,250 t",
};

const TESTIMONIALS = [
    {
      name: "Amina Yusuf",
      role: "Project Owner, Kenya",
      quote: "3JN Fund didn't just provide capital; their AI tools helped us refine our financial model and pitch, which was invaluable. We secured funding in just 45 days!",
      imageId: "user-avatar-1"
    },
    {
      name: "David Chen",
      role: "Investor, Singapore",
      quote: "As an investor, the platform's transparency and AI-driven risk scores give me the confidence to back projects I believe in. The portfolio management tools are top-notch.",
      imageId: "user-avatar-2"
    },
];

export async function GET() {
  try {
    return NextResponse.json({
      stats: SAMPLE_STATS,
      testimonials: TESTIMONIALS,
    });
  } catch (error) {
    console.error('Failed to fetch landing page data', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
