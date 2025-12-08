
'use client';

import { FilePen, Search, Lightbulb, TrendingUp, Handshake, HandCoins, User, CheckSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ownerSteps = [
    { 
        icon: <FilePen className="h-8 w-8" />, 
        title: "1. Create your project", 
        description: "Build your project page with our intuitive step-by-step guide.",
        tooltip: "Our wizard helps you define your project, terms, and story."
    },
    { 
        icon: <CheckSquare className="h-8 w-8" />, 
        title: "2. Choose funding type (Equity / Profit)", 
        description: "Select the investment model that best suits your business goals.",
        tooltip: "Decide whether to offer shares or a percentage of future revenue."
    },
    { 
        icon: <Lightbulb className="h-8 w-8" />, 
        title: "3. AI validates and enhances your pitch", 
        description: "Our AI analyzes your campaign for readiness and suggests improvements.",
        tooltip: "AI-powered validation ensures campaign readiness and competitiveness."
    },
    { 
        icon: <TrendingUp className="h-8 w-8" />, 
        title: "4. Launch campaign & attract backers", 
        description: "Go live to our global network of investors and track your progress.",
        tooltip: "Receive funds and manage investor relations through your dashboard."
    },
];

const investorSteps = [
    { 
        icon: <Search className="h-8 w-8" />, 
        title: "1. Browse opportunities", 
        description: "Discover and analyze curated projects using our powerful filters.",
        tooltip: "Our platform provides detailed analytics for every project."
    },
    { 
        icon: <User className="h-8 w-8" />, 
        title: "2. Select preferred investment model", 
        description: "Choose between gaining equity or receiving a share of project revenue.",
        tooltip: "Invest based on your risk appetite and financial goals."
    },
    { 
        icon: <HandCoins className="h-8 w-8" />, 
        title: "3. AI recommends tailored projects", 
        description: "Get personalized suggestions that match your investment profile.",
        tooltip: "Our AI matches your goals with the most promising opportunities."
    },
    { 
        icon: <Handshake className="h-8 w-8" />, 
        title: "4. Track ROI, receive payouts", 
        description: "Monitor your portfolio's performance and get returns paid to your account.",
        tooltip: "All investments and returns are tracked on your personal dashboard."
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
