
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-card text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Get in Touch</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              We're here to help. Reach out to us with any questions or inquiries.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="items-center text-center">
                  <div className="bg-primary/10 rounded-full p-4 mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Our Address</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>3JN CrowdFunding C/S GPS Smart</p>
                  <p>Av du port N°17 immeuble SNCC, 1ère Niveau</p>
                  <p>Kinshasa-Commune de la Gombe</p>
                  <p>RD. Congo</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center text-center">
                  <div className="bg-primary/10 rounded-full p-4 mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Email Us</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <a href="mailto:info@3jncrowdfunding.com" className="hover:text-primary">
                    info@3jncrowdfunding.com
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center text-center">
                   <div className="bg-primary/10 rounded-full p-4 mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Call Us</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground space-y-1">
                  <p>
                    <a href="tel:+447493216101" className="hover:text-primary">
                      +44 (0) 7493216101
                    </a>
                  </p>
                  <p>
                    <a href="tel:+243818112309" className="hover:text-primary">
                      +243 (0) 818112309
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
