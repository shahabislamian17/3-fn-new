
'use client';
import { useState, useEffect } from 'react';
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

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer as any), { ssr: false }) as any;
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart as any), { ssr: false }) as any;
const Line = dynamic(() => import('recharts').then(mod => mod.Line as any), { ssr: false }) as any;
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis as any), { ssr: false }) as any;
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis as any), { ssr: false }) as any;
const ChartTooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip as any), { ssr: false }) as any;
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend as any), { ssr: false }) as any;
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid as any), { ssr: false }) as any;


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
                      3JN CrowdFunding is a unified crowdfunding platform offering both
                      Equity and Profit/Revenue Share investment models.
                      Investors gain opportunities to earn returns, and project
                      owners can raise capital efficiently.
                    </p>
                    <ul className="list-disc ml-5">
                      <li>
                        <strong>Equity Share:</strong> Investors receive ownership stakes in projects/companies. Returns through exit events or dividends.
                      </li>
                      <li>
                        <strong>Profit/Revenue Share (Royalty-Based):</strong> Investors receive a percentage of revenues/profits until a cap is reached.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="for-investors" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('investorGuide')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="prose max-w-none">
                        <h3 className="font-semibold">Equity Share Investors</h3>
                        <p>Buy shares, track value growth in your dashboard, and cash-out upon an exit event.</p>
                        <ul>
                            <li><strong>Benefits:</strong> Potential for high returns and early access to promising projects.</li>
                            <li><strong>Risks:</strong> Capital is at risk if the project fails, and investments are illiquid until an exit.</li>
                        </ul>
                         <h3 className="font-semibold">Profit/Revenue Share Investors</h3>
                        <p>Subscribe to a revenue share plan, receive periodic payouts, and track your ROI progress.</p>
                         <ul>
                            <li><strong>Benefits:</strong> Potentially faster returns than equity and transparent payout calculations.</li>
                            <li><strong>Risks:</strong> ROI depends on project revenue, and delays can occur if revenue stalls.</li>
                        </ul>
                    </div>
                    <div className="h-64 w-full">
                       <h4 className="text-center font-semibold text-sm mb-2">Equity vs Profit Share Returns</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityVsProfitData}>
                           <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false}/>
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `$${value}`} />
                          <ChartTooltip formatter={(value: any, name: any) => [`$${value}`, t(name.toLowerCase() as any) || name]} />
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
                  </CardHeader>
                   <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="prose max-w-none">
                        <h3 className="font-semibold">Equity Share Owners</h3>
                        <p>Sell ownership stakes to fund your project. Create a campaign, define your equity offering, and manage investors via your dashboard.</p>
                        <ul>
                            <li><strong>Benefits:</strong> Access a large pool of investors with no repayment obligation.</li>
                            <li><strong>Requirements:</strong> A clear pitch, legal documents (e.g., shareholder agreement), and KYC for all parties.</li>
                        </ul>
                         <h3 className="font-semibold">Profit/Revenue Share Owners</h3>
                        <p>Raise capital in exchange for a portion of future revenue. Define a royalty rate and repayment multiple, then let investors subscribe.</p>
                         <ul>
                            <li><strong>Benefits:</strong> Retain full ownership and have flexible repayments aligned with revenue.</li>
                            <li><strong>Requirements:</strong> Linked bank account, compliance with reporting, and KYC.</li>
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
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <ol className="list-decimal ml-5 space-y-2">
                      <li><strong>Register:</strong> Sign up as an Investor or Owner.</li>
                      <li><strong>Compliance:</strong> Complete KYC/AML checks.</li>
                      <li><strong>Create/Browse:</strong> Owners create campaigns with AI tools; Investors browse opportunities.</li>
                      <li><strong>Invest:</strong> Funds are held securely in an escrow account until the campaign goal is met.</li>
                      <li><strong>Verification:</strong> The system runs a final compliance check when the target is reached.</li>
                      <li><strong>Payout & Tracking:</strong> Funds are disbursed to owners. Investors track ROI or portfolio updates on their dashboard.</li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="benefits-risks" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('benefitsRisks')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 prose max-w-none">
                    <div>
                      <h3 className="font-semibold mb-2">For Investors</h3>
                      <ul className="list-disc ml-5">
                        <li><strong>Benefits:</strong> Diversification, transparent portfolio tracking, and AI-assisted decision-making.</li>
                        <li><strong>Risks:</strong> Market and project failure risk, illiquidity of investments, and potential for delayed payouts.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">For Owners</h3>
                      <ul className="list-disc ml-5">
                        <li><strong>Benefits:</strong> Access to capital, AI-assisted financial planning, and exposure to a global investor network.</li>
                        <li><strong>Risks:</strong> Regulatory compliance, project delivery risk, and ongoing reporting obligations.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="faq" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('faq')}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <ul className="list-disc ml-5 space-y-2">
                      <li>How do I know which investment model is right for me?</li>
                      <li>What happens if my investment exceeds the verification threshold?</li>
                      <li>How is my ROI calculated for profit-share projects?</li>
                      <li>Can I invest in multiple projects at once?</li>
                      <li>How do I withdraw funds from my account?</li>
                    </ul>
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
