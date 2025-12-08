import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlaceholderImage } from "@/lib/assets/placeholder-images";

const teamMembers = [
  {
    name: "Jane Doe",
    role: "Founder & CEO",
    imageId: "team-member-1",
    bio: "Visionary leader with 15+ years in fintech and investment banking. Passionate about democratizing access to capital.",
  },
  {
    name: "John Smith",
    role: "Chief Technology Officer",
    imageId: "team-member-2",
    bio: "AI and blockchain expert who architects our secure and intelligent platform. Formerly at a major tech giant.",
  },
  {
    name: "Emily White",
    role: "Head of Compliance",
    imageId: "team-member-3",
    bio: "Certified AML specialist ensuring the platform meets the highest standards of regulatory compliance and security.",
  },
];

export function TeamSection() {
    return (
        <section className="py-20 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Meet the Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-2">The experienced professionals dedicated to building the future of funding.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => {
                const image = getPlaceholderImage(member.imageId);
                return (
                    <Card key={member.name} className="text-center">
                    <CardHeader className="items-center">
                        <Image
                        src={image.imageUrl}
                        alt={member.name}
                        width={120}
                        height={120}
                        className="rounded-full mb-4 object-cover"
                        data-ai-hint={image.imageHint}
                        />
                        <CardTitle className="text-xl">{member.name}</CardTitle>
                        <p className="text-primary font-semibold">{member.role}</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">{member.bio}</p>
                    </CardContent>
                    </Card>
                )
              })}
            </div>
          </div>
        </section>
    );
}
