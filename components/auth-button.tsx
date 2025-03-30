"use client";

import { Component } from "@/lib/types";
import { Button } from "./ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import { redirect } from "next/navigation";
import { clientEnv } from "@/lib/env/env.client";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/hooks/use-session";
import { useTranslations } from "next-intl";

export const AuthButton: Component<{ Navbar: boolean }> = ({ Navbar }) => {  
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
      <Button variant={Navbar ? "navbar" : "default"} disabled>
        <Loader2 className="animate-spin" size={16} />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant={Navbar ? "navbar" : "default"} onClick={() => signIn.discord()}>
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
    }}>
      {getText("out")}
    </Button>
  )
}