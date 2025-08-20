
'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, Download, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { enhanceSketchWithAI } from '@/ai/flows/enhance-sketch-with-ai';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageEnhancerPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setOriginalImage(event.target.result as string);
        setEnhancedImage(null); // Reset enhanced image on new upload
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleEnhance = async () => {
    if (!originalImage) {
      toast({
        variant: 'destructive',
        title: 'No Image Uploaded',
        description: 'Please upload an image to enhance.',
      });
      return;
    }

    setIsProcessing(true);
    setEnhancedImage(null);
    toast({
      title: 'Enhancing Image...',
      description: 'Sasha is working its magic. Please wait.',
    });

    try {
      const result = await enhanceSketchWithAI({
        sketchDataUri: originalImage,
        prompt: 'Enhance this image. Improve its quality, clarity, color, and lighting in a photorealistic style. Make it look like a high-resolution photograph.',
      });
      setEnhancedImage(result.enhancedImageDataUri);
      toast({
        title: 'Enhancement Complete!',
        description: 'Your image has been successfully enhanced.',
      });
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description: 'Sorry, I was unable to enhance the image this time.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'sasha-ai-enhanced-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 shadow-lg">
                <Wand2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">AI Image Enhancer</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Upload an image and let Sasha AI improve its quality, clarity, and color automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4 text-center">
                 <h3 className="text-xl font-semibold">Original</h3>
                 <div className="relative w-full aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    {originalImage ? (
                        <Image src={originalImage} alt="Original" layout="fill" objectFit="contain" className="rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="w-10 h-10" />
                            <p>Upload an image to start</p>
                        </div>
                    )}
                 </div>
                 <Button onClick={handleUploadClick} variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                 </Button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

               <div className="space-y-4 text-center">
                 <h3 className="text-xl font-semibold">Enhanced</h3>
                 <div className="relative w-full aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    {isProcessing && <Skeleton className="w-full h-full" />}
                    {!isProcessing && enhancedImage && (
                        <Image src={enhancedImage} alt="Enhanced" layout="fill" objectFit="contain" className="rounded-lg" />
                    )}
                    {!isProcessing && !enhancedImage && (
                         <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Sparkles className="w-10 h-10" />
                            <p>Your enhanced image will appear here</p>
                        </div>
                    )}
                 </div>
                 <Button onClick={handleDownload} disabled={!enhancedImage || isProcessing} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Enhanced Image
                 </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleEnhance} disabled={!originalImage || isProcessing} size="lg" className="w-full shadow-lg">
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Enhance Image
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
