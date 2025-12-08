import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Globe, BrainCircuit } from "lucide-react";

const principles = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Democratize Access",
      description: "We believe great ideas can come from anywhere. Our platform breaks down geographical and financial barriers, giving entrepreneurs worldwide a fair chance to secure funding and investors access to a global deal flow.",
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: "AI-Powered Diligence",
      description: "Leveraging cutting-edge AI, we provide data-driven insights, financial projections, and risk assessments. This empowers our investors to make informed decisions with confidence and helps owners present their most compelling case.",
    },
    {
      icon: <Landmark className="h-8 w-8 text-primary" />,
      title: "Build with Trust",
      description: "Security and transparency are the cornerstones of 3JN CrowdFunding. With robust KYC/AML protocols, escrow services, and clear legal frameworks, we've built a secure environment for all participants.",
    },
];

export function MissionStatement() {
    return (
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Our Mission</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-2">To connect capital with innovation through a transparent, intelligent, and globally accessible investment ecosystem.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {principles.map((principle) => (
                <Card key={principle.title} className="text-center">
                    <CardHeader className="items-center">
                        <div className="bg-primary/10 rounded-full p-4 mb-4">
                            {principle.icon}
                        </div>
                        <CardTitle>{principle.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{principle.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
    )
}
