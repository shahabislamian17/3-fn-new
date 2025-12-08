
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPlaceholderImage } from "@/lib/assets/placeholder-images";

interface Testimonial {
    name: string;
    role: string;
    quote: string;
    imageId: string;
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
    const { t } = useTranslation();
    
    return (
        <section className="py-20 md:py-24 bg-card">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">{t('Success Stories')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{t('Hear from the investors and entrepreneurs who are building the future with us.')}</p>
                </div>
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-4xl mx-auto"
                    >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => {
                            const image = getPlaceholderImage(testimonial.imageId);
                            return (
                                <CarouselItem key={index} className="md:basis-1/2">
                                    <div className="p-1">
                                    <Card className="h-full">
                                        <CardContent className="flex flex-col items-center text-center justify-center p-8 space-y-4">
                                            <p className="text-muted-foreground text-lg italic">"{t(testimonial.quote)}"</p>
                                            <div className="flex items-center gap-3 pt-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={image.imageUrl} data-ai-hint={image.imageHint} />
                                                    <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-lg">{testimonial.name}</p>
                                                    <p className="text-sm text-muted-foreground">{t(testimonial.role)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    </div>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
                <div className="text-center mt-12">
                  <Button asChild variant="link" className="text-lg">
                    <Link href="/blog">Read more stories on our blog <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </div>
            </div>
        </section>
    )
}
