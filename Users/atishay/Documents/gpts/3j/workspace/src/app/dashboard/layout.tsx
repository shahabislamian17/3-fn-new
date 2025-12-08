
'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { useAuth } from '@/firebase/auth/use-auth';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  Briefcase,
  History,
  Settings,
  Bell,
  Search,
  FilePen,
  AreaChart,
  Lightbulb,
  ShieldCheck,
  Headset,
  Calculator,
  Cog,
  Landmark,
  DollarSign,
  GanttChartSquare,
  Users,
  UserCheck,
  AlertTriangle,
  GitPullRequest,
  TrendingUp,
  PlusCircle,
  FileSearch,
  CreditCard,
  Sparkles,
  Newspaper,
  FileKey,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Badge } from '@/components/ui/badge';
import { Chatbot } from '@/components/chatbot';
import { Notifications } from '@/components/notifications';
import type { User as AppUser, UserRole } from '@/lib/types';
import { AuthWrapper } from '@/firebase/auth-wrapper';


const navItemsByRole: Record<string, { href: string; icon: React.ElementType; label: string }[]> = {
  SuperAdmin: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/admin/approvals', icon: ShieldCheck, label: 'Approvals' },
    { href: '/dashboard/admin/auto-approvals', icon: Bot, label: 'Auto-Approvals' },
    { href: '/dashboard/admin/compliance', icon: FileSearch, label: 'Compliance Runs' },
    { href: '/dashboard/admin/fallback-kyc', icon: FileKey, label: 'Fallback KYC' },
    { href: '/dashboard/admin/matching', icon: Sparkles, label: 'AI Matching' },
    { href: '/dashboard/admin/content', icon: Newspaper, label: 'Content Engine' },
    { href: '/dashboard/admin/newsletter', icon: Newspaper, label: 'Newsletter' },
    { href: '/dashboard/admin/users', icon: Users, label: 'User Management' },
    { href: '/dashboard/admin/payouts', icon: Landmark, label: 'Stripe Payouts' },
    { href: '/dashboard/admin/commissions', icon: DollarSign, label: 'Commissions' },
    { href: '/dashboard/admin/support', icon: Headset, label: 'Support' },
    { href: '/dashboard/admin/settings', icon: Cog, label: 'Platform Config' },
  ],
  Admin: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/admin/approvals', icon: ShieldCheck, label: 'Approvals' },
    { href: '/dashboard/admin/auto-approvals', icon: Bot, label: 'Auto-Approvals' },
    { href: '/dashboard/admin/compliance', icon: FileSearch, label: 'Compliance Runs' },
    { href: '/dashboard/admin/fallback-kyc', icon: FileKey, label: 'Fallback KYC' },
    { href: '/dashboard/admin/matching', icon: Sparkles, label: 'AI Matching' },
    { href: '/dashboard/admin/content', icon: Newspaper, label: 'Content Engine' },
    { href: '/dashboard/admin/newsletter', icon: Newspaper, label: 'Newsletter' },
    { href: '/dashboard/admin/users', icon: Users, label: 'User Management' },
    { href: '/dashboard/admin/payouts', icon: Landmark, label: 'Payouts' },
  ],
  ProjectOwner: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/portfolio', icon: Briefcase, label: 'My Campaigns' },
    { href: '/dashboard/niche-finder', icon: Lightbulb, label: 'Niche Finder' },
    { href: '/dashboard/readiness', icon: TrendingUp, label: 'Readiness Assessment' },
    { href: '/dashboard/suggest-terms', icon: AreaChart, label: 'Suggest Terms' },
    { href: '/dashboard/financial-projections', icon: Calculator, label: 'Financial Projections' },
    { href: '/dashboard/create-campaign', icon: FilePen, label: 'AI Campaign Pitch' },
    { href: '/dashboard/create-project', icon: PlusCircle, label: 'Create Project' },
  ],
  Investor: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/portfolio', icon: Briefcase, label: 'My Portfolio' },
    { href: '/projects', icon: GanttChartSquare, label: 'Browse Projects' },
    { href: '/dashboard/transactions', icon: History, label: 'Transactions' },
  ],
  ComplianceOfficer: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin/approvals', icon: UserCheck, label: 'KYC/AML Review' },
    { href: '/dashboard/admin/compliance', icon: FileSearch, label: 'Compliance Runs' },
    { href: '/dashboard/admin/fallback-kyc', icon: FileKey, label: 'Fallback KYC' },
    { href: '/dashboard/admin/approvals', icon: GitPullRequest, label: 'Transaction Monitoring' },
  ],
  Support: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin/support', icon: Headset, label: 'Support Tickets' },
    { href: '/dashboard/admin/support', icon: AlertTriangle, label: 'Disputes' },
  ],
  AccountingOperator: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin/payouts', icon: Landmark, label: 'Reconcile Payouts' },
    { href: '/dashboard/admin/commissions', icon: DollarSign, label: 'Commissions' },
  ],
};


function DashboardContent({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
      await logout();
      router.push('/');
    };
  
    const appUser = user as AppUser | null;
    const role = appUser?.role || 'Investor';
  
    const currentNavItems = navItemsByRole[role] || [];
  
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="text-lg font-semibold">3JN CrowdFunding</span>
              </Link>
              <Badge variant="secondary" className="group-data-[collapsible=icon]:hidden">
                {role}
              </Badge>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {currentNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
               <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Account" isActive={pathname.startsWith('/dashboard/account')}>
                    <Link href="/dashboard/account">
                      <Settings />
                      <span>Account</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter onLogout={handleLogout} />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className="relative ml-auto flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
              </div>
              <Notifications />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <Toaster />
          <Chatbot />
        </SidebarInset>
      </SidebarProvider>
    );
  }

export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <AuthWrapper>
            <DashboardContent>
                {children}
            </DashboardContent>
        </AuthWrapper>
    )
}
