"use client";

import type { Component } from "@/lib/types";
import { Button, ButtonProps } from "../ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import { redirect } from "next/navigation";
import { clientEnv } from "@/lib/env/env.client";
import { useSession } from "@/lib/hooks/use-session";
import { useTranslations } from "next-intl";

type AuthButtonProps = ButtonProps & {
  Navbar?: boolean;
}

export const AuthButton: Component<AuthButtonProps> = ({ Navbar, ...props }) => {
  const { user, signIn, loading, signOut } = useSession();
  const t = useTranslations("Navbar.SignIn");

  const getText = (type: "out" | "in") => {
    if (type === "out") {
      return (
        <>
          <LogOut size={16} />
          {t("Label.Out")}
        </>
      )
    }

    return (
      <>
        <User size={16} />
        {t("Label.In")}
      </>
    )
  }

  if (loading) {
    return (
      <Button variant={Navbar ? "navbar" : "default"} className="cursor-not-allowed" {...props} disabled>
        <Loader2 className="animate-spin" size={16} />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant={Navbar ? "navbar" : "default"} onClick={() => signIn.discord()} {...props}>
        {getText("in")}
      </Button>
    )
  }

  return (
    <Button variant={Navbar ? "navbar" : "default"} onClick={async () => {
      const { error } = await signOut()
      if (error) {
        console.error(error)
        return;
      }

      redirect(clientEnv.NEXT_PUBLIC_BASE_URL)
    }} {...props}>
      {getText("out")}
    </Button>
  )
}