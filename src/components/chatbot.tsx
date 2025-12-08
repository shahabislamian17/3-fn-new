
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send } from 'lucide-react';
import { useUser } from '@/firebase';
import { cn, getInitials } from '@/lib/utils';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import type { User as AppUser } from '@/lib/types';
import { chatAssistant } from '@/ai/flows/assistant-flow';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
        id: '1',
        role: 'model',
        content: "Hello! I'm your AI assistant for 3JN CrowdFunding. How can I help you today?",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const { i18n } = useTranslation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // This is a stand-in. In a real app, role would come from the user object after a DB fetch.
  const appUser = user as AppUser | null;
  const role = appUser?.role || 'Investor';

  useEffect(() => {
    if(scrollAreaRef.current){
        setTimeout(() => {
             if(scrollAreaRef.current) {
                scrollAreaRef.current.scrollTo({
                    top: scrollAreaRef.current.scrollHeight,
                    behavior: 'smooth'
                });
             }
        }, 100);
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { id: nanoid(), role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
        const history = currentMessages.map(m => ({ role: m.role, content: m.content }));
        
        const result = await chatAssistant({
              history: history.slice(0, -1),
              userRole: role,
              language: i18n.language,
        });

        const modelMessage: Message = { id: nanoid(), role: 'model', content: result.message || "Sorry, I couldn't get a response." };
        setMessages((prev) => [...prev, modelMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { id: nanoid(), role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;
  
  const displayName = user.displayName || user.email || 'User';

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-7 w-7" />
        <span className="sr-only">Open Chatbot</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot />
              AI Assistant
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto -mr-6 pr-6" ref={scrollAreaRef}>
             <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === 'model' ? (
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={user.photoURL || ''} alt={displayName} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      'rounded-lg p-3 text-sm max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                     <Avatar className="h-8 w-8">
                         <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
                     </Avatar>
                     <div className="rounded-lg p-3 text-sm bg-secondary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                     </div>
                 </div>
              )}
            </div>
          </div>
          <SheetFooter>
            <form onSubmit={handleSubmit} className="relative w-full">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
