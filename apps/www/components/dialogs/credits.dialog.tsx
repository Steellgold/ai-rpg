"use client"

import type { PropsWithChildren } from "react"
import { Wallet, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCredits } from "@/lib/hooks/use-credits"
import { useTransactions } from "@/lib/hooks/use-transactions"
import { Component } from "@/lib/types/component"
import { useTranslations } from "next-intl"

export const CreditsDialog: Component<PropsWithChildren> = ({ children }) => {
  const { credits, loading } = useCredits();
  const { transactions, loading: transactionsLoading } = useTransactions(5);
  const router = useRouter();
  const t = useTranslations("CreditsDialog");

  const handleBuyCredits = () => {
    router.push("/credits/buy");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="mb-2 flex flex-col gap-2">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-primary/10" aria-hidden="true">
            <Wallet className="text-primary" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">{t("Title")}</DialogTitle>
            <DialogDescription className="text-left">{t("Description")}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("Balance")}</p>
              <div className="flex items-center gap-2">
                <Image src="/assets/coin.webp" alt="Coin" width={20} height={20} className="inline-block" />
                <span className="text-2xl font-bold">
                  {loading ? "..." : credits.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
            <Button onClick={handleBuyCredits} size="sm" className="gap-2">
              <Plus size={16} />
              {t("BuyCredits")}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("History")}</h3>
            {transactionsLoading ? (
              <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                {t("NoTransactions")}
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </span>
                      <Image src="/assets/coin.webp" alt="Coin" width={16} height={16} className="inline-block" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogClose asChild>
            <Button type="button" className="w-full">
              {t("CloseButton")}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
} 