
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Link from 'next/link';

function AIInsightWidget() {
  const [goal, setGoal] = useState("impact");
  const [insight, setInsight] = useState("Based on your goal, Recycling and Energy Efficiency projects in Kenya offer 11–15% average ROI.");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const getInsight = async (g: string) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 700)); // mock network delay
    
    let newInsight = "No insight available.";
    if (g === 'impact') {
        newInsight = 'Based on your goal, Recycling and Energy Efficiency projects in Kenya offer 11–15% average ROI.';
    } else if (g === 'retirement') {
        newInsight = 'For retirement, consider a balanced portfolio of Equity projects in stable sectors like infrastructure for long-term, steady growth.';
    } else {
        newInsight = 'For short-term returns, Royalty-based investments in consumer goods have shown quick payback periods.';
    }
    setInsight(newInsight);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{t('Your goal:')}</label>
        <Select value={goal} onValueChange={(value) => { setGoal(value); getInsight(value); }}>
            <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a goal" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="impact">{t('Impact')}</SelectItem>
                <SelectItem value="retirement">{t('Retirement')}</SelectItem>
                <SelectItem value="short_term_roi">{t('Short-term ROI')}</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-secondary/20 border">
        {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin"/>
                <span>{t('Analyzing...')}</span>
            </div>
        ) : (
            <p className="text-sm">{t(insight)}</p>
        )}
      </div>
    </div>
  );
}


export function AIWidget() {
    const { t } = useTranslation();
    return (
        <section className="py-20 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">{t('Let AI Guide Your Next Move.')}</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto md:mx-0 mt-4">{t('Our intelligent platform analyzes thousands of data points to help you find investments that perfectly match your financial goals and values.')}</p>
                        <Button asChild className="mt-6">
                            <Link href="/signup">{t('Create Free Investor Profile')}</Link>
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BrainCircuit /> {t('Smart Investment Insights')}</CardTitle>
                            <CardDescription>{t("What's your primary investment goal?")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <AIInsightWidget />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
