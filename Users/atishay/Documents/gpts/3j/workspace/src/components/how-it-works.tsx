
'use client';

import { FilePen, Search, Lightbulb, TrendingUp, Handshake, HandCoins, User, CheckSquare, ShieldCheck, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ownerSteps = [
    { 
        icon: <FilePen className="h-8 w-8" />, 
        title: "1. Create Your Campaign", 
        description: "Build your project page and generate a pitch using our AI-powered tools.",
        tooltip: "Our wizard helps you define your project, terms, and story, with AI assistance."
    },
    { 
        icon: <Bot className="h-8 w-8" />, 
        title: "2. Submit for AI & Compliance Review", 
        description: "Your campaign is automatically scored for readiness and checked against compliance rules.",
        tooltip: "Our AI engine provides a readiness score and flags potential issues before you go live."
    },
    { 
        icon: <TrendingUp className="h-8 w-8" />, 
        title: "3. Launch & Attract Backers", 
        description: "Go live to our global network of investors and track your progress in real-time.",
        tooltip: "Once approved, your campaign is visible to all investors on the platform."
    },
    { 
        icon: <CheckSquare className="h-8 w-8" />, 
        title: "4. Automate Post-Funding Workflow", 
        description: "Once funded, our system auto-generates legal docs and marketing plans.",
        tooltip: "Receive AI-generated investor agreements and a go-to-market strategy."
    },
];

const investorSteps = [
    { 
        icon: <Search className="h-8 w-8" />, 
        title: "1. Discover Vetted Opportunities", 
        description: "Browse projects that have passed our automated compliance and readiness checks.",
        tooltip: "Every project is pre-screened for completeness and basic compliance."
    },
    { 
        icon: <Lightbulb className="h-8 w-8" />, 
        title: "2. Get AI-Powered Insights", 
        description: "Use our AI tools to analyze investment scenarios and assess risk profiles.",
        tooltip: "Our AI helps you understand potential returns and risks for each investment."
    },
    { 
        icon: <HandCoins className="h-8 w-8" />, 
        title: "3. Invest Securely", 
        description: "Complete your KYC and invest using our secure payment gateway powered by Stripe.",
        tooltip: "Your funds are held securely until the project meets its funding goal."
    },
    { 
        icon: <Handshake className="h-8 w-8" />, 
        title: "4. Track ROI & Receive Payouts", 
        description: "Monitor your portfolio's performance and receive returns directly to your account.",
        tooltip: "All investments, returns, and legal documents are tracked on your dashboard."
    },
];

export function HowItWorks() {
    return (
        <section className="py-20 md:py-24">
            <TooltipProvider>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">A Simple Path to Impact and Growth</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">Whether you're raising capital or investing in the future, our process is transparent, secure, and AI-assisted.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold font-headline mb-8 text-center">For Project Owners</h3>
                            <div className="space-y-8">
                                {ownerSteps.map((step) => (
                                    <Tooltip key={step.title}>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-start gap-4 transition-all duration-300 hover:bg-card rounded-lg p-3 -m-3">
                                                <div className="bg-primary/10 text-primary rounded-full p-3 mt-1">{step.icon}</div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{step.title}</h4>
                                                    <p className="text-muted-foreground text-sm">{step.description}</p>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{step.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold font-headline mb-8 text-center">For Investors</h3>
                            <div className="space-y-8">
                                {investorSteps.map((step) => (
                                     <Tooltip key={step.title}>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-start gap-4 transition-all duration-300 hover:bg-card rounded-lg p-3 -m-3">
                                                <div className="bg-secondary text-secondary-foreground rounded-full p-3 mt-1">{step.icon}</div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{step.title}</h4>
                                                    <p className="text-muted-foreground text-sm">{step.description}</p>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{step.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </section>
    );
}
