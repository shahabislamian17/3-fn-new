
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/firebase';

export default function DefaultDashboard() {
    const { user } = useAuth();
    return (
        <div>
            <CardHeader className="p-0 mb-6">
                <CardTitle>{user?.role} Dashboard</CardTitle>
                <CardDescription>Key metrics and tasks for your role.</CardDescription>
            </CardHeader>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Dashboard widgets for the {user?.role} role will be displayed here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
