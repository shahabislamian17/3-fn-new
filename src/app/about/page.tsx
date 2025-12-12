import Header from "@/components/header";
import Footer from "@/components/footer";
import { MissionStatement } from "@/components/mission-statement";
import { TeamSection } from "@/components/team-section";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-primary">
              Powering the Next Generation of Innovation
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              3JN CrowdFunding is a global crowdfunding platform dedicated to bridging the gap between visionary entrepreneurs and forward-thinking investors.
            </p>
          </div>
        </section>

        <MissionStatement />
        
        <TeamSection />

      </main>
      <Footer />
    </div>
  );
}
