
'use client';

import { useState, useMemo } from 'react';
import { useForm, useWatch, type UseFormReturn, type ControllerRenderProps, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stepper, StepperContent, StepperItem, StepperNext, StepperPrevious, useStepper } from '@/components/ui/stepper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { countries } from '@/lib/countries';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, Loader2, PartyPopper, TrendingUp, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, formatISO } from 'date-fns';
import { AIContentGenerator } from '@/components/ai-content-generator';
import { CampaignEditor } from '@/components/campaign-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { projectCategories as categoryOptions } from '@/lib/data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from "framer-motion";
import CountUp from 'react-countup';
import { gtm } from '@/lib/gtm';
import { useAuth, useFirestore, useFirebase } from '@/firebase';
import { createProject } from '@/services/project';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';


const projectDetailsSchema = z.object({
  title: z.string().min(5, 'Project title must be at least 5 characters.'),
  categories: z.array(z.string()).min(1, 'Please select at least one category.'),
  investmentStage: z.string().min(2, 'Investment stage is required.'),
  location: z.string().min(2, 'Country is required.'),
  summary: z.string().min(20, 'Summary must be at least 20 characters.').max(200, 'Summary cannot exceed 200 characters.'),
  fundingType: z.enum(['Equity', 'Royalty'], { required_error: 'You must select a funding type.' }),
  targetAmount: z.coerce.number().min(1000, 'Funding target must be at least 1,000.'),
  currency: z.string().min(2, 'Currency is required.'),
  minTicket: z.coerce.number().min(10, 'Minimum investment must be at least 10.'),
  endDate: z.date({ required_error: 'Campaign end date is required.' }),
  valuation: z.coerce.number().optional(),
  equityOffered: z.coerce.number().optional(),
  investorRights: z.string().optional(),
  nomineeOption: z.boolean().default(false).optional(),
  royaltyRate: z.coerce.number().optional(),
  repaymentMultiple: z.coerce.number().optional(),
  paymentFrequency: z.string().optional(),
  revenueDefinition: z.string().optional(),
}).refine(data => {
    if (data.fundingType === 'Equity') {
        return !!data.valuation && !!data.equityOffered;
    }
    return true;
}, {
    message: 'Valuation and Equity Offered are required for Equity funding.',
    path: ['equityOffered'],
}).refine(data => {
    if (data.fundingType === 'Royalty') {
        return !!data.royaltyRate && !!data.repaymentMultiple;
    }
    return true;
}, {
    message: 'Royalty Rate and Repayment Multiple are required for Royalty funding.',
    path: ['repaymentMultiple'],
});


type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>;

const allInvestmentStages = [
    "Concept / Idea Stage",
    "Prototype / MVP Stage",
    "Seed / Validation Stage",
    "Early Growth Stage",
    "Expansion / Scale-Up Stage",
    "Operating / Revenue Stage",
    "Mature / Established Stage",
    "Turnaround / Recovery Stage",
    "Exit / Secondary Opportunity",
];

const equityStages = [
    "Concept / Idea Stage",
    "Prototype / MVP Stage",
    "Seed / Validation Stage",
    "Early Growth Stage",
    "Expansion / Scale-Up Stage",
    "Exit / Secondary Opportunity",
];

const royaltyStages = [
    "Early Growth Stage",
    "Expansion / Scale-Up Stage",
    "Operating / Revenue Stage",
    "Mature / Established Stage",
    "Turnaround / Recovery Stage",
];


