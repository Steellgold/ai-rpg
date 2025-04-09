"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { CREDIT_PACKS } from "@/lib/features/credit-pack";
import { format } from "date-fns";
import Image from "next/image";
import { buyCredits } from "@/lib/actions/payment";

interface CreditsSectionProps {
  credits: number;
  transactions: {
    id: string;
    amount: number;
    balanceAfter: number;
    description: string;
    transactionType: string;
    createdAt: Date;
  }[];
}

export default function CreditsSection({ credits, transactions }: CreditsSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const t = useTranslations("Pages.Account.credits");
  const u = useTranslations();
  
  const handleBuyCredits = async (packId: string) => {
    setSelectedPack(packId);
    setIsLoading(true);
    
    try {
      const pack = CREDIT_PACKS.find(p => p.id === packId);
      if (!pack) throw new Error("Invalid pack");
      
      const result = await buyCredits(packId);
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error purchasing credits:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image src={"/coin.webp"} alt="coin" width={72} height={72} className="select-none" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("balance")}</p>
                  <p className="text-2xl font-bold">{credits}</p>
                </div>
              </div>

              <Button>{t("buy")}</Button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">{t("recentTransactions")}</h3>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noTransactions")}
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpRight className={`h-5 w-5 text-green-500`} />
                          ) : (
                            <ArrowDownRight className={`h-5 w-5 text-red-500`} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.createdAt), "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.amount > 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("balance")}: {transaction.balanceAfter}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}