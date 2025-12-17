import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { topic, message, ctaUrl, ctaLabel } = body;

    // Generate a simple HTML preview
    const subject = topic || 'Newsletter';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>${subject}</h1>
          <div style="white-space: pre-wrap;">${message}</div>
          ${ctaUrl && ctaLabel ? `<a href="${ctaUrl}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">${ctaLabel}</a>` : ''}
        </body>
      </html>
    `;

    const preview = message.substring(0, 200) + (message.length > 200 ? '...' : '');

    return NextResponse.json({ subject, preview, html });
  } catch (error: any) {
    console.error('Newsletter preview error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

