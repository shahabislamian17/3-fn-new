
import {
  collection,
  doc,
  addDoc,
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
 * Recursively removes undefined values from an object (including nested objects)
 */
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item)).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeUndefinedValues(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
}

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

  // Remove undefined values recursively to prevent Firestore errors
  const cleanedData = removeUndefinedValues(data) as Partial<Project>;

  const projectData = {
    ...cleanedData,
    slug,
    status: cleanedData?.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Final cleanup to ensure no undefined values
  const finalData = removeUndefinedValues(projectData);

  // Validate that no undefined values remain
  const validateData = (obj: any, path = ''): void => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (value === undefined) {
        throw new Error(`Found undefined value at path: ${currentPath}`);
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object) {
        validateData(value, currentPath);
      }
    }
  };

  try {
    validateData(finalData);
  } catch (error) {
    console.error('Data validation failed:', error);
    console.error('Final data:', JSON.stringify(finalData, null, 2));
    throw error;
  }

  const docRef = await addDoc(projectsCollectionRef, finalData);
  
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
