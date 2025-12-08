
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
import { Loader2 } from 'lucide-react';
import { countries } from '@/lib/countries';
import { useToast } from '@/hooks/use-toast';
import { projectCategories } from '@/lib/data';

const formSchema = z.object({
  industry: z.string().min(2, { message: 'Industry is required.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  projectDescription: z.string().min(50, { message: 'Please provide a detailed project description of at least 50 characters.' }),
  tone: z.enum(['persuasive', 'neutral', 'conservative']),
});

export default function CreateCampaignPage() {
  const [pitch, setPitch] = useState<GenerateCampaignPitchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: '',
      country: '',
      projectDescription: '',
      tone: 'persuasive',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPitch(null);
    try {
      const result = await generateCampaignPitch(values);
      setPitch(result);
       toast({
        title: 'Pitch Generated Successfully!',
        description: 'Your AI-powered campaign pitch is ready for review.',
      });
    } catch (error) {
      console.error('Error generating campaign pitch:', error);
      toast({
        title: 'Error Generating Pitch',
        description: 'There was an issue creating your pitch. Please try again.',
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
            <CardTitle>Generate Campaign Pitch</CardTitle>
            <CardDescription>Fill in the details below and let our AI create a compelling pitch for your project.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger>
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
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
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
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="conservative">Conservative</SelectItem>
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
                          placeholder="Describe your project, its goals, target market, and unique selling points."
                          className="resize-none"
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Pitch
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>AI-Generated Pitch</CardTitle>
            <CardDescription>Review the short and long-form pitches generated by the AI. You can copy and edit them as needed.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Generating your pitch...</p>
                </div>
              </div>
            )}
            {pitch && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Short Pitch</h3>
                  <div className="p-4 bg-secondary rounded-md prose prose-sm max-w-none">
                     <p>{pitch.shortPitch}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Long-Form Description</h3>
                   <div className="p-4 bg-secondary rounded-md prose max-w-none prose-p:mb-4">
                     {pitch.longPitch.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                   </div>
                </div>
              </div>
            )}
            {!isLoading && !pitch && (
              <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">Your generated pitch will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
