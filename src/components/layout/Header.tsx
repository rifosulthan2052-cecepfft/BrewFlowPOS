
'use client'

import Link from "next/link";
import { CoffeeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, UserCircle, Menu, Settings } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useApp } from "./AppProvider";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { user, signOut } = useAuth();
  const { receiptSettings } = useApp();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu />
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <CoffeeIcon className="h-8 w-8 text-primary" />
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-bold text-primary">{receiptSettings.storeName}</span>
            <span className="text-xs text-muted-foreground font-medium">by Sakato</span>
          </div>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url || "https://placehold.co/100x100"} alt="User Avatar" />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || <UserCircle className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || 'Cashier'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'cashier@brewflow.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
