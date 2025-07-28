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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, UserCircle, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useApp } from "./AppProvider";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { currency, setCurrency } = useApp();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu />
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <CoffeeIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary">Brew Flow</span>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://placehold.co/100x100" alt="User Avatar" />
              <AvatarFallback>
                <UserCircle className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Cashier</p>
              <p className="text-xs leading-none text-muted-foreground">
                cashier@brewflow.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={currency} onValueChange={(value) => setCurrency(value as 'USD' | 'IDR')}>
            <DropdownMenuLabel>Currency</DropdownMenuLabel>
            <DropdownMenuRadioItem value="IDR">IDR (Rp)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="USD">USD ($)</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
