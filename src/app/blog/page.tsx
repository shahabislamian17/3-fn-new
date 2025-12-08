
'use client'

import { useState } from 'react';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from '@/lib/types';

export default function BlogPage() {
    const [publishedPosts, setPublishedPosts] = useState<BlogPost[]>([]);
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-card text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">3JN CrowdFunding Blog</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4">
              Insights on crowdfunding, investment strategies, and success stories from our community. Powered by our AI content engine.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-24">
            <div className="container mx-auto px-4">
                {publishedPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedPosts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                                <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <CardHeader className="p-0">
                                    <div className="relative h-48 w-full">
                                        <Image
                                        src={post.hero_image_url}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={post.hero_image_hint}
                                        />
                                    </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 flex-grow">
                                        <Badge variant="secondary" className="mb-2">{post.primary_keyword}</Badge>
                                        <CardTitle className="text-xl font-bold font-headline mb-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                                        <CardDescription>{post.excerpt}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
                                        <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
                                            Read More <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-lg">
                      <h3 className="text-xl font-semibold">No Posts Found</h3>
                      <p className="text-muted-foreground mt-2">Check back soon for insights and updates from our team.</p>
                    </div>
                )}
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
