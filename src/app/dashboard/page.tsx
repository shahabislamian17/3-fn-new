'use client';

import { useAuth } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import AdminDashboard from '@/components/dashboards/admin-dashboard';
import ProjectOwnerDashboard from '@/components/dashboards/project-owner-dashboard';
import InvestorDashboard from '@/components/dashboards/investor-dashboard';
import DefaultDashboard from '@/components/dashboards/default-dashboard';
import ComplianceOfficerDashboard from '@/components/dashboards/compliance-officer-dashboard';
import SupportDashboard from '@/components/dashboards/support-dashboard';
import AccountingOperatorDashboard from '@/components/dashboards/accounting-operator-dashboard';
import { Loader2 } from 'lucide-react';

const dashboardMap: Record<string, React.ComponentType> = {
  SuperAdmin: AdminDashboard,
  Admin: AdminDashboard,
  ProjectOwner: ProjectOwnerDashboard,
  Investor: InvestorDashboard,
  ComplianceOfficer: ComplianceOfficerDashboard,
  Support: SupportDashboard,
  AccountingOperator: AccountingOperatorDashboard,
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  
  // Show loading state to prevent blinking
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Cast the user to your AppUser type to access the role property
  const appUser = user as AppUser | null;
  const role = appUser?.role || 'Investor';

  const DashboardComponent = dashboardMap[role] || DefaultDashboard;

  return <DashboardComponent />;
}
