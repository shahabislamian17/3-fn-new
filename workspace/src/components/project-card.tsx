
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Tag, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/assets/placeholder-images';

type ProjectCardProps = {
  project: Project & { riskScore?: number };
};

const getRiskScoreClass = (score?: number) => {
    if (score === undefined) return '';
    if (score >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      setTimeRemaining(formatDistanceToNow(new Date(project.endDate), { addSuffix: true }));
    }
  }, [project.endDate]);

  const percentage = Math.round((project.raisedAmount / project.targetAmount) * 100);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const image = getPlaceholderImage(project.imageHint);

  return (
    <Link href={`/projects/${project.slug}`} className="group h-full flex">
        <Card className="h-full w-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0">
            <div className="relative h-48 w-full">
                <Image
                src={image.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                />
                <Badge variant={project.type === 'Equity' ? 'default' : 'secondary'} className="absolute top-2 right-2">{project.type}</Badge>
                {project.riskScore && (
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "absolute top-2 left-2 bg-background/80 backdrop-blur-sm",
                            getRiskScoreClass(project.riskScore)
                        )}
                    >
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        AI Score: {project.riskScore}/10
                    </Badge>
                )}
            </div>
            </CardHeader>
            <CardContent className="pt-6 flex-grow">
            <CardTitle className="text-xl font-bold font-headline mb-2 group-hover:text-primary transition-colors">{project.title}</CardTitle>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.shortDescription}</p>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{project.category}</span>
                </div>
                <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
                </div>
            </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start pt-4 mt-auto">
            <div className="w-full">
                <Progress value={percentage} className="h-2 mb-2" />
                <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">{percentage}%</span>
                <span className="font-bold">{formatCurrency(project.raisedAmount, project.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>funded</span>
                <span>of {formatCurrency(project.targetAmount, project.currency)}</span>
                </div>
            </div>
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground mt-4 pt-2 border-t">
                <span>{project.investorCount} investors</span>
                <span>{timeRemaining || '...'}</span>
            </div>
            </CardFooter>
      </Card>
    </Link>
  );
}
