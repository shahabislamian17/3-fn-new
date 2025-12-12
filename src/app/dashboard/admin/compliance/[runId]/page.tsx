
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Download, FileText, Send, FileSignature, Sparkles, Edit, X, Filter, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const mockRunData = {
    id: "run-uuid-123",
    project: {
      id: "proj-uuid-1",
      title: "C-RECYCLE - Plastic Pellet Plant",
      slug: "eco-drone-innovations",
      funding_type: "equity",
      country: "CD",
      target_amount: 120000,
      raised_amount: 120000,
      owner: {
        name: "Jane Doe"
      }
    },
    initiated_at: "2025-11-09T10:00:00Z",
    initiated_by: "system",
    status: "escalated",
    ai_response: {
      ai_risk_score: 52.5,
      ai_recommendation: 'manual_review',
      reasoning: "50 of 350 investors are unverified. The largest unverified investment (7,000) exceeds the platform policy max single unverified amount of 5,000, and two investors have flagged PEP/sanctions indicators. The owner KYB is approved but beneficial owner verification is incomplete. These factors increase residual AML risk. Recommend targeted EDD on flagged accounts and request missing KYC from high-value unverified participants before release.",
      suggested_actions: [
        { priority: 1, action: "request_documents", target: "top_50_unverified", details: "Send automated KYC request for top 50 unverified investors" },
        { priority: 2, action: "perform_edd", target: "INV_1,INV_2", details: "Manual enhanced due diligence for flagged investors" },
        { priority: 3, action: "verify_beneficial_owners", target: "owner", details: "Confirm all beneficial owners via corporate registry API" },
        { priority: 4, action: "hold_payout", target: "project", details: "Hold funds until above actions completed or manual approval" }
      ]
    },
    owner_compliance: {
      status: 'approved',
      last_checked: "2025-11-09T09:55:00Z",
      notes: "KYB verified; beneficial owner 2 incomplete."
    },
    investors_summary: {
      total_investors: 350,
      verified_investors: 300,
      unverified_investors: 50,
      flagged_investors: 2,
      largest_unverified_investment: 7000
    },
    marketing_plan: { 
        one_liner: "C-RECYCLE: Turning plastic waste into profit while cleaning up the DRC.",
        "30_day_action_plan": [
            { day: 1, action: "Announce successful funding on all social media channels." },
            { day: 7, action: "Host a virtual Q&A with the founder for all investors." },
            { day: 21, action: "Publish a detailed timeline for plant construction." }
        ],
    },
    legal_documents: [
        {
            id: 'doc1',
            type: 'Owner Agreement',
            status: 'Signed',
            recipient: 'Jane Doe',
            url: '#',
        },
        {
            id: 'doc2',
            type: 'Investor Subscription Agreement',
            status: 'Awaiting Signatures',
            recipient: 'All Investors',
            url: '#',
        }
    ]
};

const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
        case 'approved':
        case 'auto_release':
             return 'bg-green-500';
        case 'rejected':
        case 'block':
        case 'blocked':
            return 'bg-red-500';
        case 'manual_review':
        case 'escalated':
        case 'in_review':
        case 'pending':
            return 'bg-amber-500';
        default: return 'bg-gray-400';
    }
}

const mockInvestors = [
    {id: 'INV_1', name: 'Frank Funder', email: 'frank@funder.com', country: 'USA', amount: 7000, kyc: 'Unverified', flags: 'PEP'},
    {id: 'INV_2', name: 'Grace Giver', email: 'grace@giver.com', country: 'Nigeria', amount: 5000, kyc: 'Unverified', flags: 'Sanctions Watchlist'},
    {id: 'INV_3', name: 'Sam Subscriber', email: 'sam@sub.com', country: 'UK', amount: 1000, kyc: 'Verified', flags: '-'},
];

const initialAuditTrail = [
    { id: 'audit1', timestamp: new Date('2025-11-09T10:00:00Z'), user: 'system', action: 'RUN_INITIATED', description: 'Compliance run automatically initiated.' },
    { id: 'audit2', timestamp: new Date('2025-11-09T10:01:00Z'), user: 'AI Analyst', action: 'ASSESSMENT_COMPLETED', description: 'AI analysis completed with a risk score of 52.5.' },
    { id: 'audit3', timestamp: new Date('2025-11-09T10:02:00Z'), user: 'system', action: 'STATUS_ESCALATED', description: 'Run status escalated to "manual_review" based on AI recommendation.' },
    { id: 'audit4', timestamp: new Date('2025-11-09T10:03:00Z'), user: 'AI Analyst', action: 'ARTIFACT_GENERATED', description: 'Marketing Plan v1 (marketing.json) created and stored in S3.' },
    { id: 'audit5', timestamp: new Date('2025-11-09T10:04:00Z'), user: 'AI Analyst', action: 'ARTIFACT_GENERATED', description: 'Legal Document Draft v1 (subscription_agreement.html) created.' },
  ];


