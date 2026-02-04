import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

interface AICopilotProps {
  onSendMessage?: (message: string) => Promise<string>;
}

export function AICopilot({ onSendMessage }: AICopilotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m FlowPilot AI. I can help you analyze team productivity, identify bottlenecks, and suggest workflow improvements. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      if (onSendMessage) {
        response = await onSendMessage(input.trim());
      } else {
        // Default mock response
        response = 'I\'m analyzing your team\'s data. Based on recent patterns, I recommend focusing on reducing meeting overhead and protecting focus time for developers.';
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-hover bg-gradient-primary hover:scale-110 transition-transform duration-200 animate-pulse-slow z-50"
        size="icon"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 glass-card">
          <DialogHeader className="px-6 py-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Team Copilot
            </DialogTitle>
          </DialogHeader>

          <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.timestamp && (
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-accent-foreground">You</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass-card rounded-lg px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about team productivity, bottlenecks, or workflow improvements..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
