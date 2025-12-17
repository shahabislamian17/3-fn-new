import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

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
    const { topic, message, audience, ctaUrl, ctaLabel, filters } = body;

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Generate HTML (same as preview)
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

    // Create newsletter document
    const newsletterData = {
      createdAt: new Date().toISOString(),
      createdByUid: user.id,
      createdByEmail: user.email || null,
      audience: audience || 'all_users',
      filters: filters || {},
      topic,
      subject,
      message,
      html,
      ctaUrl: ctaUrl || null,
      ctaLabel: ctaLabel || null,
      language: 'en',
      status: 'queued',
    };

    const ref = await adminDb.collection('newsletters').add(newsletterData);

    return NextResponse.json({
      id: ref.id,
      subject,
      preview,
      status: 'queued',
    });
  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}

