'use server';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Paintbrush, Sparkles, Wand2, Image as ImageIcon, Lightbulb } from 'lucide-react';
import { generateImageFromText } from '@/ai/flows/generate-image-from-text';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon, title, description, imageUrl }: { icon: React.ReactNode, title: string, description: string, imageUrl: string }) => (
    <div className="flex flex-col items-center text-center gap-4 p-1">
      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-primary/20 shadow-lg">
        <Image
          src={imageUrl}
          alt={title}
          fill
          objectFit="cover"
          data-ai-hint="abstract technology"
        />
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary -mt-8 bg-background border-4 border-background">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
);

export default async function AboutPage() {
  const headerImagePrompt = 'An awe-inspiring, vibrant, and abstract digital painting that represents the concept of creative artificial intelligence. Use a mix of swirling cosmic nebulae and intricate geometric patterns. The color palette should be rich with deep purples, electric blues, and gold highlights, evoking a sense of wonder and possibility.';
  const showcaseImagePrompt = "A breathtaking, hyper-detailed oil painting of a whimsical, bioluminescent forest at twilight. A crystal-clear river flows through the center, reflecting the glowing flora and a sky filled with two moons. The style should be reminiscent of Thomas Kinkade and Hayao Miyazaki, combining magical realism with a cozy, inviting atmosphere.";
  
  const [
    { image: headerImageUrl }, 
    { image: showcaseImageUrl },
  ] = await Promise.all([
    generateImageFromText({ prompt: headerImagePrompt }),
    generateImageFromText({ prompt: showcaseImagePrompt }),
  ]);
  
  return (
    <div className="relative h-full w-full">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src={headerImageUrl}
          alt="AI-generated artwork representing creativity"
          fill
          objectFit="cover"
          className="animate-space-pan"
          data-ai-hint="abstract painting"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>
      <div className="h-full overflow-y-auto p-4 md:p-8 animate-fade-in-up">
        <div className="max-w-4xl mx-auto space-y-12">
            <Card className="overflow-hidden bg-transparent border-none shadow-none text-center">
                <CardHeader className="p-8">
                    <div className="flex flex-col items-center gap-4">
                       <div className="p-3 rounded-full bg-primary/20 border-4 border-background shadow-lg">
                           <Bot className="w-10 h-10 text-primary" />
                       </div>
                       <div>
                           <CardTitle className="text-4xl font-bold tracking-tight text-foreground">Sasha Canvas AI</CardTitle>
                           <p className="text-xl text-muted-foreground mt-1">Your Creative Partner for Digital Art</p>
                       </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4 text-lg">
                     <p className="leading-relaxed">
                        Welcome to <span className="font-semibold text-primary">Sasha Canvas AI</span>, an intelligent drawing application designed to bridge the gap between imagination and digital art. Sasha is more than just a tool; it's a creative partner that helps you generate, refine, and bring your ideas to life with the power of artificial intelligence.
                    </p>
                     <p className="leading-relaxed">
                        Whether you're a professional artist, a hobbyist, or just curious about AI, Sasha provides an intuitive canvas to transform your words into stunning visuals.
                    </p>
                </CardContent>
                <CardFooter className="bg-transparent px-8 py-4 flex justify-center">
                    <Button asChild size="lg" className="w-full md:w-auto shadow-lg" variant="primary">
                        <Link href="/canvas">
                            Try Sasha Now
                            <Sparkles className="ml-2 h-5 w-5"/>
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            
            <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="text-center">
                    <CardTitle>Inspiration Showcase</CardTitle>
                    <CardDescription>See what's possible with a single prompt.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative w-full aspect-video overflow-hidden rounded-lg shadow-2xl border border-primary/20">
                        <Image
                            src={showcaseImageUrl}
                            alt="AI-generated showcase painting"
                            fill
                            objectFit="cover"
                            data-ai-hint="fantasy landscape"
                        />
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <h4 className="font-semibold text-lg flex items-center justify-center gap-2"><Lightbulb className="w-5 h-5 text-primary"/> Prompt:</h4>
                        <p className="text-muted-foreground italic mt-2 text-center">"{showcaseImagePrompt}"</p>
                    </div>
                </CardContent>
            </Card>


             <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="text-center">
                    <CardTitle>Core Features</CardTitle>
                    <CardDescription>Explore what you can do with Sasha</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-12 pt-8">
                   <FeatureCard
                        icon={<ImageIcon className="h-6 w-6" />}
                        title="Text-to-Image Generation"
                        description="Start with a blank canvas and a simple text prompt. Sasha will generate a high-quality image based on your description."
                        imageUrl="https://placehold.co/600x400.png"
                   />
                   <FeatureCard
                        icon={<Wand2 className="h-6 w-6" />}
                        title="Intelligent Editing & Enhancement"
                        description="Use natural language to request edits—change colors, add elements, or alter the style of any image on the canvas."
                        imageUrl="https://placehold.co/600x400.png"
                   />
                   <FeatureCard
                        icon={<Paintbrush className="h-6 w-6" />}
                        title="Full-Featured Drawing Toolkit"
                        description="Take full manual control with a classic set of drawing tools like brushes, shapes, an eraser, and a color picker."
                        imageUrl="https://placehold.co/600x400.png"
                   />
                   <FeatureCard
                        icon={<Sparkles className="h-6 w-6" />}
                        title="AI-Powered Eraser"
                        description="Seamlessly remove objects or imperfections from your images. The AI will intelligently fill in the background."
                        imageUrl="https://placehold.co/600x400.png"
                   />
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
