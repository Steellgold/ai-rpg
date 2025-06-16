import { useStoryContext } from "@/contexts/story-context"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { Component } from "@workspace/ui/types/component"
import { useTranslations } from "next-intl"
import Image from "next/image"

type BonusCreditProps = {
  nbr: number;
  type?: "bonus" | "cost"
}

export const BadgeBonusCredit: Component<BonusCreditProps> = ({ nbr, type = "bonus" }) => {
  const t = useTranslations("CreditsBadge")

  return <Badge
    variant="secondary"
    className={cn(
      "ml-2 text-xs",
      "bg-indigo-500/10 text-indigo-400",
      "border border-indigo-500/30"
    )}
  >
    {
      type === "bonus" ? (
        <>
          +{nbr}
        </>
      ) : (
        <span className="flex items-center gap-1">
          <Image src="/assets/coin.webp" alt="AI Icon" width={22} height={22} className="w-3.5 h-3.5" />
          {t("cost", { nbr })}
        </span>
      )
    }
  </Badge>
}

export const CreditsBadge = () => {
  const { totalCost } = useStoryContext();
  if (totalCost === 0) return <></>;

  return <BadgeBonusCredit nbr={totalCost} type="cost" />
}