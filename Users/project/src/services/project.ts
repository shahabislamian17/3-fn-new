
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  limit,
  type Firestore,
} from 'firebase/firestore';
import type { Project } from '@/lib/types';
import slugify from 'slugify';

/**
 * Creates a new project document in Firestore.
 * @param firestore - The Firestore instance.
 * @param data - The project data to save.
 * @returns The ID of the newly created project.
 */
export async function createProject(
  firestore: Firestore,
  data: Partial<Project>
): Promise<string> {
  const projectsCollectionRef = collection(firestore, 'projects');
  
  const slug = slugify(data.title || 'new-project', { lower: true, strict: true });

  const projectData = {
    ...data,
    slug,
    status: data.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(projectsCollectionRef, projectData);
  
  // Update the document with its own ID for easier reference
  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
}

/**
 * Updates a project document in Firestore.
 * @param firestore - The Firestore instance.
 * @param projectId - The ID of the project to update.
 * @param data - The data to update.
 */
export async function updateProject(
  firestore: Firestore,
  projectId: string,
  data: Partial<Project>
): Promise<void> {
  const projectDocRef = doc(firestore, 'projects', projectId);
  await updateDoc(projectDocRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Fetches a single project document from Firestore by its slug.
 * @param firestore - The Firestore instance.
 * @param slug - The slug of the project to fetch.
 * @returns The project data or null if not found.
 */
export async function getProjectBySlug(
  firestore: Firestore,
  slug: string
): Promise<Project | null> {
  const projectsCollectionRef = collection(firestore, 'projects');
  const q = query(projectsCollectionRef, where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const projectDoc = querySnapshot.docs[0];
  return { id: projectDoc.id, ...projectDoc.data() } as Project;
}
