"use client"

import { User, ChevronDown, LogOut, LibraryBig } from "lucide-react"
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
import Link from "next/link"

interface ProfileComponentProps {
  variant?: "default" | "navbar"
  className?: string
}

export function ProfileComponent({ variant = "default", className }: ProfileComponentProps) {
  const t = useTranslations("Navbar");

  const { session, simplifiedUser: user, loading, signOut } = useSession();
  // const { credits, loading: creditsLoading } = useCredits();

  // if (!session || !user || loading || creditsLoading) {
  //   return <AuthButton Navbar={variant === "navbar"} />
  // }
  if (!session || !user || loading) {
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
        
        <DropdownMenuItem className="p-0" asChild>
          <Link className="flex items-center justify-between w-full px-2 py-1.5" href={"/list"}>
            <div className="flex items-center gap-2">
              <LibraryBig size={16} />
              <span>{t("Links.Stories")}</span>
            </div>
          </Link>
        </DropdownMenuItem>

        {/* <CreditPacksDialog>
          <DropdownMenuItem className="p-0" onSelect={(e) => e.preventDefault()}>
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
        </CreditPacksDialog> */}

        {/* <LanguageDialog>
          <DropdownMenuItem className="p-0 cursor-pointer" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between w-full px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>{t("Language")}</span>
              </div>
            </div>
          </DropdownMenuItem>
        </LanguageDialog> */}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={async () => {
          const { error } = await signOut()
          if (error) {
            console.error(error)
            return;
          }
        
          redirect(process.env.NEXT_PUBLIC_BASE_URL!)
        }}>
          <LogOut size={16} />
          {t("SignIn.Label.Out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}