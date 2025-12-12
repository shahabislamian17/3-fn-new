
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
import { generateReadinessScore, type GenerateReadinessScoreOutput } from '@/ai/flows/generate-readiness-score';
import { Loader2 } from 'lucide-react';
import { countries } from '@/lib/countries';
import { Progress } from '@/components/ui/progress';
import { gtm } from '@/lib/gtm';

const formSchema = z.object({
    sector: z.string().min(2, { message: 'Sector is required.' }),
    location: z.string().min(2, { message: 'Location is required.' }),
    stage: z.string().min(2, { message: 'Stage is required.' }),
    fundingType: z.enum(['Equity', 'Royalty']),
    targetAmount: z.coerce.number().min(1000, 'Target must be at least 1,000.'),
    valuation: z.coerce.number().optional(),
    description: z.string().min(50, 'Please provide a description of at least 50 characters.'),
    competitors: z.string().optional(),
    differentiator: z.string().optional(),
});

const investmentStages = [
    "Concept / Idea Stage",
    "Prototype / MVP Stage",
    "Seed / Validation Stage",
    "Early Growth Stage",
    "Expansion / Scale-Up Stage",
    "Operating / Revenue Stage",
    "Mature / Established Stage",
    "Turnaround / Recovery Stage",
    "Exit / Secondary Opportunity",
];

const getScoreColorClass = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-amber-500';
    return 'bg-red-500';
};

const ScoreCard = ({ score, label }: { score: number, label: string }) => {
    const scoreColorClass = getScoreColorClass(score);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-bold text-4xl">{score.toFixed(1)}<span className="text-xl text-muted-foreground">/10</span></p>
                <Progress value={score * 10} className="h-3 my-3" indicatorClassName={scoreColorClass} />
            </CardContent>
        </Card>
    );
};


const ImprovementStep = ({ step, index }: { step: string; index: number }) => {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {index + 1}
            </div>
            <p className="text-muted-foreground flex-1">{step}</p>
        </div>
    );
};

export default function ReadinessPage() {
  const [assessment, setAssessment] = useState<GenerateReadinessScoreOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sector: 'Technology & Digital Platforms',
      location: 'San Francisco, USA',
      stage: 'Early Growth Stage',
      fundingType: 'Equity',
      targetAmount: 500000,
      valuation: 5000000,
      description: 'Our project is dedicated to revolutionizing the way people interact with technology. By leveraging cutting-edge AI and a user-centric design, we aim to solve a common problem that affects millions daily.',
      competitors: '',
      differentiator: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAssessment(null);
    try {
      const result = await generateReadinessScore(values);
      setAssessment(result);
      gtm.push({
        event: 'ai_tool_used',
        tool: 'Readiness',
      });
    } catch (error) {
      console.error('Error generating readiness score:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>AI Investment Readiness</CardTitle>
            <CardDescription>Get an AI-assessed score for your project's quality, market competitiveness, and potential for success.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="sector" render={({ field }) => (<FormItem><FormLabel>Sector</FormLabel><FormControl><Input placeholder="e.g., Technology" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Investment Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a stage" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {investmentStages.map(stage => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField control={form.control} name="fundingType" render={({ field }) => (<FormItem><FormLabel>Funding Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Equity">Equity</SelectItem><SelectItem value="Royalty">Royalty</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="targetAmount" render={({ field }) => (<FormItem><FormLabel>Funding Target</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="valuation" render={({ field }) => (<FormItem><FormLabel>Valuation (Optional)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="competitors" render={({ field }) => (<FormItem><FormLabel>Known Competitors (Optional)</FormLabel><FormControl><Input placeholder="e.g., Competitor A, Competitor B" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="differentiator" render={({ field }) => (<FormItem><FormLabel>Main Differentiator (Optional)</FormLabel><FormControl><Input placeholder="e.g., Our unique AI algorithm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {assessment ? 'Re-Run Assessment' : 'Run Readiness Assessment'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        {isLoading && (
            <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Analyzing your project data...</p>
                </div>
            </div>
        )}
        {assessment && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <ScoreCard score={assessment.competitivenessScore} label="Competitiveness" />
                    <ScoreCard score={assessment.successScore} label="Prospect of Success" />
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{assessment.summary}</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>AI Improvement Plan</CardTitle>
                        <CardDescription>Actionable steps to improve your readiness scores.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assessment.improvementPlan.map((step, index) => (
                           <ImprovementStep key={index} step={step} index={index} />
                        ))}
                    </CardContent>
                </Card>
            </div>
        )}
        {!isLoading && !assessment && (
            <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <p className="text-muted-foreground">Your readiness assessment will appear here.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
