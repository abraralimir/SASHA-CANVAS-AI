'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Image as ImageIcon, CornerDownLeft } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SashaChatProps {
  messages: ChatMessage[];
  onSubmit: (prompt: string) => void;
  onImageSelect: (dataUri: string) => void;
  isMobile: boolean;
  onClose: () => void;
}

export default function SashaChat({
  messages,
  onSubmit,
  onImageSelect,
  isMobile,
  onClose,
}: SashaChatProps) {
  const [prompt, setPrompt] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt);
    setPrompt('');
  };
  
  const ChatBubble = ({ msg }: { msg: ChatMessage }) => {
    const isAssistant = msg.role === 'assistant';
    return (
      <div className={cn("flex items-start gap-3 my-4", isAssistant ? "" : "flex-row-reverse")}>
        <Avatar className="w-8 h-8">
          <AvatarFallback>{isAssistant ? <Bot /> : 'U'}</AvatarFallback>
        </Avatar>
        <div className={cn(
          "max-w-[75%] rounded-lg p-3 text-sm",
          isAssistant ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
        )}>
          {msg.isLoading ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Thinking...</span>
            </div>
          ) : (
            <p>{msg.content}</p>
          )}
          {msg.imageUrl && (
            <div className="mt-2 relative group">
              <Image src={msg.imageUrl} alt="Generated image" width={256} height={256} className="rounded-md border" data-ai-hint="abstract painting" />
              <Button size="sm" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onImageSelect(msg.imageUrl!)}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Add to Canvas
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };


  const ChatContainer = (
      <div className="flex h-full flex-col bg-card border-l">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Sasha AI</h2>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </header>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4">
            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground mt-8">
                    <Sparkles className="mx-auto h-12 w-12 mb-4"/>
                    <p>Describe an image you want to create!</p>
                    <p className="text-xs mt-2">e.g., "A robot painting a sunset"</p>
                </div>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Sasha to draw something..."
              className="pr-12"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              variant="primary"
              style={{backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'}}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
  )

  if (isMobile) {
    return (
      <div className="absolute inset-0 z-50 bg-background md:hidden">
        {ChatContainer}
      </div>
    )
  }

  return ChatContainer;
}
