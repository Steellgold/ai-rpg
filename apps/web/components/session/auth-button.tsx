"use client";

import { Loader2, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaDiscord } from "react-icons/fa";
import { Component } from "@workspace/ui/types/component";
import { Button } from "@workspace/ui/components/button";
import { ComponentProps } from "react";
import { signIn, signOut, useSession } from "@/lib/auth-client";

type AuthButtonProps = ComponentProps<"button"> & {
  Navbar?: boolean;
}

export const AuthButton: Component<AuthButtonProps> = ({ Navbar, ...props }) => {
  const { data, isPending: loading } = useSession();
  const user = data?.user;

  const t = useTranslations("Navbar.Session");

  const getText = (type: "out" | "in") => {
    if (type === "out") {
      return (
        <>
          <LogOut size={16} />
          {t("out")}
        </>
      )
    }

    return (
      <>
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <FaDiscord size={16} />
        )}
        {t("in", { provider: "Discord" })}
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
      <Button variant={Navbar ? "navbar" : "default"} onClick={() => signIn.social({
        provider: "discord"
      })} {...props}>
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

      redirect(process.env.NEXT_PUBLIC_BASE_URL!)
    }} {...props}>
      {getText("out")}
    </Button>
  )
}