import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminApp } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'idDocument', 'selfie', 'proofOfAddress'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!fileType) {
      return NextResponse.json({ error: 'File type is required' }, { status: 400 });
    }

    const adminApp = getAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // Get Firebase Storage
    const { getStorage } = require('firebase-admin/storage');
    const bucket = getStorage(adminApp).bucket();

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `kyc/${user.id}/${fileType}_${timestamp}_${sanitizedFileName}`;

    // Upload to Firebase Storage
    const fileRef = bucket.file(filePath);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          fileType: fileType,
        },
      },
    });

    // Make the file publicly accessible (or use signed URLs for private files)
    await fileRef.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath: filePath,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

