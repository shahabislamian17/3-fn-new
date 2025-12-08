
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ShieldCheck, Bot, Landmark } from 'lucide-react';

const features = [
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: "Verified KYC for all campaigns",
        description: "Every project undergoes a rigorous KYC/KYB and due diligence process before it's listed, ensuring investor safety."
    },
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "AI-backed project scoring",
        description: "Our proprietary AI analyzes project viability, market competitiveness, and risk, providing you with a clear, data-driven score."
    },
    {
        icon: <Landmark className="h-8 w-8 text-primary" />,
        title: "Secure Escrow & Regulatory Compliance",
        description: "We use escrow services for fund security and adhere to strict regulatory standards to protect all parties."
    }
]

export function WhyChooseUs() {
    return (
        <section className="py-20 md:py-24 bg-card">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Trust & Transparency First</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mt-2">Every investment is vetted, monitored, and transparently reported — ensuring safety and growth.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map(feature => (
                        <Card key={feature.title} className="text-center">
                            <CardHeader className="items-center">
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    {feature.icon}
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