function ProjectDetailsForm({ form }: { form: UseFormReturn<ProjectDetailsFormValues> }) {
    const { nextStep } = useStepper();

    const fundingType = useWatch({
        control: form.control,
        name: 'fundingType',
    });

    const investmentStages = useMemo(() => {
        if (fundingType === 'Equity') {
            return equityStages;
        }
        if (fundingType === 'Royalty') {
            return royaltyStages;
        }
        return allInvestmentStages;
    }, [fundingType]);


    function onSubmit() {
        nextStep();
    }
    
    const categorySelectOptions = categoryOptions.map((cat: string) => ({ label: cat, value: cat }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "title"> }) => (
                            <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Eco-Friendly Drone Delivery" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "categories"> }) => (
                            <FormItem>
                                <FormLabel>Categories</FormLabel>
                                <MultiSelect
                                    options={categorySelectOptions}
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select categories..."
                                    className="w-full"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                 <div className="grid md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="investmentStage"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "investmentStage"> }) => (
                            <FormItem>
                            <FormLabel>Investment Stage</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!fundingType}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder={!fundingType ? "Select funding type first" : "Select a stage"} /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {investmentStages.map((stage: string) => (
                                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="location"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "location"> }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {countries.map((country: string) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                 <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "summary"> }) => (
                        <FormItem>
                        <FormLabel>Short Summary</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Briefly describe your project in 1-2 sentences." {...field} />
                        </FormControl>
                        <FormDescription>This is the first thing potential investors will see.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="fundingType"
                    render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "fundingType"> }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Funding Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={(value: string) => {
                                field.onChange(value)
                                // Reset investment stage when funding type changes
                                form.setValue('investmentStage', '');
                            }}
                            defaultValue={field.value}
                            className="flex flex-col md:flex-row gap-4"
                            >
                            <FormItem className="flex-1">
                                <FormControl>
                                     <Card className={cn("cursor-pointer", fundingType === 'Equity' && "border-primary")}>
                                        <div className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <RadioGroupItem value="Equity" id="equity"/>
                                                <div className="space-y-1">
                                                    <Label htmlFor="equity" className="font-bold">Equity</Label>
                                                    <FormDescription>Offer a share of your company to investors.</FormDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </FormControl>
                            </FormItem>
                             <FormItem className="flex-1">
                                <FormControl>
                                     <Card className={cn("cursor-pointer", fundingType === 'Royalty' && "border-primary")}>
                                        <div className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <RadioGroupItem value="Royalty" id="royalty" />
                                                <div className="space-y-1">
                                                    <Label htmlFor="royalty" className="font-bold">Royalty</Label>
                                                    <FormDescription>Share a percentage of your revenue with investors.</FormDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </FormControl>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {fundingType === 'Equity' && (
                    <Card className="p-6 bg-secondary/50">
                        <div className="grid md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="valuation"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "valuation"> }) => (
                                <FormItem>
                                    <FormLabel>Pre-money Valuation</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 5,000,000" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="equityOffered"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "equityOffered"> }) => (
                                <FormItem>
                                    <FormLabel>Equity Offered (%)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                             <FormField
                                control={form.control}
                                name="investorRights"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "investorRights"> }) => (
                                    <FormItem>
                                        <FormLabel>Investor Rights</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select investor rights" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="voting">Voting Rights</SelectItem>
                                                <SelectItem value="non-voting">Non-Voting Rights</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="nomineeOption"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "nomineeOption"> }) => (
                                    <FormItem className="flex items-center gap-2 pt-8">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            id="nomineeOption"
                                        />
                                    </FormControl>
                                     <div className="space-y-1 leading-none">
                                        <Label htmlFor="nomineeOption">Use Nominee Structure</Label>
                                        <FormDescription>Simplify investor management with a nominee.</FormDescription>
                                    </div>
                                    </FormItem>
                                )}
                                />
                        </div>
                    </Card>
                )}

                {fundingType === 'Royalty' && (
                     <Card className="p-6 bg-secondary/50">
                        <div className="grid md:grid-cols-2 gap-8">
                             <FormField
                                control={form.control}
                                name="royaltyRate"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "royaltyRate"> }) => (
                                <FormItem>
                                    <FormLabel>Royalty Rate (%)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="repaymentMultiple"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "repaymentMultiple"> }) => (
                                <FormItem>
                                    <FormLabel>Repayment Multiple</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 1.8" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <div className="grid md:grid-cols-2 gap-8 mt-8">
                             <FormField
                                control={form.control}
                                name="paymentFrequency"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "paymentFrequency"> }) => (
                                    <FormItem>
                                        <FormLabel>Payment Frequency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                              <FormField
                                control={form.control}
                                name="revenueDefinition"
                                render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "revenueDefinition"> }) => (
                                    <FormItem>
                                        <FormLabel>Revenue Definition</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select revenue type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="gross">Gross Revenue</SelectItem>
                                                <SelectItem value="net">Net Revenue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Card>
                )}
                
                <div className="grid md:grid-cols-3 gap-8">
                     <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "targetAmount"> }) => (
                        <FormItem>
                            <FormLabel>Funding Target</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "currency"> }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="minTicket"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "minTicket"> }) => (
                        <FormItem>
                            <FormLabel>Minimum Investment</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }: { field: ControllerRenderProps<ProjectDetailsFormValues, "endDate"> }) => (
                            <FormItem className="flex flex-col pt-2">
                                <FormLabel>Campaign End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date: Date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="submit">Next</Button>
                </div>
            </form>
        </Form>
    );
}

