import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { suggestProjects } from '@/ai/flows/suggest-projects';
import type { Project } from '@/lib/types';

export async function POST(_request: Request) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Fetch all investors
    const investorsSnapshot = await adminDb.collection('users')
      .where('role', '==', 'Investor')
      .get();
    const investors = investorsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Fetch all live projects
    const projectsSnapshot = await adminDb.collection('projects')
      .where('status', '==', 'live')
      .get();
    const projects = projectsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Project));

    let totalMatches = 0;
    const projectResults: Record<string, number> = {};

    for (const project of projects) {
      let projectMatchCount = 0;
      for (const investor of investors) {
        // Fetch investor's portfolio
        const investmentsSnapshot = await adminDb.collection('investments')
          .where('userId', '==', investor.id)
          .get();
        const portfolio = investmentsSnapshot.docs.map((doc: any) => {
          const investment = doc.data();
          const investedProject = projects.find((p: Project) => p.id === investment.projectId);
          return {
            id: investedProject?.id || '',
            title: investedProject?.title || 'Unknown Project',
            category: investedProject?.category || 'Unknown',
            type: investedProject?.type || 'Equity',
            location: investedProject?.location || 'Unknown',
            shortDescription: investedProject?.shortDescription || '',
          };
        });

        const investorProfile = {
          riskAppetite: (investor as any).risk_tolerance || 'moderate',
          preferredCategories: (investor as any).preferred_categories || [],
          preferredCountries: (investor as any).preferred_countries || [],
          portfolio,
          preferredInvestmentTypes: (investor as any).preferred_investment_types || [],
        };

        const input = {
          investorProfile,
          availableProjects: [project],
        };

        const result = await suggestProjects(input);

        if (result.suggestions.length > 0 && result.suggestions[0].projectId === project.id) {
          projectMatchCount++;
        }
      }
      projectResults[project.title] = projectMatchCount;
      totalMatches += projectMatchCount;
    }

    return NextResponse.json({
      message: `Matching complete for ${projects.length} projects. Found ${totalMatches} total potential matches.`,
      details: projectResults,
    });
  } catch (error: any) {
    console.error('Match projects error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to match projects' },
      { status: 500 }
    );
  }
}
