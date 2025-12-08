
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ownerFeatures = [
    "AI-powered pitch & financial modeling",
    "Secure document hosting & versioning",
    "Investor relations dashboard",
    "Global investor network access",
];

const investorFeatures = [
    "Access to curated deal flow",
    "AI-powered investment analysis tools",
    "Diversified portfolio management",
    "Secure e-wallet & transaction ledger",
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-card text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Transparent & Simple Pricing</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Focus on what matters most—your project or your portfolio. Our fee structure is designed for clarity and fairness, with no hidden costs.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <Card className="border-primary border-2">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">For Project Owners</CardTitle>
                            <CardDescription>A success-based model. We only win when you win.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-4xl font-bold">
                                5% <span className="text-lg font-normal text-muted-foreground">of funds raised</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We charge a platform success fee only if your campaign reaches its funding goal. There are no upfront listing fees.
                            </p>
                            <ul className="space-y-3">
                                {ownerFeatures.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                             <Button asChild size="lg" className="w-full">
                                <Link href="/signup">Start Your Campaign</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">For Investors</CardTitle>
                            <CardDescription>Invest in the future with a minimal transaction cost.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="text-4xl font-bold">
                                2% <span className="text-lg font-normal text-muted-foreground">transaction fee</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                A small fee is applied to each investment to cover payment processing and platform maintenance. There are no subscription costs.
                            </p>
                            <ul className="space-y-3">
                                {investorFeatures.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" variant="outline" className="w-full">
                                <Link href="/projects">Explore Projects</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                 <div className="text-center mt-16">
                    <p className="text-muted-foreground">
                        Other fees such as royalty servicing and withdrawal fees may apply. 
                        <Link href="/fee-policy" className="text-primary underline ml-1">
                            Learn more about our fee policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
