'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/lib/types';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { projectCategories as categoryOptionsData } from '@/lib/data';
import { MultiSelect } from '@/components/ui/multi-select';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicProjects } from '@/lib/api-frontend-services';

const investmentStages = [
    "Concept / Idea Stage",
    "Prototype / MVP Stage",
    "Seed / Validation Stage",
    "Early Growth Stage",
    "Expansion / Scale-Up Stage",
    "Operating / Revenue Stage",
    "Mature / Established Stage",
    "Turnaround / Recovery Stage",
    "Exit / Secondary Opportunity",
];


export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [stage, setStage] = useState('all');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
        setLoading(true);
        try {
            const data = await getPublicProjects();
            setAllProjects(data || []);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    }
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);

    return allProjects.filter((project) => {
      const isCategoryMatch = categories.length === 0 || categories.some(cat => project.category.includes(cat));
      const isTypeMatch = type === 'all' || project.type === type;
      const isStageMatch = stage === 'all' || project.investmentStage === stage;
      const isSearchMatch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
      const isMinMatch = !min || project.targetAmount >= min;
      const isMaxMatch = !max || project.targetAmount <= max;

      return isCategoryMatch && isTypeMatch && isStageMatch && isSearchMatch && isMinMatch && isMaxMatch;
    });
  }, [allProjects, searchTerm, categories, type, stage, minAmount, maxAmount]);

  const categoryOptions = useMemo(() => {
    return categoryOptionsData.map(cat => ({ label: cat, value: cat }));
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Explore Opportunities</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
              Find the next big thing. Filter by category and investment type to discover projects that match your interests.
            </p>
          </div>

          <div className="grid gap-4 mb-8 p-4 bg-card border rounded-lg md:grid-cols-2 lg:grid-cols-3">
            <div className="relative flex-grow lg:col-span-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or keyword..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="lg:col-span-3">
              <MultiSelect
                options={categoryOptions}
                selected={categories}
                onChange={setCategories}
                placeholder="Filter by categories..."
                className="w-full"
              />
            </div>
            <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {investmentStages.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Royalty">Royalty</SelectItem>
                </SelectContent>
            </Select>
            <Input
                type="number"
                placeholder="Min Amount"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
            />
            <Input
                type="number"
                placeholder="Max Amount"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>

          {loading ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[450px]" />)}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-lg">
              <h3 className="text-xl font-semibold">No Projects Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}