
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { discoverNiches, type DiscoverNichesOutput } from '@/ai/flows/discover-niches';
import { Loader2, Lightbulb, Target, TrendingUp, Sparkles, HandCoins, Shield, Users } from 'lucide-react';
import { countries } from '@/lib/countries';
import { projectCategories } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { gtm } from '@/lib/gtm';


const formSchema = z.object({
  sector: z.string().min(2, { message: 'Sector is required.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  targetAudience: z.string().optional(),
  businessModel: z.string().optional(),
  capitalAvailable: z.coerce.number().optional(),
});

type NicheIdea = DiscoverNichesOutput['niches'][0];

const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-amber-500';
    return 'bg-red-500';
};
const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Low'; // Inverted for competitiveness
    if (score >= 5) return 'Moderate';
    return 'High';
};
const getSuccessScoreLabel = (score: number) => {
    if (score >= 8) return 'High';
    if (score >= 5) return 'Moderate';
    return 'Low';
};


const NicheCard = ({ niche, rank }: { niche: NicheIdea; rank: number }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-start justify-between">
                <span className="text-xl">
                    <span className="text-3xl font-bold mr-2">{["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣"][rank]}</span>
                    {niche.nicheName}
                </span>
            </CardTitle>
            <CardDescription className="pt-2">{niche.marketGap}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground flex items-center gap-2"><Target /> Competitiveness</span>
                <Badge style={{ backgroundColor: getScoreColor(10 - niche.competitivenessScore)}}>{getScoreLabel(10 - niche.competitivenessScore)}</Badge>
            </div>
             <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground flex items-center gap-2"><TrendingUp /> Success Prospect</span>
                 <Badge style={{ backgroundColor: getScoreColor(niche.successProspectScore)}}>{getSuccessScoreLabel(niche.successProspectScore)}</Badge>
            </div>
        </CardContent>
        <div className="p-6 pt-0">
             <Drawer>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" /> View AI Recommendation
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-2xl">
                    <DrawerHeader>
                        <DrawerTitle>{niche.nicheName}</DrawerTitle>
                        <DrawerDescription>{niche.marketGap}</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0 grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Target Audience</h4>
                                    <p className="text-sm text-muted-foreground">{niche.targetAudience}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Entry Barrier</h4>
                                    <p className="text-sm text-muted-foreground">{niche.entryBarrier}</p>
                                </div>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <HandCoins className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold">Revenue Model</h4>
                                <p className="text-sm text-muted-foreground">{niche.revenueModel}</p>
                            </div>
                        </div>
                    </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    </Card>
)

export default function NicheFinderPage() {
  const [result, setResult] = useState<DiscoverNichesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sector: '',
      location: '',
      targetAudience: '',
      businessModel: 'B2B',
      capitalAvailable: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await discoverNiches(values);
      setResult(response);
      gtm.push({
        event: 'ai_tool_used',
        tool: 'NicheFinder',
      });
    } catch (error) {
      console.error('Error discovering niches:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>AI Market Opportunity Explorer</CardTitle>
            <CardDescription>Discover profitable and high-potential niches within your chosen sector and location.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sector / Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a sector" /></SelectTrigger></FormControl>
                            <SelectContent><SelectContent>{projectCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl>
                            <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Customer (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Construction companies"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="businessModel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Business Model (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="B2B">B2B</SelectItem>
                                <SelectItem value="B2C">B2C</SelectItem>
                                <SelectItem value="SaaS">SaaS</SelectItem>
                                <SelectItem value="Marketplace">Marketplace</SelectItem>
                                <SelectItem value="Franchise">Franchise</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="capitalAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capital Available (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Discover Niches
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        {isLoading && (
            <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Scouting for market opportunities...</p>
                </div>
            </div>
        )}
        {result && (
            <div className="space-y-6">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {result.niches.map((niche, index) => (
                        <NicheCard key={niche.nicheName} niche={niche} rank={index} />
                    ))}
                 </div>
            </div>
        )}
        {!isLoading && !result && (
            <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Your AI-powered niche recommendations will appear here.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
