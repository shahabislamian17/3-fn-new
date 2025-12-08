
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

const projectId = process.env.GCP_PROJECT_ID;

if (!projectId) {
    throw new Error("GCP_PROJECT_ID environment variable not set.");
}

const secretCache = new Map<string, string>();

/**
 * Accesses a secret from Google Cloud Secret Manager.
 * @param secretName The name of the secret to access.
 * @returns The secret value as a string.
 */
export async function getSecret(secretName: string): Promise<string> {
    if (secretCache.has(secretName)) {
        return secretCache.get(secretName)!;
    }

    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    try {
        const [version] = await client.accessSecretVersion({
            name: name,
        });

        const payload = version.payload?.data?.toString();
        if (!payload) {
            throw new Error(`Secret ${secretName} has no payload.`);
        }
        secretCache.set(secretName, payload);
        return payload;
    } catch (error) {
        console.error(`Failed to access secret ${secretName}`, error);
        throw new Error(`Could not access secret: ${secretName}`);
    }
}
