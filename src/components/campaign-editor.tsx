
'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Upload, X, PlusCircle, Video, FileText } from 'lucide-react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const campaignEditorSchema = z.object({
  longDescription: z.string().min(100, "Please provide a detailed description of at least 100 characters."),
  videoUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  faqs: z.array(z.object({
    question: z.string().min(1, "Question cannot be empty."),
    answer: z.string().min(1, "Answer cannot be empty."),
  })).optional(),
});

type CampaignEditorValues = z.infer<typeof campaignEditorSchema>;
type UploadedFile = { name: string; type: string; size: number };

export function CampaignEditor() {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CampaignEditorValues>({
    resolver: zodResolver(campaignEditorSchema),
    defaultValues: {
      longDescription: "Our project is dedicated to revolutionizing the way people interact with technology. By leveraging cutting-edge AI and a user-centric design, we aim to solve a common problem that affects millions daily. Our team consists of industry veterans with a proven track record of success. We are seeking funding to finalize our product development, scale our marketing efforts, and expand our team to meet the growing demand. Join us on this journey to create a more efficient and connected world.",
      videoUrl: "",
      faqs: [{ question: "What is your long-term vision?", answer: "We aim to become the industry standard within the next five years, expanding globally and continuously innovating." }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  function removeDocument(index: number) {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }

  function onSubmit(data: CampaignEditorValues) {
    console.log({ ...data, coverImage: coverPreview, documents });
    // In a real app, you would upload files and save data
    alert("Campaign details saved!");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
          <CardHeader>
            <CardTitle>Cover Image & Video</CardTitle>
            <CardDescription>Upload a compelling cover image and link a promotional video.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <FormLabel>Cover Image</FormLabel>
              <div className="mt-2 aspect-[16/9] relative w-full rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover preview" fill className="object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8" />
                    <p>Click to upload or drag and drop</p>
                    <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-background/80 hover:bg-background"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {coverPreview ? 'Change Image' : 'Upload Image'}
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>
             <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotional Video URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormDescription>Link to your campaign video on YouTube or Vimeo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Campaign Story</CardTitle>
                <CardDescription>This is your chance to tell investors why your project matters. Be detailed and persuasive.</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea
                                placeholder="Tell your story..."
                                className="resize-y min-h-[200px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions (FAQ)</CardTitle>
            <CardDescription>Add questions and answers to address common investor inquiries.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {fields.map((field, index) => (
                <Accordion key={field.id} type="single" collapsible defaultValue="item-0">
                    <AccordionItem value={`item-${index}`}>
                        <div className="flex items-center gap-2">
                           <AccordionTrigger className="flex-1">
                             <FormField
                                control={form.control}
                                name={`faqs.${index}.question`}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <Input placeholder="Enter a question" {...field} className="font-semibold" />
                                        </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </AccordionTrigger>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <AccordionContent className="pt-2">
                            <FormField
                            control={form.control}
                            name={`faqs.${index}.answer`}
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Textarea placeholder="Enter the answer" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ question: '', answer: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add FAQ
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Document Repository</CardTitle>
                <CardDescription>Upload supporting documents for investor due diligence (e.g., Pitch Deck, Financials).</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4" />
                                    <span>{doc.name}</span>
                                    <span className="text-muted-foreground">({(doc.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeDocument(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => documentsInputRef.current?.click()}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Documents
                    </Button>
                     <input
                        ref={documentsInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleDocumentChange}
                     />
                </div>
            </CardContent>
        </Card>
      </form>
    </Form>
  );
}
