'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suggestPlatformFees, SuggestPlatformFeesOutput } from '@/ai/flows/suggest-platform-fees';
import { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

const settingsFormSchema = z.object({
  commissionRate: z.coerce
    .number()
    .min(0, { message: 'Rate must be non-negative.' })
    .max(100, { message: 'Rate cannot exceed 100.' }),
  currencyApiKey: z.string().optional(),
  maintenanceMode: z.boolean(),
  newProjectNotifications: z.boolean(),
  payoutNotifications: z.boolean(),
  // Compliance fields
  minReleasePct: z.coerce
    .number()
    .min(0, { message: 'Percentage must be non-negative.' })
    .max(100, { message: 'Percentage cannot exceed 100.' }),
  requireAllInvestorsVerified: z.boolean(),
  maxAiRiskScoreForAutoRelease: z.coerce
    .number()
    .min(0)
    .max(100),
  max_single_unverified_amount: z.coerce.number().min(0),
  allowPartialReleaseOnKycGap: z.boolean(),
  autoRefundOnBlock: z.boolean(),
  // New Investor Verification Policy fields
  require_kyb_for_individual_if_investment_gt: z.coerce.number().min(0),
  require_kyb_if_flagged_by_ai: z.boolean(),
  require_kyb_for_investor_if_jurisdiction: z.string().optional(),
  require_bank_verification_for_payouts: z.boolean(),
  // Email settings
  imapHost: z.string().optional(),
  imapPort: z.coerce.number().optional(),
  imapEncryption: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpEncryption: z.string().optional(),
  // AI Matching
  match_threshold: z.array(z.number()),
  email_notification: z.boolean(),
  dashboard_alert: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function AIFeeAdvisor({ currentOwnerFee, currentInvestorFee, onApplyFees }: { currentOwnerFee: number, currentInvestorFee: number, onApplyFees: (ownerFee: number, investorFee: number) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<SuggestPlatformFeesOutput | null>(null);

    const getFeeSuggestion = async () => {
        setIsLoading(true);
        setSuggestion(null);
        try {
            const result = await suggestPlatformFees({
                currentOwnerFee: currentOwnerFee,
                currentInvestorFee: currentInvestorFee,
                marketAnalysis: {
                    competitorOwnerFees: [4.5, 5.5, 6],
                    competitorInvestorFees: [1.5, 2.5, 3],
                    platformGrowthRate: 12,
                    averageCampaignSuccessRate: 75,
                }
            });
            setSuggestion(result);
        } catch (error) {
            console.error("Failed to get fee suggestion", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <h3 className="mb-4 text-lg font-medium">AI Fee Advisor</h3>
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        Dynamic Fee Recommendations
                    </CardTitle>
                    <CardDescription>
                        Use AI to analyze market data and suggest optimal platform fees to stay competitive and drive growth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={getFeeSuggestion} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Bot className="mr-2" />}
                        Get AI Fee Suggestion
                    </Button>

                    {suggestion && (
                        <Alert className="mt-4">
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>AI Recommendation</AlertTitle>
                            <AlertDescription>
                                <p className="mb-4">{suggestion.reasoning}</p>
                                <div className="flex gap-4">
                                     <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Suggested Owner Fee</p>
                                        <p className="text-xl font-bold">{suggestion.suggestedOwnerFee}%</p>
                                     </div>
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Suggested Investor Fee</p>
                                        <p className="text-xl font-bold">{suggestion.suggestedInvestorFee}%</p>
                                     </div>
                                </div>
                                <Button size="sm" className="mt-4" onClick={() => onApplyFees(suggestion.suggestedOwnerFee, suggestion.suggestedInvestorFee)}>
                                    Apply Suggested Fees
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function PlatformSettingsPage() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      commissionRate: 5,
      maintenanceMode: false,
      newProjectNotifications: true,
      payoutNotifications: true,
      minReleasePct: 100,
      requireAllInvestorsVerified: true,
      maxAiRiskScoreForAutoRelease: 40,
      max_single_unverified_amount: 5000,
      allowPartialReleaseOnKycGap: false,
      autoRefundOnBlock: true,
      require_kyb_for_individual_if_investment_gt: 50000,
      require_kyb_if_flagged_by_ai: true,
      require_kyb_for_investor_if_jurisdiction: '',
      require_bank_verification_for_payouts: true,
      // Email defaults
      imapHost: 'imap.hostinger.com',
      imapPort: 993,
      imapEncryption: 'SSL',
      smtpHost: 'smtp.hostinger.com',
      smtpPort: 465,
      smtpEncryption: 'SSL',
      // AI Matching
      match_threshold: [80],
      email_notification: true,
      dashboard_alert: true,
    },
  });
  
  const handleApplyFees = (ownerFee: number) => {
    form.setValue('commissionRate', ownerFee);
    // Assuming you'll add an investor fee field to the form later.
    // form.setValue('investorFee', investorFee); 
    toast({
        title: "Fees Updated",
        description: "AI suggested fees have been applied to the form. Don't forget to save."
    })
  }

  function onSubmit(data: SettingsFormValues) {
    console.log('Platform settings updated:', data);
    toast({
      title: 'Settings Saved',
      description: 'Your platform settings have been successfully updated.',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Configuration</CardTitle>
        <CardDescription>
          Manage global settings for the 3JN CrowdFunding platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Separator />
            
            <AIFeeAdvisor 
                currentOwnerFee={form.watch('commissionRate')} 
                currentInvestorFee={2} // Placeholder as it's not in the form
                onApplyFees={handleApplyFees}
            />

            <Separator />

            {/* AI & Matching */}
            <div>
              <h3 className="mb-4 text-lg font-medium">AI & Matching</h3>
              <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="match_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Match Threshold: {field.value?.[0]}%</FormLabel>
                        <FormControl>
                            <Slider
                                min={50}
                                max={100}
                                step={5}
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                            />
                        </FormControl>
                        <FormDescription>
                          Minimum score for AI to trigger a project match notification to an investor.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <FormField
                  control={form.control}
                  name="email_notification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                         Send investors an email when a new project matches their profile.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dashboard_alert"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dashboard Notifications</FormLabel>
                        <FormDescription>
                          Show real-time dashboard alerts for new AI-matched projects.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Financial Settings */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Financial</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Success Fee (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormDescription>
                        The percentage fee taken on successfully funded campaigns.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currencyApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Conversion API Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your API key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        API key for real-time currency exchange rates.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Email Server Settings */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Email Server</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="imapHost" render={({ field }) => (<FormItem><FormLabel>IMAP Host</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="imapPort" render={({ field }) => (<FormItem><FormLabel>IMAP Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="imapEncryption" render={({ field }) => (<FormItem><FormLabel>IMAP Encryption</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="SSL">SSL</SelectItem><SelectItem value="TLS">TLS</SelectItem><SelectItem value="None">None</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="smtpHost" render={({ field }) => (<FormItem><FormLabel>SMTP Host</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="smtpPort" render={({ field }) => (<FormItem><FormLabel>SMTP Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="smtpEncryption" render={({ field }) => (<FormItem><FormLabel>SMTP Encryption</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="SSL">SSL</SelectItem><SelectItem value="TLS">TLS</SelectItem><SelectItem value="None">None</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Compliance & Payout Policy */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Project Compliance & Payout Policy</h3>
              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="maxAiRiskScoreForAutoRelease"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max AI Risk Score for Auto-Release</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="40" {...field} />
                      </FormControl>
                      <FormDescription>
                        The maximum AI risk score (0-100) a project can have to be eligible for automatic fund release.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="max_single_unverified_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Single Unverified Investment Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        The maximum amount from a single unverified investor that is tolerated for auto-release.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="minReleasePct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Release Percentage</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Campaigns can trigger compliance checks once they reach this percentage of their funding target.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="requireAllInvestorsVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require All Investors Verified</FormLabel>
                        <FormDescription>
                         If enabled, 100% of investors must pass KYC for funds to be auto-released.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="allowPartialReleaseOnKycGap"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Partial Release</FormLabel>
                        <FormDescription>
                          If some investors fail KYC, allow releasing funds from verified investors only.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="autoRefundOnBlock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Refund on Block</FormLabel>
                        <FormDescription>
                          If a compliance run is blocked, automatically initiate refunds to all investors.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            
            {/* Investor Verification Policy */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Investor Verification Policy</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="require_kyb_for_individual_if_investment_gt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KYB Threshold for Individuals</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Trigger enhanced due diligence (KYB-like checks) for individual investors whose total investment exceeds this amount.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="require_kyb_for_investor_if_jurisdiction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High-Risk Jurisdictions</FormLabel>
                      <FormControl>
                        <Input placeholder="US,GB,CA" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of country codes where KYB may be required for investors regardless of amount.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="require_kyb_if_flagged_by_ai"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require KYB if AI Flagged</FormLabel>
                        <FormDescription>
                         If AI detects corporate-like patterns (e.g., business email), prompt for business verification.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="require_bank_verification_for_payouts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Bank Verification</FormLabel>
                        <FormDescription>
                          Always require bank account verification before processing any payouts to users.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

             {/* System Settings */}
            <div>
                <h3 className="mb-4 text-lg font-medium">System</h3>
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Maintenance Mode</FormLabel>
                            <FormDescription>
                            Temporarily disable public access to the site for updates.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <Separator />
            
            {/* Notification Settings */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Admin Notifications</h3>
              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="newProjectNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Project Submissions</FormLabel>
                        <FormDescription>
                          Receive an email when a new project is submitted for approval.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="payoutNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Payout Requests</FormLabel>
                        <FormDescription>
                          Receive an email when a project owner requests a payout.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}