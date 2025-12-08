import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { adminAuth } from '@/lib/firebase-admin';

async function fetchCampaignsForOwner(firestore: Firestore, ownerId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(firestore, 'projects');
    
    console.log(`🔍 Searching for projects with owner ID: ${ownerId}`);
    
    // Try querying by owner.id first (nested field)
    let q = query(projectsRef, where('owner.id', '==', ownerId));
    let querySnapshot = await getDocs(q);
    console.log(`Query 1 (owner.id): Found ${querySnapshot.size} projects`);
    
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const projectData = { id: doc.id, ...data } as Project;
      projects.push(projectData);
      console.log(`✅ Found project: "${projectData.title}", status: ${projectData.status}, owner.id: ${projectData.owner?.id}`);
    });
    
    // If no results, try alternative field names
    if (querySnapshot.empty) {
      console.log(`⚠️ No projects found with owner.id == ${ownerId}, trying alternative queries...`);
      
      // Try ownerId (flat field)
      q = query(projectsRef, where('ownerId', '==', ownerId));
      querySnapshot = await getDocs(q);
      console.log(`Query 2 (ownerId): Found ${querySnapshot.size} projects`);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const projectData = { id: doc.id, ...data } as Project;
        if (!projects.find(p => p.id === projectData.id)) {
          projects.push(projectData);
          console.log(`✅ Found project (ownerId): "${projectData.title}", status: ${projectData.status}`);
        }
      });
    }
    
    // If still no results, fetch all and filter client-side (for debugging)
    if (projects.length === 0) {
      console.log(`⚠️ Still no projects found. Fetching ALL projects to debug...`);
      const allProjectsSnapshot = await getDocs(projectsRef);
      const allProjects: any[] = [];
      allProjectsSnapshot.forEach((doc) => {
        const data = doc.data();
        const ownerIdFromOwner = data.owner?.id;
        const ownerIdFlat = data.ownerId;
        const matches = ownerIdFromOwner === ownerId || ownerIdFlat === ownerId;
        
        allProjects.push({
          id: doc.id,
          title: data.title || 'Untitled',
          status: data.status || 'unknown',
          ownerId: ownerIdFlat,
          owner: data.owner,
          ownerIdFromOwner: ownerIdFromOwner,
          matches: matches
        });
        
        // If it matches, add it to projects
        if (matches) {
          const projectData = { id: doc.id, ...data } as Project;
          projects.push(projectData);
          console.log(`✅ Found matching project: "${data.title}", status: ${data.status}`);
        }
      });
      
      console.log(`📊 Total projects in database: ${allProjects.length}`);
      console.log(`📊 Projects matching owner ID ${ownerId}:`, allProjects.filter(p => p.matches));
      console.log(`📊 All projects (first 10):`, allProjects.slice(0, 10).map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        ownerIdFromOwner: p.ownerIdFromOwner,
        ownerIdFlat: p.ownerId,
        matches: p.matches
      })));
    }
    
    console.log(`✅ Total projects found for owner ${ownerId}: ${projects.length}`);
    return projects;
  } catch (e) {
    console.error("❌ Error fetching projects from Firestore: ", e);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1] || '';
    if (!idToken) {
      console.error('❌ No authorization token provided');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Check if adminAuth is initialized
    if (!adminAuth) {
      console.error('❌ Firebase Admin SDK not initialized');
      return NextResponse.json({ 
        error: 'Server configuration error - Admin SDK not initialized. Please check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.' 
      }, { status: 500 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (authError: any) {
      console.error('❌ Token verification failed:', authError.message);
      return NextResponse.json({ 
        error: `Authentication failed: ${authError.message}` 
      }, { status: 401 });
    }

    const ownerId = decodedToken.uid;
    
    console.log(`\n🔍 ===== FETCHING CAMPAIGNS =====`);
    console.log(`User UID from token: ${ownerId}`);
    console.log(`User email: ${decodedToken.email}`);
    
    const { firebaseApp } = initializeFirebase();
    const firestore = (await import('firebase/firestore')).getFirestore(firebaseApp);

    const campaigns = await fetchCampaignsForOwner(firestore, ownerId);
    console.log(`✅ Returning ${campaigns.length} campaigns for owner ${ownerId}`);
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('❌ Failed to fetch campaigns:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
