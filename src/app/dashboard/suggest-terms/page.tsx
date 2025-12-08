
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { suggestFundingTerms, type SuggestFundingTermsOutput } from '@/ai/flows/suggest-funding-terms';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { useToast } from '@/hooks/use-toast';
import { projectCategories } from '@/lib/data';
import { gtm } from '@/lib/gtm';

const formSchema = z.object({
  sector: z.string().min(2, { message: 'Sector is required.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  projectDescription: z.string().min(50, { message: 'Please provide a detailed project description of at least 50 characters.' }),
});

export default function SuggestTermsPage() {
  const [suggestedTerms, setSuggestedTerms] = useState<SuggestFundingTermsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sector: '',
      location: '',
      projectDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestedTerms(null);
    try {
      const result = await suggestFundingTerms(values);
      setSuggestedTerms(result);
      toast({
        title: 'Terms Suggested',
        description: 'AI-powered term suggestions are ready for review.',
      });
      gtm.push({
        event: 'ai_tool_used',
        tool: 'SuggestTerms',
      });
    } catch (error) {
      console.error('Error suggesting funding terms:', error);
       toast({
        title: 'Error Suggesting Terms',
        description: 'There was an issue generating terms. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Suggest Funding Terms</CardTitle>
            <CardDescription>Get AI-powered suggestions for your campaign's financial terms.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger><SelectValue placeholder="Select a sector" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
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
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe your project."
                          className="resize-none"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Suggest Terms
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>AI-Suggested Terms</CardTitle>
            <CardDescription>Review the suggested terms. These are based on market data and should be used as a starting point.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Analyzing your project...</p>
                </div>
              </div>
            )}
            {suggestedTerms && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Funding Ask</CardDescription>
                      <CardTitle className="text-2xl">{suggestedTerms.fundingAsk}</CardTitle>
                    </CardHeader>
                  </Card>
                   <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Equity Offered</CardDescription>
                      <CardTitle className="text-2xl">{suggestedTerms.equityPercentage}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Royalty Terms</CardDescription>
                      <CardTitle className="text-base">{suggestedTerms.royaltyTerms}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reasoning</h3>
                  <div className="p-4 bg-secondary rounded-md prose prose-sm max-w-none">
                     <p>{suggestedTerms.reasoning}</p>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !suggestedTerms && (
              <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">Your suggested terms will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
