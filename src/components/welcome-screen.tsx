'use client';

import { LogoIcon } from '@/components/icons';

export default function WelcomeScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground select-none">
      <div className="text-center">
        <div className="flex justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <LogoIcon className="h-16 w-16" />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent font-headline">
            Sasha Canvas AI
          </h1>
        </div>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          Unleash your creativity with an AI-powered drawing canvas.
        </p>
      </div>
    </div>
  );
}
