"use client";

import { useTranslations } from "next-intl";
import { Badge } from "../ui/badge";
import { Component } from "@/lib/types";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const ChildrenStoryTag: Component<HTMLAttributes<HTMLDivElement>> = ({ className }) => {
  const t = useTranslations("Pages.Story");

  return (
    <Badge className={cn("!bg-teal-500/10 !text-teal-500", className)}>
      {t("ChildrenStory")}
    </Badge>
  )
}