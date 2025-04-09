"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, LibraryBig, Menu, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ProfileComponent } from "@/components/auth/profile-component"
import Image from "next/image"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Account", href: "/account", icon: Settings },
  { name: "Stories", href: "/continue", icon: LibraryBig }
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[13] transition-all duration-200",
        isScrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent",
      )}
    >
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-6 py-4">
              <Link href="/" className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                  <Image src="/icon.webp" alt="Logo" width={32} height={32} className="object-contain p-1" />
                </div>
                <span className="text-lg font-bold">Website</span>
              </Link>

              <div className="flex flex-col gap-1 px-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href} className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
                    )}>
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Image src="/icon.webp" alt="Logo" width={32} height={32} className="object-contain p-1" />
          </div>
          <span className="hidden text-lg font-bold sm:inline-block">Imagine</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex md:items-center md:gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  "hover:bg-accent-foreground/10",
                )}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center">
            <ProfileComponent variant="navbar" />
          </div>
        </div>
      </div>
    </nav>
  )
}
