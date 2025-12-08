
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateFinancialProjections, type GenerateFinancialProjectionsOutput } from '@/ai/flows/generate-financial-projections';
import { FileText, Loader2, Sheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { useToast } from '@/hooks/use-toast';
import { projectCategories } from '@/lib/data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formSchema = z.object({
  industry: z.string().min(2, { message: 'Industry is required.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  currency: z.string().min(2, { message: 'Currency is required.' }),
  projectDescription: z.string().min(50, { message: 'Please provide a detailed project description of at least 50 characters.' }),
  historicalRevenue: z.coerce.number().optional(),
  headcount: z.coerce.number().min(1, { message: 'Headcount must be at least 1.' }),
  plannedCapex: z.coerce.number().min(0),
  grossMarginAssumptions: z.coerce.number().min(0).max(100),
  pricingModel: z.string().min(2, { message: 'Pricing model is required.' }),
  customerAcquisitionCost: z.coerce.number().min(0),
  retentionMetrics: z.coerce.number().optional(),
  seasonalityFlags: z.string().min(2, { message: 'Seasonality flags are required.' }),
  taxes: z.coerce.number().min(0).max(100),
  financingCosts: z.coerce.number().min(0),
});

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};


export default function FinancialProjectionsPage() {
  const [projections, setProjections] = useState<GenerateFinancialProjectionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: '',
      country: '',
      currency: 'USD',
      projectDescription: '',
      historicalRevenue: undefined,
      headcount: 1,
      plannedCapex: 0,
      grossMarginAssumptions: 50,
      pricingModel: '',
      customerAcquisitionCost: 0,
      retentionMetrics: undefined,
      taxes: 20,
      financingCosts: 0,
      seasonalityFlags: 'N/A',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setProjections(null);
    setCurrency(values.currency);
    try {
      const result = await generateFinancialProjections(values);
      setProjections(result);
      toast({
        title: 'Projections Generated',
        description: 'Your 3-year financial forecast is ready.',
      });
    } catch (error) {
      toast({
        title: 'Error Generating Projections',
        description: 'There was an issue creating your forecast. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleExportCSV = () => {
    if (!projections) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // P&L
    csvContent += "3-Year P&L Projection\n";
    const pnlHeaders = ["Year", "Revenue", "COGS", "Gross Margin", "OpEx", "EBITDA"];
    csvContent += pnlHeaders.join(",") + "\n";
    projections.projections.forEach(row => {
        const rowData = [row.year, row.revenue, row.cogs, row.grossMargin, row.opex, row.ebitda];
        csvContent += rowData.join(",") + "\n";
    });

    csvContent += "\n";

    // Cashflow
    csvContent += "3-Year Quarterly Cashflow Forecast\n";
    const cashflowHeaders = ["Year", "Quarter", "Receipts", "Payments", "Net Cashflow"];
    csvContent += cashflowHeaders.join(",") + "\n";
    projections.cashflowForecast.forEach(row => {
        const rowData = [row.year, row.quarter, row.receipts, row.payments, row.netCashflow];
        csvContent += rowData.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_projections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!projections) return;

    const doc = new jsPDF();
    doc.text("AI-Generated Financial Projections", 14, 20);

    // P&L Table
    autoTable(doc, {
        head: [['Year', 'Revenue', 'COGS', 'Gross Margin', 'OpEx', 'EBITDA']],
        body: projections.projections.map(p => [p.year, formatCurrency(p.revenue, currency), formatCurrency(p.cogs, currency), formatCurrency(p.grossMargin, currency), formatCurrency(p.opex, currency), formatCurrency(p.ebitda, currency)]),
        startY: 30,
        headStyles: { fillColor: [0, 128, 128] }, // Teal color for header
    });
    
    // Cashflow Table
    autoTable(doc, {
        head: [['Year', 'Quarter', 'Receipts', 'Payments', 'Net Cashflow']],
        body: projections.cashflowForecast.map(p => [p.year, p.quarter, formatCurrency(p.receipts, currency), formatCurrency(p.payments, currency), formatCurrency(p.netCashflow, currency)]),
        headStyles: { fillColor: [0, 128, 128] },
    });

    // Text sections
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text("Break-Even Analysis", 14, finalY + 10);
    doc.text(projections.breakEvenAnalysis, 14, finalY + 16, { maxWidth: 180 });
    
    doc.text("Sensitivity Analysis", 14, finalY + 30);
    doc.text(projections.sensitivityAnalysis, 14, finalY + 36, { maxWidth: 180 });

    doc.save("financial_projections.pdf");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Generate Financial Projections</CardTitle>
            <CardDescription>Fill in your project's financial data to generate a 3-year forecast.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="projectDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe your business model, goals, and target market." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl><Input placeholder="e.g., USD" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="historicalRevenue" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Prior Year Revenue</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="headcount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headcount</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="plannedCapex" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned CAPEX</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="pricingModel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Model</FormLabel>
                      <FormControl><Input placeholder="e.g., Subscription, One-time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="grossMarginAssumptions" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gross Margin %</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="customerAcquisitionCost" render={({ field }) => (
                        <FormItem>
                        <FormLabel>CAC</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="seasonalityFlags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seasonality</FormLabel>
                    <FormControl><Input placeholder="e.g., Strong in Q4" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="taxes" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tax Rate %</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="financingCosts" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Financing Costs</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="retentionMetrics" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Retention Metrics %</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''}/></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Projections
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>AI-Generated Financial Projections</CardTitle>
                <CardDescription>Review the 3-year forecast. You can copy and edit the data as needed.</CardDescription>
              </div>
              {projections && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCSV}><Sheet className="mr-2 h-4 w-4" /> CSV</Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}><FileText className="mr-2 h-4 w-4" /> PDF</Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Generating your financial forecast...</p>
                </div>
              </div>
            )}
            {projections && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">3-Year P&L Projection</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">COGS</TableHead>
                        <TableHead className="text-right">Gross Margin</TableHead>
                        <TableHead className="text-right">OpEx</TableHead>
                        <TableHead className="text-right">EBITDA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projections.projections.map((item) => (
                        <TableRow key={item.year}>
                          <TableCell className="font-medium">Year {item.year}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.revenue, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.cogs, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.grossMargin, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.opex, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.ebitda, currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                 <div>
                  <h3 className="text-lg font-semibold mb-2">3-Year Quarterly Cashflow Forecast</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead className="text-right">Receipts</TableHead>
                        <TableHead className="text-right">Payments</TableHead>
                        <TableHead className="text-right">Net Cashflow</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projections.cashflowForecast.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.year}</TableCell>
                          <TableCell>{item.quarter}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.receipts, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.payments, currency)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.netCashflow, currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Break-Even Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{projections.breakEvenAnalysis}</p>
                    </CardContent>
                </Card>
                 <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Repayment Schedule (Royalty)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{projections.repaymentSchedule}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Equity Valuation Path</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{projections.equityValuationPath}</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sensitivity Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{projections.sensitivityAnalysis}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Key Assumptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                            {projections.assumptions.map((assumption, i) => <li key={i}>{assumption}</li>)}
                        </ul>
                    </CardContent>
                </Card>
              </div>
            )}
            {!isLoading && !projections && (
              <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">Your generated financial projections will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
