'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { LogoIcon } from '@/components/icons';
import { Paintbrush, Info, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  
  return (
    <div className="flex h-screen w-screen">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <LogoIcon className="w-7 h-7 shrink-0" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              Sasha AI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem asChild>
              <Link href="/canvas">
                <SidebarMenuButton
                  isActive={pathname.startsWith('/canvas')}
                  tooltip={{ children: 'Canvas' }}
                >
                  <Paintbrush />
                  <span>Canvas</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem asChild>
              <Link href="/about">
                <SidebarMenuButton
                  isActive={pathname.startsWith('/about')}
                  tooltip={{ children: 'About Sasha' }}
                >
                  <Info />
                  <span>About</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile && (
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Sasha Canvas AI</h1>
          </header>
        )}
        <SidebarInset>
           {children}
        </SidebarInset>
      </div>
    </div>
  );
}
