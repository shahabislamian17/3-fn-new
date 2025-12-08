
'use client';

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This will only run on the client, after hydration
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="prose max-w-none">
          <h1 className="text-4xl font-bold font-headline mb-8">Terms of Service</h1>

          <p><strong>Last Updated:</strong> {lastUpdated || '...'}</p>

          <p>
            Welcome to 3JN CrowdFunding. These Terms of Service ("Terms") govern your use of our website, platform, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">1. User Eligibility</h2>
          <p>
            You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you have the legal capacity to enter into a binding contract.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">2. Account Registration</h2>
          <p>
            To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">3. Platform Fees</h2>
            <p>
                By using our Services, you agree to our platform fee structure as outlined in our <a href="/fee-policy" className="text-primary hover:underline">Fee Policy</a>. Platform success fees for Project Owners (5%) and transaction processing fees for Investors (2%) are automatically applied to maintain transparency and operational sustainability.
            </p>

          <h2 className="text-2xl font-bold font-headline mt-8">4. Investment Risks</h2>
          <p>
            Investing in early-stage companies and projects listed on 3JN CrowdFunding involves significant risk, including the potential for partial or total loss of your investment. Please read our full <a href="/risks" className="text-primary hover:underline">Risk Disclosure</a> statement before making any investment. 3JN CrowdFunding is not a registered broker-dealer and does not provide investment advice. All investment decisions are made at your own risk.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">5. For Project Owners</h2>
          <p>
            If you create a fundraising campaign, you agree to provide truthful and accurate information about your project. You are solely responsible for fulfilling the promises made in your campaign. You also agree to comply with all applicable laws and regulations regarding your campaign. As part of our service, upon successful funding, legal and marketing documents may be automatically generated based on the information you provide. You are responsible for reviewing these documents for accuracy.
          </p>
          
          <h2 className="text-2xl font-bold font-headline mt-8">6. Automated Document Generation and AI Content</h2>
          <p>
            Our platform uses artificial intelligence ("AI") to generate content such as financial projections, marketing pitches, and draft legal documents. This content is provided for informational and illustrative purposes. While we strive for accuracy, 3JN CrowdFunding makes no warranties about the reliability or completeness of AI-generated content. You are responsible for independently verifying all information. All prompts and responses are stored for audit purposes. <strong>AI-generated legal documents are not a substitute for professional legal advice. You must consult with licensed counsel before using or signing any automatically generated legal agreements.</strong>
          </p>
          
          <h2 className="text-2xl font-bold font-headline mt-8">7. Electronic Signatures</h2>
          <p>
            The platform integrates with third-party e-signature providers to facilitate the signing of legal agreements. By using this feature, you agree to be bound by the terms of our e-sign provider and acknowledge that electronic signatures are legally binding. All signature events are logged for auditing purposes.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">8. Disclaimer of Warranties</h2>
          <p>
            The Services are provided "as is," without warranty of any kind. We make no warranty that the Services will meet your requirements or be available on an uninterrupted, secure, or error-free basis.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">9. Limitation of Liability</h2>
          <p>
            In no event shall 3JN CrowdFunding, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">10. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by the laws of the Democratic Republic of Congo, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved through binding arbitration in Kinshasa.
          </p>
          
          <h2 className="text-2xl font-bold font-headline mt-8">11. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
