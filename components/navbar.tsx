"use client";

import { ReactElement } from "react";
import { ThemeLanguageSwitcher } from "./theme-and-language";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import { useSession } from "@/lib/hooks/use-session";

export const Navbar = (): ReactElement => {
  const { error, isLoading, user } = useSession();

  return (
    <nav className="absolute top-4 right-4 z-50 flex flex-row justify-between items-center p-2 text-white">
      <div className="flex items-center space-x-4">
        <ThemeLanguageSwitcher />
        
        <Button onClick={() => console.log("Sign in clicked")} className="dark:backdrop-blur-sm dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition dark:duration-200 dark:ease-in-out">
          <User size={16} />
          Se connecter
        </Button>
      </div>
    </nav>
  )
}