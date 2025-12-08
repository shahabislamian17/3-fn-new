
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateCampaignPitch, type GenerateCampaignPitchOutput } from '@/ai/flows/generate-campaign-pitch';
import { generateFinancialProjections, type GenerateFinancialProjectionsOutput } from '@/ai/flows/generate-financial-projections';
import { suggestFundingTerms, type SuggestFundingTermsOutput } from '@/ai/flows/suggest-funding-terms';
import { Loader2, Sheet, FileText } from 'lucide-react';
import { countries } from '@/lib/countries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { projectCategories } from '@/lib/data';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Schemas for forms
const pitchFormSchema = z.object({
  industry: z.string().min(2, { message: 'Industry is required.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  projectDescription: z.string().min(50, { message: 'Please provide a detailed project description of at least 50 characters.' }),
  tone: z.enum(['persuasive', 'neutral', 'conservative']),
});

const termsFormSchema = z.object({
  sector: z.string().min(2, { message: 'Sector is required.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  projectDescription: z.string().min(50, { message: 'Please provide a detailed project description of at least 50 characters.' }),
});

const financialsFormSchema = z.object({
  industry: z.string().min(2, { message: 'Industry is required.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  currency: z.string().min(2, { message: 'Currency is required.' }),
  projectDescription: z.string().min(50, { message: 'Please provide a detailed project description of at least 50 characters.' }),
  historicalRevenue: z.coerce.number().optional(),
  headcount: z.coerce.number().min(1, { message: 'Headcount must be at least 1.' }),
  plannedCapex: z.coerce.number().min(0),
  grossMarginAssumptions: z.coerce.number().min(0).max(100),
  pricingModel: z.string().min(2, { message: 'Pricing model is required.' }),
  customerAcquisitionCost: z.coerce.number().min(0),
  retentionMetrics: z.coerce.number().optional(),
  seasonalityFlags: z.string().min(2, { message: 'Seasonality flags are required.' }),
  taxes: z.coerce.number().min(0).max(100),
  financingCosts: z.coerce.number().min(0),
});

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
};

// Sub-components for each generator
function PitchGenerator() {
    const [pitch, setPitch] = useState<GenerateCampaignPitchOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof pitchFormSchema>>({
        resolver: zodResolver(pitchFormSchema),
        defaultValues: { industry: '', country: '', projectDescription: '', tone: 'persuasive' },
    });

    async function onSubmit(values: z.infer<typeof pitchFormSchema>) {
        setIsLoading(true);
        setPitch(null);
        try {
            const result = await generateCampaignPitch(values);
            setPitch(result);
            toast({ title: "Pitch Generated", description: "Your AI-powered pitch is ready."});
        } catch (error) {
            toast({ title: "Error", description: "Could not generate pitch.", variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
             <div className="lg:col-span-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="industry" render={({ field }) => (<FormItem><FormLabel>Industry</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl><SelectContent>{projectCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent>{countries.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tone" render={({ field }) => (<FormItem><FormLabel>Tone</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger></FormControl><SelectContent><SelectItem value="persuasive">Persuasive</SelectItem><SelectItem value="neutral">Neutral</SelectItem><SelectItem value="conservative">Conservative</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="projectDescription" render={({ field }) => (<FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea placeholder="Describe your project..." rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isLoading} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Generate Pitch</Button>
                    </form>
                </Form>
             </div>
             <div className="lg:col-span-2">
                {isLoading && <div className="flex items-center justify-center h-full min-h-64 border-2 border-dashed rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                {pitch && (
                    <div className="space-y-6">
                        <div><h3 className="text-lg font-semibold mb-2">Short Pitch</h3><div className="p-4 bg-secondary rounded-md prose prose-sm max-w-none"><p>{pitch.shortPitch}</p></div></div>
                        <div><h3 className="text-lg font-semibold mb-2">Long-Form Description</h3><div className="p-4 bg-secondary rounded-md prose max-w-none prose-p:mb-4">{pitch.longPitch.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div></div>
                    </div>
                )}
                {!isLoading && !pitch && <div className="flex items-center justify-center text-center h-full min-h-64 border-2 border-dashed rounded-lg text-muted-foreground"><p>Your generated pitch will appear here.</p></div>}
             </div>
        </div>
    );
}

function TermsGenerator() {
    const [terms, setTerms] = useState<SuggestFundingTermsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof termsFormSchema>>({
        resolver: zodResolver(termsFormSchema),
        defaultValues: { sector: '', location: '', projectDescription: '' },
    });

    async function onSubmit(values: z.infer<typeof termsFormSchema>) {
        setIsLoading(true);
        setTerms(null);
        try {
            const result = await suggestFundingTerms(values);
            setTerms(result);
            toast({ title: "Terms Suggested", description: "AI-powered term suggestions are ready."});
        } catch (error) {
            toast({ title: "Error", description: "Could not suggest terms.", variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    }

     return (
        <div className="grid gap-6 lg:grid-cols-3">
             <div className="lg:col-span-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="sector" render={({ field }) => (<FormItem><FormLabel>Sector</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a sector" /></SelectTrigger></FormControl><SelectContent>{projectCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent>{countries.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="projectDescription" render={({ field }) => (<FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea placeholder="Describe your project..." rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isLoading} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Suggest Terms</Button>
                    </form>
                </Form>
             </div>
             <div className="lg:col-span-2">
                {isLoading && <div className="flex items-center justify-center h-full min-h-64 border-2 border-dashed rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                {terms && (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Card><CardHeader className="pb-2"><CardDescription>Funding Ask</CardDescription><CardTitle className="text-2xl">{terms.fundingAsk}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>Equity Offered</CardDescription><CardTitle className="text-2xl">{terms.equityPercentage}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>Royalty Terms</CardDescription><CardTitle className="text-base">{terms.royaltyTerms}</CardTitle></CardHeader></Card></div>
                        <div><h3 className="text-lg font-semibold mb-2">Reasoning</h3><div className="p-4 bg-secondary rounded-md prose prose-sm max-w-none"><p>{terms.reasoning}</p></div></div>
                    </div>
                )}
                {!isLoading && !terms && <div className="flex items-center justify-center text-center h-full min-h-64 border-2 border-dashed rounded-lg text-muted-foreground"><p>Your suggested terms will appear here.</p></div>}
             </div>
        </div>
    );
}

function FinancialsGenerator() {
    const [projections, setProjections] = useState<GenerateFinancialProjectionsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currency, setCurrency] = useState('USD');
    const { toast } = useToast();
    const form = useForm<z.infer<typeof financialsFormSchema>>({
        resolver: zodResolver(financialsFormSchema),
        defaultValues: { industry: '', country: '', currency: 'USD', projectDescription: '', headcount: 1, plannedCapex: 0, grossMarginAssumptions: 50, pricingModel: '', customerAcquisitionCost: 0, taxes: 20, financingCosts: 0, seasonalityFlags: 'N/A', historicalRevenue: undefined, retentionMetrics: undefined },
    });

    async function onSubmit(values: z.infer<typeof financialsFormSchema>) {
        setIsLoading(true);
        setProjections(null);
        setCurrency(values.currency);
        try {
            const result = await generateFinancialProjections(values);
            setProjections(result);
            toast({ title: "Projections Generated", description: "Your 3-year financial forecast is ready."});
        } catch (error) {
            toast({ title: "Error", description: "Could not generate projections.", variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
             <div className="lg:col-span-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="projectDescription" render={({ field }) => (<FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea placeholder="Describe your business model..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="industry" render={({ field }) => (<FormItem><FormLabel>Industry</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl><SelectContent>{projectCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{countries.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} /></div>
                        <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="e.g., USD" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="historicalRevenue" render={({ field }) => (<FormItem><FormLabel>Prior Year Revenue</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} /></div>
                        <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="headcount" render={({ field }) => (<FormItem><FormLabel>Headcount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="plannedCapex" render={({ field }) => (<FormItem><FormLabel>Planned CAPEX</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                        <FormField control={form.control} name="pricingModel" render={({ field }) => (<FormItem><FormLabel>Pricing Model</FormLabel><FormControl><Input placeholder="e.g., Subscription" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="grossMarginAssumptions" render={({ field }) => (<FormItem><FormLabel>Gross Margin %</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="customerAcquisitionCost" render={({ field }) => (<FormItem><FormLabel>CAC</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                        <FormField control={form.control} name="seasonalityFlags" render={({ field }) => (<FormItem><FormLabel>Seasonality</FormLabel><FormControl><Input placeholder="e.g., Strong in Q4" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="taxes" render={({ field }) => (<FormItem><FormLabel>Tax Rate %</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="financingCosts" render={({ field }) => (<FormItem><FormLabel>Financing Costs</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                        <Button type="submit" disabled={isLoading} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Generate Projections</Button>
                    </form>
                </Form>
             </div>
             <div className="lg:col-span-2">
                {isLoading && <div className="flex items-center justify-center h-full min-h-64 border-2 border-dashed rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                {projections && (
                     <Card>
                        <CardHeader><div className="flex justify-between items-start"><div><CardTitle>AI-Generated Financial Projections</CardTitle><CardDescription>Review the 3-year forecast.</CardDescription></div><div className="flex gap-2"><Button variant="outline" size="sm"><Sheet className="mr-2 h-4 w-4" /> CSV</Button><Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> PDF</Button></div></div></CardHeader>
                        <CardContent className="space-y-6">
                            <div><h3 className="text-lg font-semibold mb-2">P&L Projection</h3><Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">COGS</TableHead><TableHead className="text-right">Gross Margin</TableHead><TableHead className="text-right">OpEx</TableHead><TableHead className="text-right">EBITDA</TableHead></TableRow></TableHeader><TableBody>{projections.projections.map((item) => (<TableRow key={item.year}><TableCell className="font-medium">Year {item.year}</TableCell><TableCell className="text-right">{formatCurrency(item.revenue, currency)}</TableCell><TableCell className="text-right">{formatCurrency(item.cogs, currency)}</TableCell><TableCell className="text-right">{formatCurrency(item.grossMargin, currency)}</TableCell><TableCell className="text-right">{formatCurrency(item.opex, currency)}</TableCell><TableCell className="text-right">{formatCurrency(item.ebitda, currency)}</TableCell></TableRow>))}</TableBody></Table></div>
                            <div><h3 className="text-lg font-semibold mb-2">Cashflow Forecast</h3><Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Quarter</TableHead><TableHead className="text-right">Receipts</TableHead><TableHead className="text-right">Payments</TableHead><TableHead className="text-right">Net Cashflow</TableHead></TableRow></TableHeader><TableBody>{projections.cashflowForecast.map((item, index) => (<TableRow key={index}><TableCell className="font-medium">{item.year}</TableCell><TableCell>{item.quarter}</TableCell><TableCell className="text-right">{formatCurrency(item.receipts, currency)}</TableCell><TableCell className="text-right">{formatCurrency(item.payments, currency)}</TableCell><TableCell className="text-right">{formatCurrency(item.netCashflow, currency)}</TableCell></TableRow>))}</TableBody></Table></div>
                            <Card><CardHeader><CardTitle className="text-base">Break-Even Analysis</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{projections.breakEvenAnalysis}</p></CardContent></Card>
                            <div className="grid md:grid-cols-2 gap-6"><Card><CardHeader><CardTitle className="text-base">Royalty Repayment</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{projections.repaymentSchedule}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Equity Valuation</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{projections.equityValuationPath}</p></CardContent></Card></div>
                            <Card><CardHeader><CardTitle className="text-base">Sensitivity Analysis</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{projections.sensitivityAnalysis}</p></CardContent></Card>
                            <Card><CardHeader><CardTitle className="text-base">Assumptions</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">{projections.assumptions.map((assumption, i) => <li key={i}>{assumption}</li>)}</ul></CardContent></Card>
                        </CardContent>
                    </Card>
                )}
                {!isLoading && !projections && <div className="flex items-center justify-center text-center h-full min-h-64 border-2 border-dashed rounded-lg text-muted-foreground"><p>Your generated financial projections will appear here.</p></div>}
             </div>
        </div>
    );
}

export function AIContentGenerator() {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-lg font-semibold">1. AI Campaign Pitch</AccordionTrigger>
        <AccordionContent className="pt-4">
          <PitchGenerator />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="text-lg font-semibold">2. AI Funding Terms</AccordionTrigger>
        <AccordionContent className="pt-4">
          <TermsGenerator />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="text-lg font-semibold">3. AI Financial Projections</AccordionTrigger>
        <AccordionContent className="pt-4">
            <FinancialsGenerator />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
