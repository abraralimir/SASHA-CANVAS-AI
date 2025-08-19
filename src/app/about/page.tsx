'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Paintbrush, Sparkles, Wand2 } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
);

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 p-8">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                           <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                               <Bot />
                           </AvatarFallback>
                        </Avatar>
                        <div className="pt-2">
                           <CardTitle className="text-4xl font-bold tracking-tight">Sasha Canvas AI</CardTitle>
                           <p className="text-xl text-muted-foreground mt-1">Your Creative Partner for Digital Art</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6 text-lg">
                    <p className="leading-relaxed">
                        Welcome to <span className="font-semibold text-primary">Sasha Canvas AI</span>, an intelligent drawing application designed to bridge the gap between imagination and digital art. Sasha is more than just a tool; it's a creative partner that helps you generate, refine, and bring your ideas to life with the power of artificial intelligence.
                    </p>
                     <p className="leading-relaxed">
                        Whether you're a professional artist looking for a brainstorming companion, a hobbyist exploring new creative avenues, or someone who just wants to have fun with AI-powered art, Sasha provides a seamless and intuitive canvas. Simply describe what you want to see, and watch as Sasha transforms your words into stunning visuals.
                    </p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Core Features</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                   <FeatureCard
                        icon={<Sparkles className="h-6 w-6" />}
                        title="Text-to-Image Generation"
                        description="Start with a blank canvas and a simple text prompt. Sasha will generate a high-quality image based on your description, providing an instant foundation for your artwork."
                   />
                   <FeatureCard
                        icon={<Wand2 className="h-6 w-6" />}
                        title="Intelligent Editing & Enhancement"
                        description="Treat Sasha like a true collaborator. After generating or uploading an image, use natural language to request edits—change colors, add elements, or alter the style."
                   />
                   <FeatureCard
                        icon={<Paintbrush className="h-6 w-6" />}
                        title="Full-Featured Drawing Toolkit"
                        description="Take full manual control with a classic set of drawing tools. Use brushes, shapes, an eraser, and a color picker to refine AI generations or create from scratch."
                   />
                   <FeatureCard
                        icon={<Bot className="h-6 w-6" />}
                        title="Conversational AI Chat"
                        description="Interact with Sasha through an intuitive chat interface. Your entire creative process becomes a dialogue, making it easy to iterate and experiment."
                   />
                </CardContent>
            </Card>

        </div>
    </div>
  );
}
