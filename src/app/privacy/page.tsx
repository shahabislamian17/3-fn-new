
'use client';

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold font-headline mb-8">Privacy Policy</h1>
          
          <p><strong>Last Updated:</strong> {lastUpdated || '...'}</p>

          <h2 className="text-2xl font-bold font-headline mt-8">1. Information We Collect</h2>
          <p>We may collect personal information from you in a variety of ways, including:</p>
          <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the platform.</li>
            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you invest in a project. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor.</li>
            <li><strong>Data from Social Networks:</strong> User information from social networking sites, such as your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.</li>
          </ul>

          <h2 className="text-2xl font-bold font-headline mt-8">2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the platform to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process your investments and transactions.</li>
            <li>Email you regarding your account or orders.</li>
            <li>Comply with legal and regulatory requirements.</li>
            <li>Perform data analysis to improve our services, including the use of AI models.</li>
          </ul>

          <h2 className="text-2xl font-bold font-headline mt-8">3. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul>
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and customer service.</li>
            <li><strong>Project Owners:</strong> If you invest in a project, we will share your name and contact information with the project owner for fulfillment and communication purposes.</li>
          </ul>

          <h2 className="text-2xl font-bold font-headline mt-8">4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">5. Policy for Children</h2>
          <p>
            We do not knowingly solicit information from or market to children under the age of 18. If you become aware of any data we have collected from children under age 18, please contact us using the contact information provided below.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">6. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:info@3jncrowdfunding.com" className="text-primary hover:underline">info@3jncrowdfunding.com</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
