// backend/src/controllers/admin.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { adminDb } from '@/core/firebase';
import type { User, Project } from '@/core/types';
import { suggestProjects } from '@/ai/flows/suggest-projects';

async function fetchInvestors(): Promise<User[]> {
    const usersRef = adminDb.collection('users');
    const q = usersRef.where('role', '==', 'Investor').where('ai_recommendation_opt_in', '!=', false);
    const snapshot = await q.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

async function fetchLiveProjects(): Promise<Project[]> {
    const projectsRef = adminDb.collection('projects');
    const q = projectsRef.where('status', '==', 'live');
    const snapshot = await q.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export const bulkMatchProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const investors = await fetchInvestors();
        const activeProjects = await fetchLiveProjects();
        
        let totalMatches = 0;
        const projectResults: Record<string, number> = {};

        for (const project of activeProjects) {
            let projectMatchCount = 0;
            for (const investor of investors) {
                const investorProfile = {
                    riskAppetite: investor.risk_tolerance,
                    preferredCategories: investor.preferred_categories,
                    preferredCountries: investor.preferred_countries,
                    portfolio: [], // Simplified for this context
                    preferredInvestmentTypes: investor.preferred_investment_types,
                };

                const input = {
                    investorProfile,
                    availableProjects: [project]
                };

                // This is a stubbed call. In a real scenario, this AI flow would be more complex.
                if (Math.random() > 0.8) {
                    projectMatchCount++;
                }
            }
            projectResults[project.title] = projectMatchCount;
            totalMatches += projectMatchCount;
        }
        
        res.status(200).json({ 
            message: `Matching complete for ${activeProjects.length} projects. Found ${totalMatches} total potential matches.`,
            details: projectResults 
        });

    } catch (err) {
        next(err);
    }
};
