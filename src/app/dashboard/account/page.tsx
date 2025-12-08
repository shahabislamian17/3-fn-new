
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth, useUser } from '@/firebase';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Landmark, Upload, Pencil, FileText, X, MapPin, Loader2, CheckCircle, AlertTriangle, XCircle, Briefcase, TrendingUp, Lightbulb, Shield, User, Wallet, Info } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/countries';
import { MultiSelect } from '@/components/ui/multi-select';
import { projectCategories } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { StripeOnboard } from '@/components/stripe-onboard';
import type { User as AppUser } from '@/lib/types';
import { updateUser } from '@/services/user';
import { getPlaceholderImage } from '@/lib/assets/placeholder-images';


const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
});

const payoutFormSchema = z.object({
    bankName: z.string().min(2, "Bank name is required."),
    accountHolderName: z.string().min(2, "Account holder name is required."),
    accountNumber: z.string().min(5, "A valid account number is required."),
    swiftCode: z.string().min(8, "A valid SWIFT/BIC code is required."),
});

const securityFormSchema = z.object({
    twoFactorEnabled: z.boolean(),
});

const settingsFormSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  emailNotifications: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PayoutFormValues = z.infer<typeof payoutFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function PersonalDataForm({ userType = "owner", onSubmit }: { userType: 'owner' | 'investor', onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    idType: '',
    idNumber: '',
    idIssueDate: '',
    idExpiryDate: '',
    idDocumentUrl: '',
    selfieUrl: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    proofOfAddressUrl: '',
    currentLocation: null as { lat: number, lng: number } | null,
  });

  const [aiStatus, setAiStatus] = useState({
    loading: false,
    riskLevel: null as 'green' | 'amber' | 'red' | null,
    suggestions: [] as string[],
    message: '',
  });

  // Capture GPS location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setForm((prev) => ({
              ...prev,
              currentLocation: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              },
            }));
          },
          () => console.warn('Location access denied')
        );
    }
  }, []);

  // Simulated AI validation
  const runAIAssessment = async () => {
    setAiStatus({ loading: true, riskLevel: null, suggestions: [], message: '' });
    await new Promise((r) => setTimeout(r, 2000)); // simulate delay

    const random = Math.random();
    if (random < 0.33)
      setAiStatus({
        loading: false,
        riskLevel: 'red',
        suggestions: ['ID photo unclear', 'Upload clearer selfie'],
        message: 'High Risk — Verification failed',
      });
    else if (random < 0.66)
      setAiStatus({
        loading: false,
        riskLevel: 'amber',
        suggestions: ['Address proof missing', 'Recheck date of birth'],
        message: 'Moderate Risk — Needs review',
      });
    else
      setAiStatus({
        loading: false,
        riskLevel: 'green',
        suggestions: [],
        message: 'Verified — No issues found',
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (name: string, file: File) => {
    setForm((prev) => ({
      ...prev,
      [name]: URL.createObjectURL(file),
    }));
  };

  const getRiskColor = () => {
    switch (aiStatus.riskLevel) {
      case 'red':
        return 'bg-red-100 text-red-700 border-red-400';
      case 'amber':
        return 'bg-yellow-100 text-yellow-700 border-yellow-400';
      case 'green':
        return 'bg-green-100 text-green-700 border-green-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User size={20} /> Personal Information (KYC)
          </h2>
          <p className="text-gray-500 text-sm">
            Please complete your identity verification. This is required for all users.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 2: Personal Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 mb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select name="title" onValueChange={handleSelectChange('title')}>
                <SelectTrigger><SelectValue placeholder="Title" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                </SelectContent>
              </Select>
              <Input name="firstName" aria-label="First Name" placeholder="First Legal Name" onChange={handleChange} className="md:col-span-2" />
              <Input name="middleName" aria-label="Middle Name" placeholder="Middle Name (Optional)" onChange={handleChange} />
              <Input name="lastName" aria-label="Last Name" placeholder="Last Legal Name" onChange={handleChange} className="md:col-span-2" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor='dateOfBirth'>Date of Birth</label>
                    <Input name="dateOfBirth" type="date" aria-label="Date of Birth" onChange={handleChange} id='dateOfBirth' />
                </div>
                <Select name="gender" onValueChange={handleSelectChange('gender')}>
                    <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select name="nationality" onValueChange={handleSelectChange('nationality')}>
                <SelectTrigger><SelectValue placeholder="Nationality" /></SelectTrigger>
                <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
               <Select name="idType" onValueChange={handleSelectChange('idType')}>
                <SelectTrigger><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="National ID">National ID</SelectItem>
                  <SelectItem value="Driver’s License">Driver’s License</SelectItem>
                  <SelectItem value="Residence Permit">Residence Permit</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <Input name="idNumber" placeholder="ID Number (OCR will auto-fill)" onChange={handleChange} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor='idIssueDate'>ID Issue Date</label>
                    <Input name="idIssueDate" type="date" aria-label="ID Issue Date" onChange={handleChange} id='idIssueDate' />
                </div>
                <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor='idExpiryDate'>ID Expiry Date</label>
                    <Input name="idExpiryDate" type="date" aria-label="ID Expiry Date" onChange={handleChange} id='idExpiryDate' />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-600">Upload ID Document</label>
                    <div className="flex items-center mt-2 space-x-3">
                        <Input type="file" onChange={(e) => e.target.files && handleFileUpload("idDocumentUrl", e.target.files[0])} />
                        {form.idDocumentUrl && <Image src={form.idDocumentUrl} alt="ID Preview" width={64} height={40} className="h-10 w-16 object-cover rounded-md" />}
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-600">Upload Selfie (for Liveness)</label>
                    <div className="flex items-center mt-2 space-x-3">
                        <Input type="file" onChange={(e) => e.target.files && handleFileUpload("selfieUrl", e.target.files[0])} />
                        {form.selfieUrl && <Image src={form.selfieUrl} alt="Selfie Preview" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />}
                    </div>
                </div>
            </div>
          </div>

          {/* Step 3: Address & Location */}
          <div className="col-span-2 border-t pt-6 mt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Address & Location</h3>
            <div className="space-y-4">
              <Input name="addressLine1" placeholder="Address Line 1" onChange={handleChange} />
              <Input name="addressLine2" placeholder="Address Line 2 (Optional)" onChange={handleChange} />
              <div className="grid md:grid-cols-3 gap-4">
                <Input name="city" placeholder="City" onChange={handleChange} />
                <Input name="province" placeholder="Province/State" onChange={handleChange} />
                <Input name="postalCode" placeholder="Postal Code" onChange={handleChange} />
              </div>
              <Select name="country" onValueChange={handleSelectChange('country')}>
                <SelectTrigger><SelectValue placeholder="Select Country of Residence" /></SelectTrigger>
                <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                <MapPin size={18} />
                {form.currentLocation ? (
                  <span>GPS Captured: {form.currentLocation.lat.toFixed(3)}, {form.currentLocation.lng.toFixed(3)}</span>
                ) : (
                  "Fetching location..."
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Upload Proof of Address</label>
                <div className="flex items-center mt-2 space-x-3">
                  <Input type="file" onChange={(e) => e.target.files && handleFileUpload("proofOfAddressUrl", e.target.files[0])} />
                  {form.proofOfAddressUrl && <Image src={form.proofOfAddressUrl} alt="Proof Preview" width={64} height={40} className="h-10 w-16 object-cover rounded-md" />}
                </div>
                 <p className="text-xs text-muted-foreground mt-1">Utility bill or bank statement no older than 3 months.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Shield size={18} /> AI Smart Verification</h2>
            <Button onClick={runAIAssessment} disabled={aiStatus.loading}>
              {aiStatus.loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
              Run AI Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`border p-4 rounded-xl mt-2 ${getRiskColor()}`}>
            {aiStatus.loading ? (
              <p>Running AI verification...</p>
            ) : aiStatus.message ? (
              <>
                <p className="font-semibold">{aiStatus.message}</p>
                {aiStatus.suggestions.length > 0 && (
                  <ul className="list-disc pl-5 text-sm mt-2">
                    {aiStatus.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p>No AI check has been run yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-right">
        <Button onClick={() => onSubmit(form)}>
          Submit KYC Information
        </Button>
      </div>
    </div>
  );
}

const investorProfileSchema = z.object({
  risk_tolerance: z.enum(['low', 'medium', 'high']).optional(),
  min_investment: z.coerce.number().optional(),
  max_investment: z.coerce.number().optional(),
  preferred_categories: z.array(z.string()).optional(),
  preferred_countries: z.array(z.string()).optional(),
  preferred_investment_types: z.array(z.enum(['Equity', 'Royalty'])).optional(),
  ai_recommendation_opt_in: z.boolean().default(true).optional(),
});

function InvestorProfileForm({ onSubmit, user }: { onSubmit: (data: any) => void, user: AppUser | null }) {
    const form = useForm<z.infer<typeof investorProfileSchema>>({
      resolver: zodResolver(investorProfileSchema),
      defaultValues: {
        risk_tolerance: user?.risk_tolerance || 'medium',
        min_investment: user?.min_investment || undefined,
        max_investment: user?.max_investment || undefined,
        preferred_categories: user?.preferred_categories || [],
        preferred_countries: user?.preferred_countries || [],
        preferred_investment_types: user?.preferred_investment_types || [],
        ai_recommendation_opt_in: user?.ai_recommendation_opt_in ?? true,
      }
    });

    const categoryOptions = projectCategories.map(cat => ({ label: cat, value: cat }));
    const countryOptions = countries.map(c => ({ label: c, value: c }));

    return (
        <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Individual Investor</AlertTitle>
              <AlertDescription>
                As a private individual investor, business verification is not required. You must still complete identity verification (KYC) before investing or when requested.
              </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Wallet size={20} /> Investment Profile
                    </h2>
                    <p className="text-gray-500 text-sm">Help us tailor project recommendations to your preferences.</p>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="risk_tolerance" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Risk Tolerance</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select your risk appetite" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                         <FormField control={form.control} name="preferred_investment_types" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Funding Types</FormLabel>
                               <MultiSelect
                                options={[{label: 'Equity', value: 'Equity'}, {label: 'Royalty', value: 'Royalty'}]}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Select funding types..."
                                className="w-full"
                              />
                            </FormItem>
                        )} />
                      </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="min_investment" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Investment</FormLabel>
                              <FormControl><Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} /></FormControl>
                            </FormItem>
                          )} />
                           <FormField control={form.control} name="max_investment" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Investment</FormLabel>
                              <FormControl><Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ''} /></FormControl>
                            </FormItem>
                          )} />
                       </div>

                      <div>
                          <FormField control={form.control} name="preferred_categories" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Categories</FormLabel>
                                <MultiSelect
                                  options={categoryOptions}
                                  selected={field.value || []}
                                  onChange={field.onChange}
                                  placeholder="Select your preferred categories..."
                                  className="w-full"
                                />
                              </FormItem>
                          )} />
                      </div>

                       <div>
                          <FormField control={form.control} name="preferred_countries" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Countries</FormLabel>
                                <MultiSelect
                                  options={countryOptions}
                                  selected={field.value || []}
                                  onChange={field.onChange}
                                  placeholder="Select countries you are interested in..."
                                  className="w-full"
                                />
                              </FormItem>
                          )} />
                      </div>

                       <FormField control={form.control} name="ai_recommendation_opt_in" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">AI Project Recommendations</FormLabel>
                              <FormDescription>
                                Receive email and dashboard notifications for new projects that match your profile.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )} />

                       <div className="text-right">
                          <Button type="submit">Save Investor Profile</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function BusinessProfileForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    companyName: '',
    registrationNumber: '',
    country: '',
    businessType: '',
    sector: '',
    businessRegDocUrl: '',
    proofOfAddressUrl: '',
    companyTaxId: '',
    website: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (name: string, file: File) => {
    setForm((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile (KYB)</CardTitle>
          <CardDescription>
            Provide details about your legal entity to complete verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="companyName"
            placeholder="Legal Entity Name"
            onChange={handleChange}
          />
          <Input
            name="registrationNumber"
            placeholder="Business Registration Number"
            onChange={handleChange}
          />
          <Select name="country" onValueChange={handleSelectChange('country')}>
            <SelectTrigger>
              <SelectValue placeholder="Incorporation Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            name="businessType"
            onValueChange={handleSelectChange('businessType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SME">SME</SelectItem>
              <SelectItem value="Startup">Startup</SelectItem>
              <SelectItem value="Cooperative">Cooperative</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
            </SelectContent>
          </Select>
          <Select name="sector" onValueChange={handleSelectChange('sector')}>
            <SelectTrigger>
              <SelectValue placeholder="Industry Sector" />
            </SelectTrigger>
            <SelectContent>
              {projectCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="companyTaxId"
            placeholder="Company Tax ID"
            onChange={handleChange}
          />
          <Input
            name="website"
            placeholder="Website / Social Media URL"
            onChange={handleChange}
          />

          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium">Registration Document</label>
            <Input
              type="file"
              onChange={(e) =>
                e.target.files &&
                handleFileUpload('businessRegDocUrl', e.target.files[0])
              }
            />
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">Proof of Business Address</label>
            <Input
              type="file"
              onChange={(e) =>
                e.target.files &&
                handleFileUpload('proofOfAddressUrl', e.target.files[0])
              }
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-right">
        <Button onClick={() => onSubmit(form)}>Submit Business Profile</Button>
      </div>
    </div>
  );
}


export default function AccountSettingsPage() {
  const user = useUser();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const role = user?.role || 'Investor';

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user, profileForm]);

  const payoutForm = useForm<PayoutFormValues>({ resolver: zodResolver(payoutFormSchema), defaultValues: { bankName: '', accountHolderName: '', accountNumber: '', swiftCode: '' } });
  const securityForm = useForm<SecurityFormValues>({ resolver: zodResolver(securityFormSchema), defaultValues: { twoFactorEnabled: false } });
  const settingsForm = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues: { language: 'en', timezone: 'gmt-5', emailNotifications: true } });

  const isInvestor = role === 'Investor';
  const isProjectOwner = role === 'ProjectOwner';

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return;
    try {
      await updateUser(user.id, {
        displayName: data.displayName,
        bio: data.bio
      });
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    } catch (error) {
       toast({ title: 'Update Failed', description: 'Could not save profile changes.', variant: 'destructive'});
    }
  }
  function onSettingsSubmit(data: SettingsFormValues) { toast({ title: 'Settings Updated', description: 'Your settings have been saved.' }); }
  function onPayoutSubmit(data: PayoutFormValues) { toast({ title: 'Payout Details Updated', description: 'Your payout information has been saved.' }); }
  function onSecuritySubmit(data: SecurityFormValues) { toast({ title: 'Security Settings Updated', description: `Two-Factor Authentication has been ${data.twoFactorEnabled ? 'enabled' : 'disabled'}.` }); }
  function onKycSubmit(data: any) {
    console.log("KYC Data submitted:", data);
    toast({ title: 'KYC Information Submitted', description: 'Your documents are now under review.' });
  }
   async function onInvestorProfileSubmit(data: any) {
    if (!user) return;
    try {
      await updateUser(user.id, data);
      toast({ title: 'Investor Profile Saved', description: 'Your investment preferences have been updated.' });
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Could not save investor profile.', variant: 'destructive'});
    }
  }
  function onDeleteAccount() { console.log('Account deletion initiated.'); }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      toast({ title: 'Avatar Updated' });
    }
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      toast({ title: 'Cover Image Updated' });
    }
  };

  if (!user) return <Loader2 className="h-8 w-8 animate-spin mx-auto my-12" />;

  const displayName = user.displayName || user.email || 'User';
  
  const coverImage = getPlaceholderImage(user.coverImageHint || 'fallback');
  const avatarImage = getPlaceholderImage(user.avatarHint || 'user-avatar-4');


  return (
    <div className="space-y-6">
      <div className="relative h-48 w-full rounded-lg bg-card group">
         <Image src={coverPreview || coverImage.imageUrl} alt="Cover image" fill className="object-cover rounded-lg" data-ai-hint={coverImage.imageHint}/>
        <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={avatarPreview || avatarImage.imageUrl} alt={displayName} data-ai-hint={avatarImage.imageHint} />
              <AvatarFallback className="text-3xl">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity" onClick={() => avatarInputRef.current?.click()}>
              <Pencil className="h-6 w-6" />
            </label>
            <input ref={avatarInputRef} id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
           <div className="pb-2">
              <h1 className="text-2xl font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]">{displayName}</h1>
              <p className="text-sm text-gray-200 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]">{user.email}</p>
          </div>
        </div>
         <Button size="sm" variant="outline" className="absolute top-4 right-4 bg-background/70 hover:bg-background" onClick={() => coverInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />Edit Cover
          </Button>
          <input ref={coverInputRef} id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

       <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="delete_account">Delete Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
            <Card><CardHeader><CardTitle>Public Profile</CardTitle><CardDescription>This is how others will see you on the site.</CardDescription></CardHeader>
                <CardContent>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                    <FormField control={profileForm.control} name="displayName" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Your email" {...field} disabled /></FormControl><p className="text-sm text-muted-foreground">You can't change your email address.</p><FormMessage /></FormItem>)} />
                    <FormField control={profileForm.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit">Update profile</Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="verification">
             <Card>
                <CardHeader>
                    <CardTitle>Verification Center</CardTitle>
                    <CardDescription>Complete your identity and profile verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <PersonalDataForm userType={isProjectOwner ? 'owner' : 'investor'} onSubmit={onKycSubmit} />
                    {isInvestor && <InvestorProfileForm user={user} onSubmit={onInvestorProfileSubmit} />}
                    {isProjectOwner && <BusinessProfileForm onSubmit={onKycSubmit} />}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payouts">
            {isProjectOwner ? (
                user && <StripeOnboard user={user} />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Payout Details</CardTitle>
                        <CardDescription>Manage your bank account for receiving royalty payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...payoutForm}>
                            <form onSubmit={payoutForm.handleSubmit(onPayoutSubmit)} className="space-y-8">
                                <FormField control={payoutForm.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., Global Bank Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={payoutForm.control} name="accountHolderName" render={({ field }) => (<FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <FormField control={payoutForm.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>Account Number / IBAN</FormLabel><FormControl><Input placeholder="Enter account number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={payoutForm.control} name="swiftCode" render={({ field }) => (<FormItem><FormLabel>SWIFT / BIC Code</FormLabel><FormControl><Input placeholder="Enter SWIFT or BIC code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Button type="submit">Save Payout Details</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
         <TabsContent value="security">
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-8">
                            <FormField
                                control={securityForm.control}
                                name="twoFactorEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                        Add an extra layer of security to your account.
                                        </p>
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
                            <Button type="submit">Update Security Settings</Button>
                        </form>
                   </Form>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="settings">
            <Card><CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Manage your language, timezone, and notification preferences.</CardDescription></CardHeader>
                <CardContent>
                   <Form {...settingsForm}>
                        <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-8">
                            <FormField control={settingsForm.control} name="language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem><SelectItem value="fr">Français</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={settingsForm.control} name="timezone" render={({ field }) => (<FormItem><FormLabel>Timezone</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a timezone" /></SelectTrigger></FormControl><SelectContent><SelectItem value="gmt-5">Eastern Time (GMT-5)</SelectItem><SelectItem value="gmt-8">Pacific Time (GMT-8)</SelectItem><SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={settingsForm.control} name="emailNotifications" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel className="text-base">Email Notifications</FormLabel><p className="text-sm text-muted-foreground">Receive emails about project updates and platform news.</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                             <Button type="submit">Update settings</Button>
                        </form>
                   </Form>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="delete_account">
            <Card className="border-destructive"><CardHeader><CardTitle>Delete Account</CardTitle><CardDescription>Permanently remove your account and all of your content from the platform. This action is not reversible.</CardDescription></CardHeader>
                <CardFooter className="flex justify-start">
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive">Delete Account</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={onDeleteAccount}>Continue</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
