
'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useSearchParams } from 'next/navigation';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const ChartTooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });


const equityVsProfitData = [
  { name: 'Month 1', Equity: 1000, ProfitShare: 1200 },
  { name: 'Month 2', Equity: 1050, ProfitShare: 1250 },
  { name: 'Month 3', Equity: 1100, ProfitShare: 1300 },
  { name: 'Month 4', Equity: 1200, ProfitShare: 1350 },
  { name: 'Month 5', Equity: 1300, ProfitShare: 1400 },
  { name: 'Month 6', Equity: 1400, ProfitShare: 1450 },
];

const mockFinancialData = [
  { "month": "Jan", "revenue": 5000, "profit": 1200, "cashflow": 4000 },
  { "month": "Feb", "revenue": 5500, "profit": 1400, "cashflow": 4300 },
  { "month": "Mar", "revenue": 6000, "profit": 1600, "cashflow": 4500 },
  { "month": "Apr", "revenue": 6500, "profit": 1800, "cashflow": 4800 },
];

export default function LearnItPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tab);
  const [financialData, setFinancialData] = useState<typeof mockFinancialData>([]);

  useEffect(() => {
    // Simulate fetching AI-generated financial data
    setFinancialData(mockFinancialData);
  }, []);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-12 md:py-16 bg-card text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">
              {t('learnIt')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Your guide to mastering crowdfunding, from investment models to
              platform tools.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TooltipProvider>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipOverview')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="for-investors">{t('forInvestors')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipInvestor')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="for-owners">{t('forOwners')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipOwner')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="how-it-works">{t('howItWorks')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipHowItWorks')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="benefits-risks">{t('benefitsRisks')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipBenefits')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="faq">{t('faq')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipFAQ')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="chatbot">{t('askChatbot')}</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltipChatbot')}</p></TooltipContent>
                    </Tooltip>
                </TabsList>
              </TooltipProvider>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('overview')}</CardTitle>
                     <CardDescription>Democratizing investment and fundraising while keeping it transparent, secure, and AI-assisted.</CardDescription>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>
                      3JN CrowdFunding is a unified platform offering two primary investment models: Equity Share and Royalty (Revenue Share). Our architecture is designed for security and transparency, with a clear separation between our public-facing frontend and our secure, private backend where all sensitive operations occur. This ensures that investor funds and user data are always protected.
                    </p>
                    <ul className="list-disc ml-5">
                      <li>
                        <strong>Equity Share:</strong> Investors receive ownership stakes (equity) in projects. Returns are typically realized through future events like an acquisition or IPO, or through dividend distributions if the company becomes profitable.
                      </li>
                      <li>
                        <strong>Royalty (Revenue Share):</strong> Investors receive a pre-defined percentage of a project's revenues until a total repayment multiple of their original investment is met (e.g., 2x return). This model provides a more predictable path to returns based on sales performance.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="for-investors" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('investorGuide')}</CardTitle>
                    <CardDescription>Understand the two ways you can invest and grow your portfolio on our platform.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="prose max-w-none">
                        <h3 className="font-semibold">Equity Share Investing</h3>
                        <p>When you invest in an equity campaign, you are buying a piece of the company. Your dashboard provides tools to track the company's valuation changes over time and manage your holdings.</p>
                        <ul>
                            <li><strong>Benefits:</strong> Potential for high returns if the company is successful (e.g., gets acquired). You become a part-owner of the business.</li>
                            <li><strong>Risks:</strong> Investments are illiquid (hard to sell) until an exit event. There is a risk of losing your entire investment if the business fails.</li>
                        </ul>
                         <h3 className="font-semibold">Royalty (Revenue Share) Investing</h3>
                        <p>With this model, you get a percentage of the company's revenue. We securely track all sales data and automatically distribute your share of the profits to your account.</p>
                         <ul>
                            <li><strong>Benefits:</strong> A more direct path to returns based on sales. You start receiving payouts as soon as the company generates revenue, without needing to wait for an exit.</li>
                            <li><strong>Risks:</strong> Your return is capped at the agreed-upon multiple. If the company's revenues are low, your payback period could be longer than projected.</li>
                        </ul>
                    </div>
                    <div className="h-64 w-full">
                       <h4 className="text-center font-semibold text-sm mb-2">Illustrative Returns: Equity vs Royalty</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityVsProfitData}>
                           <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false}/>
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                          <ChartTooltip formatter={(value, name) => [`$${value}`, t(name.toLowerCase() as any) || name]} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Equity"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name={t("chartEquity")}
                          />
                          <Line
                            type="monotone"
                            dataKey="ProfitShare"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            name={t("chartProfit")}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="for-owners" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('ownerGuide')}</CardTitle>
                    <CardDescription>Leverage our platform's tools to fund your vision and grow your business.</CardDescription>
                  </CardHeader>
                   <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="prose max-w-none">
                        <h3 className="font-semibold">Equity Campaigns</h3>
                        <p>Sell ownership stakes to a community of investors who believe in your long-term vision. Use our AI tools to generate a compelling pitch and realistic financial projections.</p>
                        <ul>
                            <li><strong>Benefits:</strong> Raise significant capital without the burden of monthly repayments. Gain a community of advocates.</li>
                            <li><strong>Requirements:</strong> A clear business plan, a defensible valuation, and readiness to manage shareholder relations.</li>
                        </ul>
                         <h3 className="font-semibold">Royalty Campaigns</h3>
                        <p>Raise capital by offering a share of your future revenue. This is ideal for businesses with existing sales or predictable income streams.</p>
                         <ul>
                            <li><strong>Benefits:</strong> Retain full ownership of your company. It's a straightforward, non-dilutive way to finance growth.</li>
                            <li><strong>Requirements:</strong> A clear revenue model and the ability to provide transparent sales reporting.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm mb-2">Sample AI-Generated Financials</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("tableColumnMonth")}</TableHead>
                              <TableHead className="text-right">{t("tableColumnRevenue")}</TableHead>
                              <TableHead className="text-right">{t("tableColumnProfit")}</TableHead>
                              <TableHead className="text-right">{t("tableColumnCashflow")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {financialData.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{row.month}</TableCell>
                                <TableCell className="text-right">${row.revenue.toLocaleString()}</TableCell>
                                <TableCell className="text-right">${row.profit.toLocaleString()}</TableCell>
                                <TableCell className="text-right">${row.cashflow.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="how-it-works" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('howItWorks')}</CardTitle>
                    <CardDescription>Our secure and automated process for funding and investment.</CardDescription>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <ol className="list-decimal ml-5 space-y-2">
                      <li><strong>Register:</strong> Sign up as an Investor or Project Owner and complete your profile.</li>
                      <li><strong>Compliance:</strong> All users undergo a mandatory KYC (Know Your Customer) check to ensure a safe environment. Project Owners also undergo KYB (Know Your Business).</li>
                      <li><strong>Create/Browse:</strong> Owners use AI tools to create campaigns. Investors browse opportunities, using AI insights to analyze them.</li>
                      <li><strong>Invest:</strong> Funds are processed by Stripe and held securely until the campaign goal is met.</li>
                      <li><strong>AI Compliance Run:</strong> When a project is funded, our AI-powered compliance engine runs a final check on all participants before funds are released.</li>
                      <li><strong>Payout & Tracking:</strong> Funds are disbursed to owners. Investors track their portfolio's ROI and receive payouts directly.</li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="benefits-risks" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('benefitsRisks')}</CardTitle>
                    <CardDescription>Understanding the opportunities and challenges of crowdfunding.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 prose max-w-none">
                    <div>
                      <h3 className="font-semibold mb-2">For Investors</h3>
                      <ul className="list-disc ml-5">
                        <li><strong>Benefits:</strong> Access to a diverse range of vetted, early-stage investment opportunities. Transparent portfolio tracking and AI-assisted decision-making tools.</li>
                        <li><strong>Risks:</strong> Early-stage investing is inherently risky and may result in the loss of your entire investment. Investments are typically illiquid.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">For Owners</h3>
                      <ul className="list-disc ml-5">
                        <li><strong>Benefits:</strong> Access to capital from a global investor pool, AI tools to build a stronger campaign, and a community of supporters.</li>
                        <li><strong>Risks:</strong> There is no guarantee of reaching your funding goal. You are responsible for fulfilling promises to investors and meeting reporting requirements.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="faq" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('faq')}</CardTitle>
                    <CardDescription>Answers to common questions about our platform.</CardDescription>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <h3 className="font-semibold">Why is KYC/AML mandatory?</h3>
                    <p>To comply with financial regulations and prevent fraud, we must verify the identity of all users. This creates a secure and trustworthy environment for everyone.</p>
                    <h3 className="font-semibold">What is the AI Readiness Score?</h3>
                    <p>Our AI analyzes your project's details, market data, and financial inputs to provide a score on its "investment readiness." This helps you identify areas for improvement before you launch.</p>
                    <h3 className="font-semibold">How are my funds protected?</h3>
                    <p>Investor funds are held in a secure, segregated account via Stripe until a campaign successfully reaches its funding goal and passes all final compliance checks.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="chatbot" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('askChatbot')}</CardTitle>
                    <CardDescription>
                      Our AI assistant is always available at the bottom right corner of your screen. Click the chat icon to start a conversation!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground">
                      Get instant, AI-assisted answers to your questions about investment mechanics, campaign creation, financial projections, or payout schedules.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
