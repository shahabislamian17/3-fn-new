import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received verification data for user:', user.id, 'Data keys:', Object.keys(body));
    
    const adminDb = getAdminDb();
    
    if (!adminDb) {
      console.error('Admin DB not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Clean up blob URLs - files should already be uploaded to Firebase Storage
    // If blob URLs are still present, they weren't uploaded successfully
    const cleanedData = { ...body };
    
    // Remove blob URLs if they exist (they won't work on server)
    // Files should have been uploaded via /api/user/upload-file before submission
    if (cleanedData.idDocumentUrl?.startsWith('blob:')) {
      console.warn('ID document still has blob URL - file may not have been uploaded');
      cleanedData.idDocumentUrl = null;
    }
    if (cleanedData.selfieUrl?.startsWith('blob:')) {
      console.warn('Selfie still has blob URL - file may not have been uploaded');
      cleanedData.selfieUrl = null;
    }
    if (cleanedData.proofOfAddressUrl?.startsWith('blob:')) {
      console.warn('Proof of address still has blob URL - file may not have been uploaded');
      cleanedData.proofOfAddressUrl = null;
    }

    // Save verification data to user's document
    const verificationData = {
      ...cleanedData,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
    };

    const userRef = adminDb.collection('users').doc(user.id);
    
    // First, get the current user document to preserve existing data
    const userDoc = await userRef.get();
    const currentUserData = userDoc.exists ? userDoc.data() : {};

    // Update user document with verification data (merge to preserve other fields)
    await userRef.set({
      ...currentUserData,
      verification: verificationData,
      kycStatus: 'pending',
      kycSubmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('User document updated successfully');

    // Also create a separate verification submission document for admin review
    const submissionRef = await adminDb.collection('verificationSubmissions').add({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      ...verificationData,
      createdAt: new Date().toISOString(),
    });

    console.log('Verification submission created with ID:', submissionRef.id);

    // Verify the data was saved by reading it back
    const verifyDoc = await userRef.get();
    const savedData = verifyDoc.data();
    
    if (!savedData?.verification) {
      console.error('Verification data not found after save');
      return NextResponse.json(
        { error: 'Data was not saved correctly' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification information submitted successfully',
      submissionId: submissionRef.id,
    });
  } catch (error: any) {
    console.error('Verification submission error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification' },
      { status: 500 }
    );
  }
}

