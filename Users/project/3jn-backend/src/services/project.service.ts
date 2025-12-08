import { adminDb } from '@/core/firebase';
import type { Project } from '@/core/types';
import slugify from 'slugify';

/**
 * Creates a new project document in Firestore.
 * @param data - The project data to save.
 * @returns The created project data including its new ID.
 */
export async function createProject(
  data: Partial<Project>
): Promise<Project> {
  const slug = slugify(data.title || 'new-project', { lower: true, strict: true });

  const projectData = {
    ...data,
    slug,
    status: data.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await adminDb.collection('projects').add(projectData);
  
  // Update the document with its own ID for easier reference
  await docRef.update({ id: docRef.id });

  return { id: docRef.id, ...projectData } as Project;
}

/**
 * Updates a project document in Firestore.
 * @param projectId - The ID of the project to update.
 * @param data - The data to update.
 */
export async function updateProject(
  projectId: string,
  data: Partial<Project>
): Promise<void> {
  const projectDocRef = adminDb.collection('projects').doc(projectId);
  await projectDocRef.update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
