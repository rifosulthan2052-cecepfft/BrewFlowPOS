
'use client';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarTrigger,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { BookOpen, Coffee, History, Utensils, Home, Users, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

type AppLayoutProps = {
    children: React.ReactNode;
};

const AppLayoutContext = React.createContext<{ header: React.ReactNode, content: React.ReactNode }>({ header: null, content: null });

export function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const childrenArray = React.Children.toArray(children);
    const header = childrenArray.find(child => (child as React.ReactElement).type === AppLayoutHeader);
    const content = childrenArray.find(child => (child as React.ReactElement).type === AppLayoutContent);

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/'} >
                                <Link href="/"><Home /> Cashier</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/open-bills'}>
                                <Link href="/open-bills"><BookOpen /> Open Bills</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/membership'}>
                                <Link href="/membership"><Users /> Membership</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/menu'}>
                                <Link href="/menu"><Utensils /> Menu</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/order-history'}>
                                <Link href="/order-history"><History /> Order History</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                                <Link href="/settings"><Settings /> Settings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    {/* Footer content if any */}
                </SidebarFooter>
            </Sidebar>
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                {header}
                <main className="flex-1 overflow-y-auto bg-secondary/30">
                    {content}
                </main>
            </div>
        </SidebarProvider>
    )
}

function AppLayoutHeader({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
AppLayoutHeader.displayName = 'AppLayoutHeader';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
AppLayoutContent.displayName = 'AppLayoutContent';


AppLayout.Header = AppLayoutHeader;
AppLayout.Content = AppLayoutContent;
