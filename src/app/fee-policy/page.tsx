
'use client';

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";

export default function FeePolicyPage() {
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
          <h1 className="text-4xl font-bold font-headline mb-8">Fee Policy</h1>
          
          <p><strong>Last Updated:</strong> {lastUpdated || '...'}</p>

          <p>
            At 3JN CrowdFunding, we believe in transparency. Our fee structure is designed to be simple, fair, and aligned with the success of our users. Below is a detailed breakdown of our fees for both Project Owners and Investors.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">1. For Project Owners</h2>
          <h3 className="text-xl font-semibold mt-4">5% Platform Success Fee</h3>
          <ul>
            <li><strong>When it's charged:</strong> This fee is only charged if your campaign successfully reaches its funding target. There are no upfront costs to list your project.</li>
            <li><strong>How it's calculated:</strong> The fee is 5% of the total funds raised.</li>
            <li><strong>How it works:</strong> To ensure you receive your full requested funding amount, we automatically adjust your public-facing funding goal to include this fee. For example, if you need to raise $10,000, your campaign goal will be set to $10,526.32. When you raise this amount, you will receive your full $10,000 after our 5% fee is deducted.</li>
          </ul>

          <h2 className="text-2xl font-bold font-headline mt-8">2. For Investors</h2>
          <h3 className="text-xl font-semibold mt-4">2% Transaction Processing Fee</h3>
           <ul>
            <li><strong>When it's charged:</strong> This fee is added at checkout when you make an investment.</li>
            <li><strong>How it's calculated:</strong> The fee is 2% of your total investment amount.</li>
            <li><strong>Why we charge it:</strong> This small fee covers the costs associated with payment processing from our secure gateway partners (e.g., card fees, bank transfer fees) and helps maintain the platform's infrastructure.</li>
            <li><strong>Example:</strong> If you invest $100, a $2 fee will be added, making your total payable amount $102.</li>
          </ul>

          <h2 className="text-2xl font-bold font-headline mt-8">3. Other Potential Fees</h2>
          <ul>
            <li><strong>Withdrawal Fees:</strong> When you withdraw funds from your platform wallet to your personal bank account, a nominal fee may be applied by our payment partners to cover the cost of the transfer. This fee varies by country and will be clearly displayed before you confirm a withdrawal.</li>
            <li><strong>Currency Conversion:</strong> If you invest in a project with a different currency, a standard currency conversion fee will be applied by our payment processor. The exchange rate will be shown at the time of the transaction.</li>
          </ul>

          <h2 className="text-2xl font-bold font-headline mt-8">4. No Hidden Costs</h2>
          <p>
            There are no subscription fees, listing fees, or hidden charges on 3JN CrowdFunding. Our goal is to provide a straightforward and honest platform for everyone.
          </p>

          <h2 className="text-2xl font-bold font-headline mt-8">Contact Us</h2>
          <p>If you have any questions about our fees, please do not hesitate to contact us at <a href="mailto:info@3jncrowdfunding.com" className="text-primary hover:underline">info@3jncrowdfunding.com</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
