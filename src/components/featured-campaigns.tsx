
'use client';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/lib/types';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function FeaturedCampaigns({ projects }: { projects: Project[] }) {
    const { t } = useTranslation();
    const loading = !projects || projects.length === 0;

    return (
        <section id="explore" className="py-20 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">{t('Featured Campaigns')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{t('AI-powered recommendations showcasing opportunities with high growth potential.')}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[450px] bg-muted rounded-lg animate-pulse" />)
              ) : (
                projects?.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="link" className="text-lg">
                <Link href="/projects">{t('View all projects')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
    )
}
