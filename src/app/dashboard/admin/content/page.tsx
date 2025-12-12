
'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Eye, Edit, Loader2, Send, CloudOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { generateBlogPost } from '@/ai/flows/generate-blog-post';
import type { BlogPost } from '@/lib/types';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';


const TOPIC_BUCKETS = [
    "equity crowdfunding for African startups",
    "royalty-based crowdfunding explained",
    "how small investors can diversify with 3JN Fund",
    "DRC and African SME funding gaps and opportunities",
    "beginner’s guide to profit-share investing"
];

const generateFormSchema = z.object({
  topic: z.string().min(1, "Please select a topic."),
  language: z.enum(['en', 'fr', 'es']),
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;


export default function ContentManagementPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      topic: TOPIC_BUCKETS[0],
      language: 'en',
    },
  });

  async function handleGeneratePost(data: GenerateFormValues) {
    setIsGenerating(true);
    toast({ title: "Generating Article...", description: "The AI is crafting a new blog post. This may take a moment." });
    try {
        const result = await generateBlogPost(data);
        const newPost: BlogPost = {
            id: nanoid(),
            slug: slugify(result.title, { lower: true, strict: true }),
            ...result,
            keywords: result.primary_keyword ? [result.primary_keyword, ...result.secondary_keywords] : result.secondary_keywords,
            hero_image_url: 'https://picsum.photos/seed/new-post/600/400',
            hero_image_hint: 'blog abstract',
            status: 'draft',
            language: data.language,
            canonical_url: `/blog/${slugify(result.title, { lower: true, strict: true })}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        setBlogPosts(prev => [newPost, ...prev]);
        toast({ title: "Article Generated!", description: `Draft for "${result.title}" has been created.` });
        setIsGenerateDialogOpen(false);
        form.reset();
    } catch(err) {
        console.error(err);
        toast({ title: "Generation Failed", description: "The AI failed to generate an article. Please try again.", variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  }

  function handleStatusChange(postId: string, newStatus: 'published' | 'draft') {
    setBlogPosts(posts => posts.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                status: newStatus,
                published_at: newStatus === 'published' ? new Date().toISOString() : p.published_at
            }
        }
        return p;
    }));
    toast({ title: "Post Status Updated", description: `The post has been ${newStatus}.` });
  }
  
   function handleDeletePost(postId: string) {
    setBlogPosts(posts => posts.filter(p => p.id !== postId));
    toast({
        variant: 'destructive',
        title: 'Post Deleted',
        description: `The blog post has been permanently removed.`,
    });
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>AI Content Engine</CardTitle>
          <CardDescription>
            Generate, manage, and publish SEO-optimized blog content.
          </CardDescription>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1">
              <PlusCircle className="h-4 w-4" />
              Generate New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New SEO Article</DialogTitle>
              <DialogDescription>
                Select a topic and language, and let the AI do the writing.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGeneratePost)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {TOPIC_BUCKETS.map((topic) => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                           <SelectItem value="en">English</SelectItem>
                           <SelectItem value="fr">French</SelectItem>
                           <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell><Badge variant="outline">{post.language.toUpperCase()}</Badge></TableCell>
                <TableCell>
                   <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="capitalize">{post.status}</Badge>
                </TableCell>
                 <TableCell className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DialogTrigger asChild>
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        {post.status === 'draft' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'published')}>
                                <Send className="mr-2 h-4 w-4" />Publish
                            </DropdownMenuItem>
                        ) : (
                             <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'draft')}>
                                <CloudOff className="mr-2 h-4 w-4" />Unpublish
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the post "{post.title}". This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        </DropdownMenuContent>
                    </DropdownMenu>
                     <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{post.title}</DialogTitle>
                            <DialogDescription>{post.excerpt}</DialogDescription>
                        </DialogHeader>
                         <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto p-1 mt-4">
                           <ReactMarkdown>{post.content_markdown}</ReactMarkdown>
                         </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {blogPosts.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No blog posts have been generated yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
