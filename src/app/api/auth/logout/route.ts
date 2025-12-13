
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });

  // Use same Vercel detection as login route
  const host = req.headers.get('host') || '';
  const isVercel = !!(process.env.VERCEL === "1" || 
                   process.env.VERCEL_URL || 
                   process.env.NEXT_PUBLIC_VERCEL_URL ||
                   host.includes('vercel.app') ||
                   host.includes('vercel.com'));
  
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const isHttps = protocol === 'https';
  const shouldSecure = isVercel || isHttps;

  res.cookies.set("firebase_id_token", "", {
    httpOnly: true,
    secure: shouldSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
