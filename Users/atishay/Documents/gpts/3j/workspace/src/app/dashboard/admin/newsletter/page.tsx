
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
import { Loader2, Send, Eye, AlertCircle, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { previewNewsletter, sendNewsletter, type NewsletterRequest } from '@/lib/api-frontend-services';

// --- Main Component ---

const newsletterSchema = z.object({
  audience: z.enum(['all_users', 'investors', 'project_owners', 'filtered_users']),
  topic: z.string().min(3, 'Topic is required.'),
  subject: z.string().optional(),
  message: z.string().min(20, 'Message body must be at least 20 characters.'),
  ctaUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  ctaLabel: z.string().optional(),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function AdminNewslettersPage() {
  const { user, loading: userLoading } = useAuth();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { toast } = useToast();

  const appUser = user as AppUser | null;
  const isAdmin = appUser?.role === 'Admin' || appUser?.role === 'SuperAdmin';

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      audience: "investors",
      topic: "",
      subject: "",
      message: "",
      ctaUrl: "",
      ctaLabel: "",
    },
  });

  const handlePreview = async (values: NewsletterFormValues) => {
    setError(null);
    setSuccessMsg(null);
    setPreviewing(true);
    try {
      const res = await previewNewsletter(values);
      setPreviewHtml(res.html);
      if (!form.getValues('subject')) {
        form.setValue('subject', res.subject);
      }
      toast({ title: 'Preview Generated' });
    } catch (err: any) {
      setError(err.message ?? "Preview failed");
      toast({ title: 'Error', description: err.message, variant: 'destructive'});
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async (values: NewsletterFormValues) => {
    setError(null);
    setSuccessMsg(null);
    setSending(true);
    toast({ title: "Sending Newsletter...", description: "Your message is being queued." });
    try {
      const res = await sendNewsletter(values);
      setSuccessMsg(`Newsletter queued with ID ${res.id}`);
      toast({ title: "Newsletter Queued!", description: "Your newsletter will be sent shortly."});
      form.reset();
      setPreviewHtml(null);
    } catch (err: any) {
      setError(err.message ?? "Send failed");
       toast({ title: 'Error', description: err.message, variant: 'destructive'});
    } finally {
      setSending(false);
    }
  };
  
  if (userLoading) {
    return <div className="p-6"><Loader2 className="animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You do not have permission to access the newsletter composer.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Newsletter Composer</CardTitle>
              <CardDescription>Create and send targeted email communications.</CardDescription>
            </div>
             <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/admin/newsletter/history"><History className="mr-2 h-4 w-4" /> History</Link>
             </Button>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                 <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="investors">Investors</SelectItem>
                          <SelectItem value="project_owners">Project Owners</SelectItem>
                          <SelectItem value="filtered_users" disabled>Filtered Users (coming soon)</SelectItem>
                           {appUser?.role === 'SuperAdmin' && <SelectItem value="all_users">All Users</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="topic" render={({ field }) => (<FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="New features, compliance update..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Subject (Optional)</FormLabel><FormControl><Input placeholder="AI will generate this if left blank" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="message" render={({ field }) => (<FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="The main content of your email..." rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="ctaUrl" render={({ field }) => (<FormItem><FormLabel>CTA Button URL (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="ctaLabel" render={({ field }) => (<FormItem><FormLabel>CTA Button Text (Optional)</FormLabel><FormControl><Input placeholder="e.g., Learn More" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <div className="flex gap-4">
                     <Button type="button" variant="outline" onClick={form.handleSubmit(handlePreview)} disabled={previewing || sending}>
                      {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                      Preview
                    </Button>
                     <Button type="button" onClick={form.handleSubmit(handleSend)} disabled={sending || previewing}>
                      {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Send Newsletter
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>This is how the email will appear to users.</CardDescription>
          </CardHeader>
          <CardContent>
            {(error || successMsg) && (
                <Alert variant={error ? 'destructive' : 'default'} className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{error ? 'Error' : 'Success'}</AlertTitle>
                    <AlertDescription>{error || successMsg}</AlertDescription>
                </Alert>
            )}
            {previewing && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
            {!previewing && !previewHtml && <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">Generate a preview to see it here.</div>}
            {previewHtml && (
              <div
                className="border rounded-lg overflow-auto max-h-[600px] bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
