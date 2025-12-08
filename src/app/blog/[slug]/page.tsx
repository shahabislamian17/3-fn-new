'use client'

import { useParams, notFound } from 'next/navigation';
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import type { BlogPost } from '@/lib/types';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    // In a real app, you would fetch this post from a database or API
    // For now, since mock data is removed, we'll simulate a not found state.
    setPost(null);
  }, [slug]);

  if (post === undefined) {
    // Loading state
    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow py-12 md:py-20">
            <div className="container mx-auto px-4 prose lg:prose-xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                    <div className="h-96 bg-muted rounded-lg"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-4/6"></div>
                    </div>
                </div>
            </div>
          </main>
          <Footer />
        </div>
    );
  }

  if (!post) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12 md:py-20">
        <article className="container mx-auto px-4 prose lg:prose-xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-headline !mb-4">{post.title}</h1>
                <p className="text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4 text-sm text-muted-foreground">
                    <span>Published on {post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
            </div>
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-8">
                <Image
                    src={post.hero_image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    data-ai-hint={post.hero_image_hint}
                />
            </div>
            
            <ReactMarkdown
                components={{
                    h1: ({node: _, ...props}) => <h1 className="text-3xl font-bold font-headline mt-8 mb-4" {...props} />,
                    h2: ({node: _, ...props}) => <h2 className="text-2xl font-bold font-headline mt-6 mb-3" {...props} />,
                    h3: ({node: _, ...props}) => <h3 className="text-xl font-bold font-headline mt-4 mb-2" {...props} />,
                    p: ({node: _, ...props}) => <p className="leading-relaxed" {...props} />,
                    a: ({node: _, ...props}) => <a className="text-primary hover:underline" {...props} />,
                    ul: ({node: _, ...props}) => <ul className="list-disc pl-5 space-y-2" {...props} />,
                    ol: ({node: _, ...props}) => <ol className="list-decimal pl-5 space-y-2" {...props} />,
                }}
            >
                {post.content_markdown}
            </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}

// In a real app with a DB, you'd use generateStaticParams to build all blog post pages at build time.
// export async function generateStaticParams() {
//   const posts = await fetch('...').then((res) => res.json())
//   return posts.map((post) => ({
//     slug: post.slug,
//   }))
// }
