
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, FileText, PieChart, LandPlot } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { useEffect, useState } from "react";
import type { Investment } from "@/lib/types";

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
};

const transactionTypes = {
    'Investment (Equity)': {
        icon: PieChart,
        style: 'text-red-600',
    },
    'Investment (Royalty)': {
        icon: LandPlot,
        style: 'text-red-600',
    },
    'Royalty Payout': {
        icon: ArrowDownLeft,
        style: 'text-green-600',
    },
    'Dividend': {
        icon: ArrowDownLeft,
        style: 'text-green-600',
    },
    'Tax Document': {
        icon: FileText,
        style: 'text-muted-foreground',
    }
} as const;


type Transaction = {
    id: string;
    projectTitle: string;
    projectSlug?: string;
    transactionType: keyof typeof transactionTypes;
    amount: number | null;
    currency: string;
    date: string;
    status: 'Completed' | 'Pending' | 'Failed';
}

export default function TransactionsPage() {
    const { user } = useAuth();
    const [investments, setInvestments] = useState<Investment[]>([]);
    
    useEffect(() => {
        async function fetchInvestments() {
            if (!user) return;
            const res = await fetch('/api/user/investments');
            const data = await res.json();
            setInvestments(data.investments || []);
        }
        fetchInvestments();
    }, [user]);

    const allTransactions: Transaction[] = [
        ...investments.map(i => {
            const transactionType = (i.project.type === 'Equity' ? 'Investment (Equity)' : 'Investment (Royalty)') as 'Investment (Equity)' | 'Investment (Royalty)';
            return { id: i.id, projectTitle: i.project.title, projectSlug: i.project.slug, transactionType, amount: -i.amount, currency: 'USD', date: i.date, status: 'Completed' as const };
        }),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unified Transaction Ledger</CardTitle>
                <CardDescription>A complete history of all your financial activities on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allTransactions.length > 0 ? allTransactions.map((transaction) => {
                            const typeInfo = transactionTypes[transaction.transactionType];
                            const Icon = typeInfo.icon;
                            return (
                                <TableRow key={transaction.id}>
                                    <TableCell className="hidden md:table-cell">{format(new Date(transaction.date), "PPP")}</TableCell>
                                     <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${typeInfo.style}`} />
                                            <span className="hidden sm:inline font-medium">{transaction.transactionType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {transaction.projectSlug ? (
                                            <Link href={`/projects/${transaction.projectSlug}`} className="hover:underline">
                                                {transaction.projectTitle}
                                            </Link>
                                        ) : (
                                            transaction.projectTitle
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-right font-mono ${transaction.amount && transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.amount !== null ? formatCurrency(transaction.amount, transaction.currency) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            variant={transaction.status === 'Completed' ? 'default' : transaction.status === 'Pending' ? 'secondary' : 'destructive'}
                                            className="capitalize"
                                        >
                                            {transaction.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No transactions yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
