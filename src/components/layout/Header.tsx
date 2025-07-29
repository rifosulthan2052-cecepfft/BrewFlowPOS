
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, UserCircle, Menu, Percent } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useApp } from "./AppProvider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { currency, setCurrency, taxRate, setTaxRate } = useApp();
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu />
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <CoffeeIcon className="h-8 w-8 text-primary" />
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-bold text-primary">BrewFlow</span>
            <span className="text-xs text-muted-foreground font-medium">by Sakato</span>
          </div>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || "https://placehold.co/100x100"} alt="User Avatar" />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || <UserCircle className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || 'Cashier'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'cashier@brewflow.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
             <DropdownMenuLabel>Settings</DropdownMenuLabel>
             <div className="px-2 py-1">
                <Label htmlFor="tax-rate" className="text-xs font-normal text-muted-foreground flex items-center gap-2 mb-1">
                  <Percent className="h-3 w-3"/> Tax Rate
                </Label>
                <div className="relative">
                   <Input 
                      id="tax-rate"
                      type="number"
                      value={taxRate * 100}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100)}
                      className="h-8 pl-3 pr-8 text-sm"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={currency} onValueChange={(value) => setCurrency(value as 'USD' | 'IDR')}>
            <DropdownMenuLabel>Currency</DropdownMenuLabel>
            <DropdownMenuRadioItem value="IDR">IDR (Rp)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="USD">USD ($)</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
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
