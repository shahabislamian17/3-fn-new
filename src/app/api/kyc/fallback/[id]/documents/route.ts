import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { bankDocumentUrl, proofOfAddressUrl } = body;

    const kycId = params.id;
    const kycRef = adminDb.collection('fallbackKyc').doc(kycId);
    const kycDoc = await kycRef.get();

    if (!kycDoc.exists) {
      return NextResponse.json({ error: 'Fallback KYC request not found' }, { status: 404 });
    }

    const kycData = kycDoc.data();
    
    // Verify the KYC request belongs to the user
    if (kycData?.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the documents
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (bankDocumentUrl) {
      updateData.bankDocumentUrl = bankDocumentUrl;
    }

    if (proofOfAddressUrl) {
      updateData.proofOfAddressUrl = proofOfAddressUrl;
    }

    await kycRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload fallback KYC documents error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

