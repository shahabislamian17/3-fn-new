
'use client';

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AIWidget } from "@/components/ai-widget";
import { FeaturedCampaigns } from "@/components/featured-campaigns";
import { HowItWorks } from "@/components/how-it-works";
import { ImpactStats } from "@/components/impact-stats";
import { JoinTheMovement } from "@/components/join-the-movement";
import { Testimonials } from "@/components/testimonials";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { Chatbot } from "@/components/chatbot";
import { WhyChooseUs } from "@/components/why-choose-us";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface LandingData {
  stats: {
    countries: number;
    investedUSD: string;
    projectsFunded: number;
    co2Saved: string;
  };
  testimonials: {
    name: string;
    role: string;
    quote: string;
    imageId: string;
  }[];
}

// --- Main Component ---
export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const firestore = useFirestore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!firestore) return;
      setLoading(true);
      try {
        const projectsQuery = query(collection(firestore, "projects"), where("status", "==", "live"));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        
        // This would also come from an API/DB in a real app
        const landingPageData: LandingData = {
          stats: {
            countries: 15,
            investedUSD: "2.4M",
            projectsFunded: 267,
            co2Saved: "1,250 t",
          },
          testimonials: [
            {
              name: "Amina Yusuf",
              role: "Project Owner, Kenya",
              quote: "3JN Fund didn't just provide capital; their AI tools helped us refine our financial model and pitch, which was invaluable. We secured funding in just 45 days!",
              imageId: "user-avatar-1"
            },
            {
              name: "David Chen",
              role: "Investor, Singapore",
              quote: "As an investor, the platform's transparency and AI-driven risk scores give me the confidence to back projects I believe in. The portfolio management tools are top-notch.",
              imageId: "user-avatar-2"
            },
          ]
        };

        setProjects(projectsData);
        setLandingData(landingPageData);

      } catch (error) {
          console.error("Failed to fetch landing page data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [firestore]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-primary">
                {t("headline", "Invest in the Future You Believe In.")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {t("subtext", "Discover and invest in a diverse range of innovative projects from visionary entrepreneurs worldwide.")}
              </p>
              <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                      <Link href="/projects">
                          {t("explore", "Explore Investment Opportunities")}
                      </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                      <Link href="/dashboard/create-project">
                          {t("launch", "Launch Your Campaign")}
                      </Link>
                  </Button>
              </div>
            </div>
            <div className="hidden lg:block">
               <div className="w-full rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg">
                  <div className="h-64 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 dark:from-blue-700 dark:to-teal-700 overflow-hidden flex items-center justify-center">
                    <div className="text-white text-center px-6">
                      <h3 className="text-3xl font-bold">AI-Powered Funding</h3>
                      <p className="mt-2 text-sm opacity-90">
                        {t("AI-powered forecasting and investor insights")}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
           {/* Mini stats */}
           <div className="container mx-auto px-4 mt-16">
              <Card>
                <CardContent className="p-6">
                   {loading || !landingData ? (
                     <div className="flex justify-center items-center h-12">
                       <Loader2 className="h-6 w-6 animate-spin text-primary" />
                     </div>
                   ) : (
                     <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center text-center">
                        <div className="flex flex-col">
                          <span className="text-3xl font-bold text-primary">🌍 {landingData.stats.countries}</span>
                          <span className="text-sm text-muted-foreground">Countries</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-3xl font-bold text-primary">💰 ${landingData.stats.investedUSD}</span>
                          <span className="text-sm text-muted-foreground">Invested</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-3xl font-bold text-primary">♻️ {landingData.stats.projectsFunded}</span>
                          <span className="text-sm text-muted-foreground">Projects Funded</span>
                        </div>
                      </div>
                   )}
                </CardContent>
              </Card>
           </div>
        </section>
        
        <HowItWorks />
        
        <FeaturedCampaigns projects={projects.slice(0, 3)} />

        <AIWidget />
        
        <WhyChooseUs />

        {/* Learn It Hub */}
        <section id="learn" className="py-20 md:py-24">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">{t("learnIt", "Learn It")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-2 mb-8">{t("Understand the fundamentals of crowdfunding and our unique investment models.")}</p>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-left">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-2">Equity Investing</h4>
                    <p className="text-sm text-muted-foreground mt-2">{t("Become a shareholder in promising startups and share in their long-term success.")}</p>
                  </CardContent>
                </Card>
                <Card className="text-left">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-2">Profit / Revenue Share</h4>
                    <p className="text-sm text-muted-foreground mt-2">{t("Earn passive income as projects generate revenue, with returns paid out periodically.")}</p>
                  </CardContent>
                </Card>
                <Card className="text-left">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-2">AI-Powered Insights</h4>
                    <p className="text-sm text-muted-foreground mt-2">{t("Leverage our AI for financial forecasts, risk analysis, and readiness scores.")}</p>
                  </CardContent>
                </Card>
              </div>
              <Button asChild variant="link" className="mt-8 text-lg">
                <Link href="/learn">{t("Explore Learn It Hub")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
        </section>

        {loading || !landingData ? (
          <section className="py-20 md:py-24">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mx-auto mb-12" />
              <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </section>
        ) : (
          <>
            <ImpactStats stats={landingData.stats} />
            <Testimonials testimonials={landingData.testimonials} />
          </>
        )}

        <JoinTheMovement />

      </main>
      <Footer />
      {user && <Chatbot />}
    </div>
  );
}
