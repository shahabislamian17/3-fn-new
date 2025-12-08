import Header from "@/components/header";
import Footer from "@/components/footer";
import { HowItWorks } from "@/components/how-it-works";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-card text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">How It Works</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-4">
              A simple, transparent, and secure process for both investors and project owners.
            </p>
          </div>
        </section>
        
        <HowItWorks />

      </main>
      <Footer />
    </div>
  );
}
