
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BarChart, ChevronLeft, Download, FileText, HandCoins, HelpCircle, MapPin, Scale, Users, Tag, Loader2, CheckCircle, TrendingUp, Clock, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import dynamic from 'next/dynamic';
import type { Project } from '@/lib/types';
import { suggestInvestment, SuggestInvestmentInput, SuggestInvestmentOutput } from '@/ai/flows/suggest-investment';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from "framer-motion";
import CountUp from 'react-countup';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/firebase';
import { gtm } from '@/lib/gtm';
import { getPlaceholderImage } from '@/lib/assets/placeholder-images';

const RechartsBarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const formatCurrency = (amount: number, currency: string, fractionDigits = 0) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount);
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  ebitda: {
    label: "EBITDA",
    color: "hsl(var(--accent))",
  },
} satisfies import('@/components/ui/chart').ChartConfig;


const investmentAnalysisSchema = z.object({
    amount: z.coerce.number().min(1, { message: 'Please enter an investment amount.' }),
});

const investFormSchema = z.object({
    investmentAmount: z.coerce.number().min(1, { message: 'Investment amount is required.' }),
});

function InvestmentAnalysisTab({ project }: { project: Project }) {
    const [analysis, setAnalysis] = useState<SuggestInvestmentOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof investmentAnalysisSchema>>({
        resolver: zodResolver(investmentAnalysisSchema),
        defaultValues: {
            amount: project.minTicket,
        },
    });

    async function onSubmit(values: z.infer<typeof investmentAnalysisSchema>) {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const input: SuggestInvestmentInput = {
                projectType: project.type,
                projectDescription: project.longDescription,
                sector: project.category,
                region: project.location,
                valuation: project.valuation,
                equityOffered: project.equityOffered,
                royaltyRate: project.royaltyRate,
                repaymentMultiple: project.repaymentMultiple,
                investmentAmount: values.amount,
                targetAmount: project.targetAmount,
                currency: project.currency,
                projectFinancials: project.financials.projections,
            };
            const result = await suggestInvestment(input);
            setAnalysis(result);
            gtm.push({
                event: 'ai_tool_used',
                tool: 'InvestmentAnalysis',
                investmentAmount: values.amount,
                projectId: project.id
            });
        } catch (error) {
            console.error("Error generating investment analysis:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                 <h3 className="text-xl font-semibold mb-4 font-headline">Investment Scenario Calculator</h3>
                 <p className="text-sm text-muted-foreground mb-6">Enter an amount to see an illustrative scenario for this investment. This is not financial advice.</p>
                 <Card>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Investment Amount ({project.currency})</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder={`${project.minTicket}`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Analyze Investment
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                 </Card>
            </div>
            <div>
                 <h3 className="text-xl font-semibold mb-4 font-headline">AI-Powered Analysis</h3>
                 <div className="h-full">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed rounded-lg">
                            <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">Analyzing...</p>
                            </div>
                        </div>
                    )}
                    {analysis && (
                        <Card className="h-full">
                            <CardHeader>
                               <CardTitle>Illustrative Scenario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Risk Profile</p>
                                    <div className="text-lg font-semibold flex items-center gap-2">
                                        <Badge variant={analysis.riskScore === 'Low' ? 'default' : analysis.riskScore === 'Medium' ? 'secondary' : 'destructive'}>{analysis.riskScore}</Badge>
                                        <span>{analysis.riskReasoning}</span>
                                    </div>
                                </div>
                                 <div>
                                    <p className="text-sm font-medium text-muted-foreground">Potential Outcome</p>
                                    <p className="text-lg font-semibold">{analysis.investmentScenario}</p>
                                </div>
                                <Alert variant="default" className="bg-secondary">
                                    <HelpCircle className="h-4 w-4" />
                                    <AlertTitle>Disclaimer</AlertTitle>
                                    <AlertDescription>
                                        {analysis.disclaimer}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}
                    {!isLoading && !analysis && (
                        <div className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed rounded-lg">
                            <div className="text-center">
                            <p className="text-muted-foreground">Your investment analysis will appear here.</p>
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    )
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

function InvestDialog({ project, children }: { project: Project, children: React.ReactNode }) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const investorFeePercent = 0.02;

    const form = useForm<z.infer<typeof investFormSchema>>({
        resolver: zodResolver(investFormSchema),
        defaultValues: {
            investmentAmount: project.minTicket,
        },
    });

    const investmentAmount = form.watch('investmentAmount') || 0;
    const platformFee = investmentAmount * investorFeePercent;
    const totalPayable = investmentAmount + platformFee;

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTimeout(() => {
                setIsLoading(false);
                setIsSuccess(false);
                form.reset({ investmentAmount: project.minTicket });
            }, 500);
        }
    }

    async function onSubmit(values: z.infer<typeof investFormSchema>) {
        setIsLoading(true);
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to invest.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        // Track GTM & FB Pixel Events
        gtm.push({
            event: 'initiate_checkout',
            amount: totalPayable,
            projectId: project.id
        });
        if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                value: totalPayable,
                currency: project.currency,
                content_ids: [project.id],
                content_type: 'product'
            });
        }

        try {
            // Modify success_url to include amount and currency for purchase tracking
            const successUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/success`);
            successUrl.searchParams.append('amount', totalPayable.toString());
            successUrl.searchParams.append('currency', project.currency);
            
            const res = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalPayable,
                    email: user.email,
                    metadata: { 
                        projectId: project.id, 
                        projectName: project.title,
                        userId: user.uid,
                        investmentAmount: values.investmentAmount,
                        platformFee: platformFee,
                        currency: project.currency,
                    },
                    success_url: successUrl.toString(),
                    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
                }),
            });

            if (!res.ok) throw new Error('Failed to create checkout session');
            
            const session = await res.json();

            if (session.url) {
                window.location.href = session.url;
            } else {
                 throw new Error('Stripe session URL not found.');
            }
        } catch (error: any) {
             toast({
                title: 'Investment Failed',
                description: error.message || 'Could not initiate payment. Please try again.',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    }
    
    const equityShare = project.type === 'Equity' && project.valuation ? (investmentAmount / project.valuation) * 100 : 0;
    const royaltyReturn = project.type === 'Royalty' && project.repaymentMultiple ? investmentAmount * project.repaymentMultiple : 0;

    const formatValue = (value: number, fractionDigits = 2) => {
        return (
          <CountUp
            start={0}
            end={value}
            duration={0.3}
            separator=","
            prefix="$"
            decimals={fractionDigits}
            preserveValue
          />
        );
      };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {!isSuccess ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Invest in {project.title}</DialogTitle>
                            <DialogDescription>
                                Review your investment and platform fee before confirming.
                            </DialogDescription>
                        </DialogHeader>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="investmentAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Investment Amount ({project.currency})</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={project.minTicket} placeholder={`${project.minTicket}`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <AnimatePresence>
                                {investmentAmount >= project.minTicket && (
                                     <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 rounded-lg border bg-card p-4 text-sm"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Investment Amount</span>
                                            <motion.span
                                                key={investmentAmount}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="font-semibold">{formatValue(investmentAmount, 2)}</motion.span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                Platform Processing Fee (2%)
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info size={14} className="cursor-pointer" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>A 2% processing fee covers payment gateway and transaction costs.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <motion.span
                                                key={platformFee}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="font-semibold">{formatValue(platformFee, 2)}</motion.span>
                                        </div>
                                        <div className="flex justify-between items-center border-t pt-3 font-bold">
                                            <span className="text-foreground">Total Payable</span>
                                            <motion.span
                                                key={totalPayable}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-primary text-xl">{formatValue(totalPayable, 2)}</motion.span>
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>

                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading || investmentAmount < project.minTicket} className="w-full">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Redirecting to Payment...
                                            </>
                                        ): `Proceed to Payment`}
                                    </Button>
                                </DialogFooter>
                            </form>
                         </Form>
                    </>
                ) : (
                    <>
                        <DialogHeader className="text-center items-center">
                             <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <DialogTitle className="text-2xl">Investment Confirmed!</DialogTitle>
                            <DialogDescription>
                                Your {formatCurrency(investmentAmount, project.currency, 2)} <span className="font-bold">{project.type}</span> investment in {project.title} is complete. A confirmation has been sent to your email.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                Close
                                </Button>
                            </DialogClose>
                             <Button asChild>
                                <Link href="/dashboard/portfolio">View Portfolio</Link>
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function ProjectDetailsClient({ project }: { project: Project }) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const ownerImage = getPlaceholderImage(project.owner.avatarHint);
  const projectImage = getPlaceholderImage(project.imageHint);

  useEffect(() => {
    // This will only run on the client, after hydration
    setTimeRemaining(formatDistanceToNow(new Date(project.endDate), { addSuffix: true }));
    
    if (typeof window !== 'undefined') {
        const eventData = {
            event: 'project_view',
            projectId: project.id,
            category: project.category,
            type: project.type,
        };
        gtm.push(eventData);

        // Track ViewContent event
        if (window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [project.id],
                content_type: 'product', // Use 'product' for e-commerce type events
                value: project.targetAmount,
                currency: project.currency
            });
        }
    }
  }, [project]);

  const percentage = Math.round((project.raisedAmount / project.targetAmount) * 100);

  return (
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link href="/projects" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Projects
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-6">
                <Image src={projectImage.imageUrl} alt={project.title} fill className="object-cover" data-ai-hint={projectImage.imageHint} />
              </div>

              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{project.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{project.category}</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{project.investmentStage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={ownerImage.imageUrl} alt={project.owner.name} data-ai-hint={ownerImage.imageHint} />
                      <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>by {project.owner.name}</span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analysis">Investment Analysis</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6 text-foreground/90 leading-relaxed prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4 font-headline">About the Project</h3>
                  <p>{project.longDescription}</p>
                </TabsContent>
                 <TabsContent value="analysis" className="mt-6">
                    <InvestmentAnalysisTab project={project} />
                 </TabsContent>
                <TabsContent value="financials" className="mt-6">
                   <h3 className="text-xl font-semibold mb-4 font-headline">AI-Generated Projections</h3>
                   <p className="text-sm text-muted-foreground mb-6">The following projections are generated by our AI model based on project inputs and market data. They are for illustrative purposes only.</p>
                   <Card>
                      <CardHeader>
                        <CardTitle>6-Month Revenue &amp; EBITDA Forecast</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                           <RechartsBarChart data={project.financials.projections} accessibilityLayer>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                              <YAxis tickFormatter={(value) => formatCurrency(value as number, project.currency, 0)} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <ChartLegend content={<ChartLegendContent />} />
                              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                              <Bar dataKey="ebitda" fill="var(--color-ebitda)" radius={4} />
                           </RechartsBarChart>
                        </ChartContainer>
                      </CardContent>
                   </Card>
                </TabsContent>
                <TabsContent value="documents" className="mt-6">
                   <h3 className="text-xl font-semibold mb-4 font-headline">Project Documents</h3>
                   <div className="space-y-3">
                    {project.documents.length > 0 ? (
                        project.documents.map(doc => (
                          <a key={doc.name} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-secondary transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <span>{doc.name}</span>
                            </div>
                            <Download className="w-5 h-5 text-muted-foreground" />
                          </a>
                        ))
                    ) : (
                      <p className="text-muted-foreground">No documents have been uploaded yet.</p>
                    )}
                   </div>
                </TabsContent>
                <TabsContent value="qa" className="mt-6">
                   <h3 className="text-xl font-semibold mb-4 font-headline">Questions &amp; Answers</h3>
                   {project.faqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {project.faqs.map((faq, i) => (
                        <AccordionItem value={`item-${i}`} key={i}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                   ) : (
                    <p className="text-muted-foreground">No questions have been answered yet.</p>
                   )}
                </TabsContent>
              </Tabs>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-2xl font-bold">{formatCurrency(project.raisedAmount, project.currency)}</CardTitle>
                    <Badge variant={project.type === 'Equity' ? 'default' : 'secondary'}>{project.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground">raised of {formatCurrency(project.targetAmount, project.currency)} goal</p>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info size={14} className="cursor-pointer text-muted-foreground"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This target includes a 5% platform success fee.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Progress value={percentage} className="h-2 my-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-primary">{percentage}%</span>
                    <span className="text-muted-foreground">{timeRemaining || '...'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                     <div className="flex justify-between">
                       <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" /> Investors</span>
                       <span className="font-semibold">{project.investorCount}</span>
                     </div>
                      {project.type === 'Equity' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Scale className="w-4 h-4" /> Equity Offered</span>
                            <span className="font-semibold">{project.equityOffered}%</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Valuation</span>
                            <span className="font-semibold">{formatCurrency(project.valuation || 0, project.currency)}</span>
                          </div>
                        </>
                      ) : (
                         <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><HandCoins className="w-4 h-4" /> Royalty Rate</span>
                            <span className="font-semibold">{project.royaltyRate}%</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Repayment</span>
                            <span className="font-semibold">{project.repaymentMultiple}x Multiple</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Projected Payback</span>
                            <span className="font-semibold">~18 months</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between border-t pt-4">
                        <span className="text-muted-foreground">Minimum Investment</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(project.minTicket, project.currency)}</span>
                      </div>
                  </div>
                    <InvestDialog project={project}>
                        <Button size="lg" className="w-full mt-6" disabled={percentage >= 100}>
                            {percentage >= 100 ? 'Campaign Funded' : 'Invest Now'}
                        </Button>
                    </InvestDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  );
}
