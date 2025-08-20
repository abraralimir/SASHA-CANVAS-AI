
'use server';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Paintbrush, Sparkles, Wand2, Image as ImageIcon, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FeatureCard = ({ icon, title, description, imageUrl, 'data-ai-hint': dataAiHint }: { icon: React.ReactNode, title: string, description: string, imageUrl: string, 'data-ai-hint': string }) => (
    <Card className="overflow-visible bg-transparent border-none shadow-none text-center flex flex-col">
      <CardHeader className="p-0 mb-8 flex-shrink-0">
        <div className="relative w-full h-48">
           <Image
              src={imageUrl}
              alt={title}
              fill
              data-ai-hint={dataAiHint}
              className="object-cover rounded-lg border border-primary/20 shadow-lg"
           />
        </div>
      </CardHeader>
      <CardContent className="relative p-4 flex flex-col items-center gap-2 flex-grow">
         <div className="absolute -top-16 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-primary border-4 border-background shadow-md">
            {icon}
         </div>
         <h3 className="text-lg font-semibold mt-2">{title}</h3>
         <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
);

export default async function AboutPage() {
  const headerImageUrl = "/images/about/header.jpg";
  const showcaseImageUrl = "/images/about/showcase.png";
  const textToImageUrl = "/images/about/feature-text-to-image.png";
  const intelligentEditingUrl = "/images/about/feature-intelligent-editing.png";
  const drawingToolkitUrl = "/images/about/feature-drawing-toolkit.png";
  const aiEraserUrl = "/images/about/feature-ai-eraser.png";
  const imageEnhancerUrl = "https://placehold.co/600x400/1e293b/93c5fd.png";
  
  const showcaseImagePrompt = "A breathtaking, hyper-detailed oil painting of a whimsical, bioluminescent forest at twilight. A crystal-clear river flows through the center, reflecting the glowing flora and a sky filled with two moons. The style should be reminiscent of Thomas Kinkade and Hayao Miyazaki, combining magical realism with a cozy, inviting atmosphere.";

  return (
    <div className="relative h-full w-full">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src={headerImageUrl}
          alt="AI-generated artwork representing creativity"
          fill
          objectFit="cover"
          className="animate-space-pan"
          data-ai-hint="abstract painting space"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>
      <div className="h-full overflow-y-auto p-4 md:p-8 animate-fade-in-up">
        <div className="max-w-5xl mx-auto space-y-12">
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
                <CardFooter className="bg-transparent px-8 py-4 flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild size="lg" className="w-full sm:w-auto shadow-lg" variant="primary">
                        <Link href="/canvas">
                            Try Sasha Now
                            <Sparkles className="ml-2 h-5 w-5"/>
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="w-full sm:w-auto shadow-lg" variant="secondary">
                        <Link href="/enhancer">
                            Try Image Enhancer
                            <Wand2 className="ml-2 h-5 w-5"/>
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
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pt-8">
                   <FeatureCard
                        icon={<ImageIcon className="h-6 w-6" />}
                        title="Text-to-Image Generation"
                        description="Start with a blank canvas and a simple text prompt. Sasha will generate a high-quality image based on your description."
                        imageUrl={textToImageUrl}
                        data-ai-hint="text to image"
                   />
                   <FeatureCard
                        icon={<Wand2 className="h-6 w-6" />}
                        title="Intelligent Editing & Enhancement"
                        description="Use natural language to request edits—change colors, add elements, or alter the style of any image on the canvas."
                        imageUrl={intelligentEditingUrl}
                        data-ai-hint="intelligent editing"
                   />
                   <FeatureCard
                        icon={<Paintbrush className="h-6 w-6" />}
                        title="Full-Featured Drawing Toolkit"
                        description="Take full manual control with a classic set of drawing tools like brushes, shapes, an eraser, and a color picker."
                        imageUrl={drawingToolkitUrl}
                        data-ai-hint="drawing tools"
                   />
                   <FeatureCard
                        icon={<Sparkles className="h-6 w-6" />}
                        title="AI-Powered Eraser"
                        description="Seamlessly remove objects or imperfections from your images. The AI will intelligently fill in the background."
                        imageUrl={aiEraserUrl}
                        data-ai-hint="ai eraser"
                   />
                    <FeatureCard
                        icon={<Sparkles className="h-6 w-6" />}
                        title="AI Image Enhancer"
                        description="Upload any image and let our AI improve its quality, clarity, color, and lighting automatically."
                        imageUrl={imageEnhancerUrl}
                        data-ai-hint="ai enhancer"
                   />
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
