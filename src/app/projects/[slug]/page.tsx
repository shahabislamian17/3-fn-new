
'use server';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ProjectDetailsClient } from '@/components/project-details-client';
import type { Project } from '@/lib/types';
import { getProjectBySlug } from '@/services/project';
import { initializeFirebase } from '@/firebase';
import { generateSeoMetadata } from '@/ai/flows/generate-seo-metadata';
import type { Metadata } from 'next';
import { getPlaceholderImage } from '@/lib/assets/placeholder-images';

type Props = {
  params: Promise<{ slug: string }>
}

async function getProject(slug: string): Promise<Project | null> {
    const { firebaseApp } = initializeFirebase();
    const firestore = (await import('firebase/firestore')).getFirestore(firebaseApp);
    return getProjectBySlug(firestore, slug);
}


export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: 'Project Not Found | 3JN Fund',
    }
  }

  const projectImage = getPlaceholderImage(project.imageHint);

  try {
    const aiSEO = await generateSeoMetadata({
      title: project.title,
      category: project.category,
      country: project.location,
      fundingType: project.type,
      summary: project.shortDescription
    });

    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://3jncrowdfunding.com'}/projects/${project.slug}`;

    return {
      title: aiSEO.meta_title,
      description: aiSEO.meta_description,
      keywords: aiSEO.keywords,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: aiSEO.og_title,
        description: aiSEO.og_description,
        url: url,
        images: [
          {
            url: projectImage.imageUrl,
            width: 1200,
            height: 630,
            alt: aiSEO.og_title,
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: aiSEO.twitter_title,
        description: aiSEO.twitter_description,
        images: [projectImage.imageUrl],
      },
    }
  } catch (error) {
    console.error("AI SEO generation failed, using fallback.", error);
     return {
      title: `${project.title} | 3JN Fund`,
      description: project.shortDescription,
    }
  }
}

// This is now a Server Component
export default async function ProjectDetailsPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }
  
  const projectImage = getPlaceholderImage(project.imageHint);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': project.title,
    'image': projectImage.imageUrl,
    'description': project.longDescription,
    'brand': {
        '@type': 'Brand',
        'name': project.owner.name,
    },
    'offers': {
        '@type': 'Offer',
        'url': `https://3jncrowdfunding.com/projects/${project.slug}`,
        'priceCurrency': project.currency,
        'price': project.targetAmount,
        'availability': 'https://schema.org/InStock',
        'itemCondition': 'https://schema.org/NewCondition'
    },
    'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'reviewCount': project.investorCount
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        <ProjectDetailsClient project={project} />
        <Footer />
      </div>
    </>
  );
}
