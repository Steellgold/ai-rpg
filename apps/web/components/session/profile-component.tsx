"use client"

import { User, ChevronDown, LogOut, LibraryBig, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

// import { AuthButton } from "./auth-button"
// import { useSession } from "@/lib/hooks/use-session"
import Link from "next/link"
import { Component } from "@workspace/ui/types/component"
import { signOut, useSession } from "@/lib/auth-client"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import { AuthButton } from "./auth-button"
// import { useCredits } from "@/lib/hooks/use-credits"
// import Image from "next/image"
// import { LanguageDialog } from "../dialogs/language.dialog"
// import { CreditsDialog } from "../dialogs/credits.dialog"

type ProfileComponentProps = {
  variant?: "default" | "navbar";
}

export const ProfileComponent: Component<ProfileComponentProps> = ({
  variant = "default"
}) => {
  const { data, isPending: loading } = useSession();
  const t = useTranslations("Navbar");
  const err = useTranslations("Errors");

  const user = data?.user;
  if (!user || loading) {
    return (
      <Button variant={variant} className={`flex items-center gap-2`} disabled>
        <Loader2 className="animate-spin" size={16} />
      </Button>
    )
  }

  // const { session, simplifiedUser: user, loading, signOut } = useSession();
  // const { credits, loading: creditsLoading } = useCredits();

  if (!user || loading) {
    return <AuthButton Navbar={variant === "navbar"} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`flex items-center gap-2`} variant={variant}>
          <Avatar className="h-6 w-6">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col -space-y-1 mb-1.5">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <p className="px-2 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="p-0" asChild>
          <Link className="flex items-center justify-between w-full px-2 py-1.5" href={"/list"}>
            <div className="flex items-center gap-2">
              <LibraryBig size={16} />
              <span>{t("Stories.label")}</span>
            </div>
          </Link>
        </DropdownMenuItem>

        {/* <CreditsDialog>
          <DropdownMenuItem className="p-0 cursor-pointer" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between w-full px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Wallet size={16} />
                <span>{t("Credits")}</span>
              </div>

              <span className="border border-border px-2 rounded-md flex items-center">
                <Image src="/assets/coin.webp" alt="Coin" width={16} height={16} className="inline-block mr-1" />
                {credits.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </DropdownMenuItem>
        </CreditsDialog> */}

        {/* <LanguageDialog>
          <DropdownMenuItem className="p-0 cursor-pointer" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between w-full px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Earth size={16} />
                <span>{t("Language")}</span>
              </div>
            </div>
          </DropdownMenuItem>
        </LanguageDialog> */}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem className="p-0 cursor-pointer" onSelect={async () => {
          const { error } = await signOut()
          if (error) {
            console.error(error)
            toast.error(err("signout_failed"))
            return;
          }
        
          redirect(process.env.NEXT_PUBLIC_BASE_URL!)
        }}>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <LogOut size={16} />
            {t("Session.out")}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}