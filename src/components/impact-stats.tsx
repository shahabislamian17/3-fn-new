
'use client';
import { Users, Blocks, DollarSign, Leaf } from 'lucide-react';
import { useCountUp } from 'react-countup';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const StatCard = ({ icon, end, label, suffix = '', prefix = '' }: { icon: React.ReactNode, end: number, label: string, suffix?: string, prefix?: string }) => {
    const countUpRef = useRef(null);
    useCountUp({ ref: countUpRef, end, duration: 3, enableScrollSpy: true, scrollSpyDelay: 200, separator: ',' });

    return (
        <div className="text-center">
            <div className="flex justify-center mb-4 text-primary">
                {icon}
            </div>
            <p className="text-4xl md:text-5xl font-bold text-primary">
                {prefix}<span ref={countUpRef} />{suffix}
            </p>
            <p className="text-muted-foreground mt-1">{label}</p>
        </div>
    )
}

interface Stats {
    countries: number;
    investedUSD: string;
    projectsFunded: number;
    co2Saved: string;
}

export function ImpactStats({ stats: _stats }: { stats: Stats }) {
    const { t } = useTranslation();

    return (
        <section className="py-20 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">{t('Our Impact in Numbers')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{t('We are committed to driving measurable financial and environmental progress across the globe.')}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard icon={<Users className="h-10 w-10" />} end={12480} label={t('Active Investors')} />
                    <StatCard icon={<Blocks className="h-10 w-10" />} end={267} label={t('Projects Funded')} />
                    <StatCard icon={<DollarSign className="h-10 w-10" />} end={2400000} prefix="$" label={t('Returns Paid')} />
                    <StatCard icon={<Leaf className="h-10 w-10" />} end={1250} suffix=" tons" label={t('CO₂ Saved')} />
                </div>
            </div>
        </section>
    );
}
