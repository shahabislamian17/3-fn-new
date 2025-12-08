
import { MetadataRoute } from 'next';
import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { initializeFirebase } from '@/firebase';

async function fetchLiveProjects(firestore: Firestore): Promise<Project[]> {
  try {
    const projectsRef = collection(firestore, 'projects');
    const q = query(projectsRef, where('status', '==', 'live'));
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    return projects;
  } catch (e) {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://3jncrowdfunding.com';

  const { firebaseApp } = initializeFirebase();
  const firestore = (await import('firebase/firestore')).getFirestore(firebaseApp);
  
  const projects = await fetchLiveProjects(firestore);

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
     {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  return [...staticPages, ...projectUrls];
}
