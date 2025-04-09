"use client"

import { User, ChevronDown, Wallet, Globe, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { AuthButton } from "./auth-button"
import { useSession } from "@/lib/hooks/use-session"
import { redirect } from "next/navigation"
import { clientEnv } from "@/lib/env/env.client"
import { useCredits } from "@/lib/hooks/use-credits"
import Image from "next/image"

interface ProfileComponentProps {
  variant?: "default" | "navbar"
  className?: string
}

export function ProfileComponent({ variant = "default", className }: ProfileComponentProps) {
  const t = useTranslations("Navbar");

  const { session, simplifiedUser: user, loading, signOut } = useSession();
  const { credits, loading: creditsLoading } = useCredits();

  if (!session || !user || loading || creditsLoading) {
    return <AuthButton Navbar={variant === "navbar"} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "navbar" ? "navbar" : "outline"}
          className={`flex items-center gap-2 ${className}`}
        >
          <Avatar className="h-6 w-6">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name ?? ""} />}
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline max-w-[100px] truncate">{user.display_name}</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col -space-y-1 mb-1.5">
          <DropdownMenuLabel>{user.display_name}</DropdownMenuLabel>
          <p className="px-2 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Credits */}
        <DropdownMenuItem className="p-0">
          <div className="flex items-center justify-between w-full px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Wallet size={16} />
              <span>{t("Credits")}</span>
            </div>

            <span className="border border-border px-2 rounded-md flex items-center">
              <Image src="/coin.webp" alt="Coin" width={16} height={16} className="inline-block mr-1" />
              {credits.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </DropdownMenuItem>

        {/* Language */}
        <DropdownMenuItem className="p-0">
          <div className="flex items-center justify-between w-full px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>{t("Language")}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={async () => {
          const { error } = await signOut()
          if (error) {
            console.error(error)
            return;
          }
        
          redirect(clientEnv.NEXT_PUBLIC_BASE_URL)
        }}>
          <LogOut size={16} />
          {t("SignIn.Label.Out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}