
'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, Download, Wand2, Loader } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageEnhancerPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const headerImageUrl = "/header.jpg";

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

  const enhanceClientSide = useCallback((imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context.'));
            }

            // Upscale by 2x for better quality and higher pixel count
            const scaleFactor = 2;
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            // Apply a filter stack for enhancement.
            // This combination subtly improves vibrance, contrast, and perceived sharpness.
            ctx.filter = `
              contrast(110%) 
              saturate(110%) 
              brightness(105%)
            `;
            
            // Disable image smoothing for a sharper result when upscaling
            ctx.imageSmoothingEnabled = false;

            // Draw the image onto the canvas, which applies the filters
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Note: True noise reduction often requires more complex algorithms (like convolution filters)
            // or AI, but this filter stack provides a good-looking, natural enhancement that
            // improves clarity and can mask minor noise effectively.

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for enhancement. The image might be corrupt or from a protected source.'));
        };
        img.src = imageUrl;
    });
  }, []);


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
    setEnhancedImage(null); // Clear previous enhanced image
    toast({
      title: 'Enhancing Image...',
      description: 'Applying high-resolution scaling and clarity filters.',
    });

    try {
      // Use a timeout to allow the UI to update to the "Processing" state
      // before starting the potentially blocking canvas operations.
      setTimeout(async () => {
        const enhancedDataUrl = await enhanceClientSide(originalImage);
        setEnhancedImage(enhancedDataUrl);
        toast({
          title: 'Enhancement Complete!',
          description: 'Your image has been successfully enhanced.',
        });
        setIsProcessing(false);
      }, 100);

    } catch (error) {
      console.error('Error enhancing image:', error);
      toast({
        variant: 'destructive',
        title: 'Enhancement Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsProcessing(false);
    }
  };

  const addWatermarkAndDownload = (imageUrl: string) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        tempCtx.drawImage(img, 0, 0);

        // Add watermark
        const fontSize = Math.max(16, tempCanvas.width * 0.02);
        tempCtx.font = `bold ${fontSize}px Poppins, sans-serif`;
        tempCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'bottom';
        tempCtx.fillText('Generated by Sasha', tempCanvas.width / 2, tempCanvas.height - 15);

        const watermarkedImageUrl = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = watermarkedImageUrl;
        link.download = 'sasha-enhanced-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.src = imageUrl;
  };


  const handleDownload = () => {
    if (!enhancedImage) return;
    addWatermarkAndDownload(enhancedImage);
  };

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
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 shadow-lg">
                  <Wand2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Image Enhancer</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Upload an image to improve its quality, clarity, and color automatically, without AI.
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
                   <Button onClick={handleUploadClick} variant="outline" className="w-full" disabled={isProcessing}>
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
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
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
    </div>
  );
}