const OwnerFeeReview = ({ control }: { control: Control<ProjectDetailsFormValues> }) => {
    const targetAmount = useWatch({ control, name: 'targetAmount' });
    const successFeePercent = 0.05;
  
    const baseTarget = isNaN(targetAmount) || targetAmount < 0 ? 0 : targetAmount;
    const platformFee = baseTarget * successFeePercent;
    const adjustedTarget = baseTarget / (1 - successFeePercent);
    const feeFromAdjusted = adjustedTarget - baseTarget;
  
    const formatValue = (value: number) => {
      return (
        <CountUp
          start={0}
          end={value}
          duration={0.5}
          separator=","
          prefix="$"
          decimals={0}
          preserveValue
        />
      );
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-card rounded-2xl shadow-lg p-6 mt-8 border border-border"
    >
      <h2 className="text-2xl font-bold mb-4 text-card-foreground">
        Review &amp; Fee Breakdown
      </h2>
      <p className="text-muted-foreground mb-6">
        Here’s a transparent breakdown of your project goal and the platform’s
        success fee.
      </p>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">
            You Receive (Your Goal)
          </span>
          <span className="font-semibold text-foreground">
            {formatValue(baseTarget)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-foreground">
            Platform Success Fee (5%)
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info size={16} className="text-primary cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>We'll automatically add 5% to your target to cover platform success fees. You still receive your full requested amount.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-foreground">
             {formatValue(feeFromAdjusted)}
          </span>
        </div>

        <div className="flex justify-between items-center border-t border-border pt-3">
          <span className="font-semibold text-foreground">
            Total Public Target
          </span>
          <span className="font-semibold text-primary text-xl">
             {formatValue(adjustedTarget)}
          </span>
        </div>
      </div>

      <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-primary/80">
        💡 <b>Note:</b> Investors will see the adjusted public target. You will receive your requested amount in full when your campaign succeeds.
      </div>
    </motion.div>
  );
};

const checklistItems = [
    { id: 'details', text: 'Project details are complete and accurate' },
    { id: 'content', text: 'Campaign story, images, and video are finalized' },
    { id: 'documents', text: 'Pitch deck and financial documents are uploaded' },
    { id: 'kyc', text: 'Owner KYC/AML information has been provided' },
  ];

function PreLaunchChecklist({ form }: { form: UseFormReturn<ProjectDetailsFormValues> }) {
    const { prevStep } = useStepper();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const firestore = useFirestore();
    const { user } = useAuth();
    const { auth } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();


    const handleSubmit = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        console.log('Submit button clicked', { user, firestore, termsAccepted });
        
        if (!user || !firestore) {
            toast({ title: 'Error', description: 'You must be logged in to create a project.', variant: 'destructive' });
            return;
        }

        if (!termsAccepted) {
            toast({ title: 'Terms Required', description: 'Please accept the terms of service to continue.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            const formData = form.getValues();
            console.log('Form data:', formData);
            
            // Get user ID - must use Firebase Auth UID for API queries to work
            // The API route uses decodedToken.uid, so we need to match that exactly
            const userId = auth?.currentUser?.uid || (user as any)?.uid || user?.id;
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }
            const userName = user?.name || (user as any)?.displayName || 'Unnamed Owner';
            const userAvatar = (user as any)?.avatarUrl || (user as any)?.photoURL || 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxtYW4lMjBwcm9maWxlfGVufDB8fHx8MTc2MjU0NDYwMXww&ixlib=rb-4.1.0&q=80&w=1080';
            
            console.log('User ID being saved:', userId, 'Auth UID:', auth?.currentUser?.uid);
            
            // Format data for saving - map form fields to Project type
            const projectData: Record<string, any> = {
                title: formData.title,
                category: formData.categories.join(', '), // Convert array to comma-separated string
                investmentStage: formData.investmentStage,
                location: formData.location,
                type: formData.fundingType, // Map fundingType to type
                status: 'submitted', // Set status to submitted
                currency: formData.currency,
                targetAmount: formData.targetAmount,
                minTicket: formData.minTicket,
                owner: {
                  id: userId,
                  name: userName,
                  avatarUrl: userAvatar,
                  avatarHint: 'person profile',
                },
                endDate: formatISO(formData.endDate),
                raisedAmount: 0,
                investorCount: 0,
                // These would be filled in by other steps in a real app
                shortDescription: formData.summary,
                longDescription: 'Details from the Campaign Editor step would go here.',
                imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                imageHint: 'business idea',
                documents: [],
                faqs: [],
                financials: {
                    projections: []
                },
            };
            
            // Only include Equity fields if funding type is Equity and they have values
            if (formData.fundingType === 'Equity') {
                if (formData.valuation !== undefined) projectData.valuation = formData.valuation;
                if (formData.equityOffered !== undefined) projectData.equityOffered = formData.equityOffered;
                if (formData.investorRights) projectData.investorRights = formData.investorRights;
                if (formData.nomineeOption !== undefined) projectData.nomineeOption = formData.nomineeOption;
            }
            
            // Only include Royalty fields if funding type is Royalty and they have values
            if (formData.fundingType === 'Royalty') {
                if (formData.royaltyRate !== undefined) projectData.royaltyRate = formData.royaltyRate;
                if (formData.repaymentMultiple !== undefined) projectData.repaymentMultiple = formData.repaymentMultiple;
                if (formData.paymentFrequency) projectData.paymentFrequency = formData.paymentFrequency;
                if (formData.revenueDefinition) projectData.revenueDefinition = formData.revenueDefinition;
            }
            
            // Remove undefined values to prevent Firestore errors (shallow clean here, deep clean in service)
            const cleanedProjectData = Object.fromEntries(
                Object.entries(projectData).filter(([_, value]) => {
                    // Filter out undefined values
                    if (value === undefined) return false;
                    // Also filter out empty strings in optional fields (but keep required ones)
                    if (typeof value === 'string' && value === '' && 
                        !['title', 'category', 'investmentStage', 'location', 'currency', 'shortDescription', 'longDescription'].includes(_)) {
                        return false;
                    }
                    return true;
                })
            ) as Partial<Project>;
            
            // Log the data being sent for debugging (remove in production)
            console.log('Project data being sent:', JSON.stringify(cleanedProjectData, null, 2));
            
            const newProjectId = await createProject(firestore, cleanedProjectData);
            
            gtm.push({
                event: 'project_submitted',
                projectId: newProjectId,
                fundingType: formData.fundingType,
            });

            setIsSubmitted(true);
            toast({ title: 'Campaign Submitted!', description: "Your project is now under review. Redirecting..." });

            setTimeout(() => {
              // Use router.refresh() to ensure the portfolio page fetches the latest data
              router.push('/dashboard/portfolio');
              router.refresh();
            }, 2000);

        } catch (error) {
            console.error('Error submitting project:', error);
            setIsLoading(false);
            toast({ 
                title: 'Submission Failed', 
                description: error instanceof Error ? error.message : 'Failed to submit project. Please try again.',
                variant: 'destructive' 
            });
        }
    }
    
    if (isSubmitted) {
        return (
             <div className="text-center p-8 border-2 border-dashed rounded-lg mt-8">
                <PartyPopper className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold mt-4">Campaign Submitted!</h3>
                <p className="text-muted-foreground mt-2">Your project is now being reviewed by our team. You'll be notified once it's approved.</p>
            </div>
        )
    }

    return (
        <div className="mt-8">
            <OwnerFeeReview control={form.control} />
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Pre-Launch Checklist</CardTitle>
                    <CardDescription>Please review and confirm all items below before submitting your campaign for review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ul className="space-y-4">
                        {checklistItems.map(item => (
                            <li key={item.id} className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                                    <Check className="h-4 w-4" />
                                </div>
                                <span className="text-sm text-muted-foreground">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked: boolean) => setTermsAccepted(checked)} />
                        <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I agree to the platform's terms of service and fee structure.
                        </Label>
                    </div>
                </CardContent>
            </Card>
             <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" type="button" onClick={prevStep}>Previous</Button>
                <Button 
                    type="button" 
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmit(e);
                    }} 
                    disabled={!termsAccepted || isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit for Review
                </Button>
            </div>
        </div>
    )
}


export default function CreateProjectWizard() {
     const form = useForm<ProjectDetailsFormValues>({
        resolver: zodResolver(projectDetailsSchema),
        defaultValues: {
            title: '',
            categories: [],
            investmentStage: '',
            location: '',
            summary: '',
            currency: 'USD',
            targetAmount: 50000,
            minTicket: 500,
            valuation: undefined,
            equityOffered: undefined,
            investorRights: '',
            nomineeOption: false,
            royaltyRate: undefined,
            repaymentMultiple: undefined,
            paymentFrequency: '',
            revenueDefinition: '',
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create a New Project</CardTitle>
                <CardDescription>Follow the steps to build and launch your campaign.</CardDescription>
            </CardHeader>
            <CardContent>
                <Stepper initialStep={0} clickable>
                    <StepperItem label="Project Details">
                        <div className="mt-8">
                           <ProjectDetailsForm form={form} />
                        </div>
                    </StepperItem>
                    <StepperItem label="AI Content Generation">
                       <div className="mt-8">
                         <AIContentGenerator />
                       </div>
                         <div className="flex justify-end gap-2 mt-4">
                            <StepperPrevious>Previous</StepperPrevious>
                            <StepperNext>Next</StepperNext>
                        </div>
                    </StepperItem>
                     <StepperItem label="Campaign Editor">
                        <div className="mt-8">
                           <CampaignEditor />
                        </div>
                         <div className="flex justify-end gap-2 mt-4">
                            <StepperPrevious>Previous</StepperPrevious>
                            <StepperNext>Next</StepperNext>
                        </div>
                    </StepperItem>
                    <StepperItem label="Review &amp; Launch">
                       <PreLaunchChecklist form={form} />
                    </StepperItem>
                </Stepper>
            </CardContent>
        </Card>
    );
}