type AuditEvent = {
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    description: string;
}

export default function ComplianceRunDetailsPage() {
    const run = mockRunData; 
    const { toast } = useToast();
    const [_isDecisionRecorded, setIsDecisionRecorded] = useState(false);
    const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(initialAuditTrail);
    const [adminNotes, setAdminNotes] = useState('');

    const handleSendKycRequest = (investorName: string) => {
        toast({
            title: "KYC Request Sent",
            description: `An automated KYC request has been sent to ${investorName}.`,
        });
    };
    
    const handleSendSignatures = () => {
        toast({
            title: "Signature Requests Sent",
            description: `E-signature requests have been sent to all required parties.`,
        });
    };

    const handleRecordDecision = (decision: string) => {
        setIsDecisionRecorded(true);
        const newEvent = {
            id: `audit${auditTrail.length + 1}`,
            timestamp: new Date(),
            user: 'Admin User',
            action: 'DECISION_RECORDED',
            description: `Admin recorded decision: '${decision}'. Notes: "${adminNotes || 'No notes'}"`
        };
        setAuditTrail(prev => [...prev, newEvent]);
        toast({
            title: "Decision Recorded",
            description: `The decision to '${decision}' has been recorded in the audit trail.`,
        });
    };
    
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Compliance Run — {run.project.title}</h1>
                    <div className="text-muted-foreground text-sm">
                        Run ID: <span className="font-mono">{run.id}</span> | Initiated: {new Date(run.initiated_at).toLocaleString()} | Status: <Badge variant={run.status === 'completed' ? 'default' : run.status === 'blocked' ? 'destructive' : 'secondary'} className="capitalize">{run.status}</Badge>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/admin/compliance">
                            <X className="mr-2 h-4 w-4" /> Close
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Top Summary Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Project Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between"><span>Project:</span> <Link href={`/projects/${run.project.slug}`} className="font-semibold hover:underline truncate">{run.project.title}</Link></div>
                        <div className="flex justify-between"><span>Owner:</span> <span className="font-semibold">{run.project.owner.name}</span></div>
                        <div className="flex justify-between"><span>Raised:</span> <span className="font-semibold">${run.project.raised_amount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Country:</span> <span className="font-semibold">{run.project.country}</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Run Status & AI</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-6xl font-bold" style={{ color: getStatusColor(run.ai_response.ai_risk_score > 70 ? 'rejected' : run.ai_response.ai_risk_score > 40 ? 'manual_review' : 'approved') }}>
                            {run.ai_response.ai_risk_score.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground -mt-2">AI Risk Score</p>
                        <Badge className="mt-4 text-base capitalize" style={{ backgroundColor: getStatusColor(run.ai_response.ai_recommendation), color: 'white' }}>
                            {run.ai_response.ai_recommendation.replace('_', ' ')}
                        </Badge>
                         <Button variant="link" size="sm" className="text-xs" asChild><a href="#ai-reasoning">View AI Reasoning</a></Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Compliance Quick Stats</CardTitle>
                    </CardHeader>
                     <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between items-center"><span>Owner KYB:</span> <Badge style={{ backgroundColor: getStatusColor(run.owner_compliance.status), color: 'white' }} className="capitalize">{run.owner_compliance.status}</Badge></div>
                        <div className="flex justify-between"><span>Investors Verified:</span> <span className="font-semibold">{run.investors_summary.verified_investors} / {run.investors_summary.total_investors}</span></div>
                        <div className="flex justify-between"><span>Flagged Investors:</span> <Link href="#investors" className="font-semibold text-destructive hover:underline">{run.investors_summary.flagged_investors}</Link></div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                   <Card>
                        <CardHeader>
                            <CardTitle>Owner KYB Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Company Name</p><p className="font-semibold">{run.project.title}</p></div>
                                <div><p className="text-muted-foreground">Reg Number</p><p className="font-semibold">123-ABC-456</p></div>
                                <div><p className="text-muted-foreground">KYB Result</p><Badge style={{ backgroundColor: getStatusColor(run.owner_compliance.status), color: 'white' }} className="capitalize">{run.owner_compliance.status}</Badge></div>
                                <div><p className="text-muted-foreground">Beneficial Owners</p><p className="font-semibold">1 / 2 Verified</p></div>
                             </div>
                             <Separator className="my-4"/>
                             <p className="text-sm font-semibold mb-2">Documents</p>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild><a href="#" target="_blank"><FileText className="mr-2"/> Registration</a></Button>
                                <Button variant="outline" size="sm" asChild><a href="#" target="_blank"><FileText className="mr-2"/> Bank Statement</a></Button>
                              </div>
                        </CardContent>
                   </Card>
                   
                    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-6">
                        <Card>
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="p-6">
                                    <CardTitle className="flex items-center gap-2"><Sparkles /> AI-Generated Marketing Plan</CardTitle>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                     <h4 className="font-semibold mb-2">{run.marketing_plan.one_liner}</h4>
                                     <h5 className="font-semibold mt-4 mb-2 text-sm">30-Day Action Plan</h5>
                                     <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                        {run.marketing_plan['30_day_action_plan'].map(item => (
                                            <li key={item.day}>Day {item.day}: {item.action}</li>
                                        ))}
                                     </ul>
                                    <CardFooter className="px-0 pt-4 mt-4 border-t">
                                        <div className="flex gap-2">
                                            <Button size="sm"><Check className="mr-2" />Approve</Button>
                                            <Button size="sm" variant="secondary"><Edit className="mr-2" />Edit</Button>
                                            <Button size="sm" variant="destructive"><X className="mr-2" />Reject</Button>
                                        </div>
                                    </CardFooter>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                        
                         <Card>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="p-6">
                                    <CardTitle className="flex items-center gap-2"><FileSignature /> AI-Generated Legal Documents</CardTitle>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Document Type</TableHead><TableHead>Recipient</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                             {run.legal_documents.map(doc => (
                                                <TableRow key={doc.id}>
                                                    <TableCell>{doc.type}</TableCell>
                                                    <TableCell>{doc.recipient}</TableCell>
                                                    <TableCell><Badge variant={doc.status === 'Signed' ? 'default' : 'secondary'}>{doc.status}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild><a href={doc.url}>View</a></Button>
                                                    </TableCell>
                                                </TableRow>
                                             ))}
                                        </TableBody>
                                    </Table>
                                    <CardFooter className="px-0 pt-4 mt-4 border-t">
                                        <div className="flex gap-2">
                                            <Button onClick={handleSendSignatures}><Send className="mr-2"/>Send for Signature</Button>
                                            <Button variant="secondary"><Edit className="mr-2" />Edit Document</Button>
                                        </div>
                                    </CardFooter>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    </Accordion>

                    <Card id="investors">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Investors</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm"><Filter className="mr-2"/> Filter</Button>
                                    <Button variant="outline" size="sm"><Download className="mr-2"/> Export List</Button>
                                </div>
                            </div>
                            <CardDescription>Review individual investor compliance status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Investor</TableHead><TableHead>Amount</TableHead><TableHead>KYC Status</TableHead><TableHead>Flags</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {mockInvestors.map(inv => (
                                         <TableRow key={inv.id}>
                                            <TableCell><div>{inv.name}</div><div className="text-xs text-muted-foreground">{inv.email}</div></TableCell>
                                            <TableCell>${inv.amount.toLocaleString()}</TableCell>
                                            <TableCell><Badge variant={inv.kyc === 'Verified' ? 'default' : 'secondary'}>{inv.kyc}</Badge></TableCell>
                                            <TableCell><Badge variant={inv.flags === '-' ? 'outline' : 'destructive'}>{inv.flags}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleSendKycRequest(inv.name)}>Send KYC Request</Button>
                                            </TableCell>
                                         </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Provider Raw Responses & AI Prompts</AccordionTrigger>
                            <AccordionContent>
                                <pre className="text-xs bg-secondary p-4 rounded-md overflow-x-auto"><code>{JSON.stringify(run, null, 2)}</code></pre>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6 sticky top-24">
                     <Card id="ai-reasoning">
                        <CardHeader><CardTitle>AI Reasoning & Suggested Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <p className="text-sm text-muted-foreground italic">"{run.ai_response.reasoning}"</p>
                             <ul className="space-y-2">
                                {run.ai_response.suggested_actions.map(action => (
                                    <li key={action.priority} className="flex items-start gap-3 text-sm">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">{action.priority}</div>
                                        <div className="flex-1">
                                            <span className="font-semibold capitalize">{action.action.replace(/_/g, ' ')}:</span> {action.details}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader><CardTitle>Decision Panel</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                                <Label htmlFor="decision-notes">Admin Notes</Label>
                                <Textarea id="decision-notes" placeholder="Add notes for this decision..." className="mt-1" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                 <Button onClick={() => handleRecordDecision('Approve Release')}><Check className="mr-2"/> Approve Release</Button>
                                 <Button variant="destructive" onClick={() => handleRecordDecision('Block & Refund')}><X className="mr-2"/> Block & Refund</Button>
                                 <Button variant="secondary" onClick={() => handleRecordDecision('Request More Info')}><MessageSquare className="mr-2"/> Request More Info</Button>
                            </div>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {auditTrail.slice().reverse().map(event => (
                                    <div key={event.id} className="flex gap-3 text-sm">
                                        <div className="flex-shrink-0 w-24 text-muted-foreground text-xs">{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="flex-1">
                                            <p className="font-semibold capitalize">{event.action.replace(/_/g, ' ').toLowerCase()} by <span className="text-primary">{event.user}</span></p>
                                            <p className="text-muted-foreground text-xs">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    )
}
