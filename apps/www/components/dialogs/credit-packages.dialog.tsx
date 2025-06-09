"use client"

import { PropsWithChildren, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKAGES } from "@/lib/config/credit-packages";
import { useTranslations } from "next-intl";
import { Component } from "@/lib/types/component";
import { useLanguageStore } from "@/lib/hooks/use-lang";
import { isEurope, ISOLang } from "@imagine/types/lang";
import Image from "next/image";
import { ShineBorder } from "@/components/ui/magicui/shine-border";
import { cn } from "@/lib/utils";
import { FaStripe } from "react-icons/fa";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useStripe } from "@/lib/hooks/use-stripe";

const formatPrice = (price: number, locale: ISOLang = "en") => {
  return price.toLocaleString(isEurope(locale) ? "fr-FR" : "en-US", {
    style: "currency",
    currency: isEurope(locale) ? "EUR" : "USD"
  });
}

export const CreditPackagesDialog: Component<PropsWithChildren> = ({ children }) => {
  const id = useId();
  const [selectedPack, setSelectedPack] = useState<string>(CREDIT_PACKAGES[1]?.id || "aventurier");
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations("CreditPackagesDialog");
  const { lang } = useLanguageStore();
  const { createCheckoutSession } = useStripe();

  const handlePurchase = async() => {
    try {
      setIsLoading(true);
      const pack = CREDIT_PACKAGES.find(p => p.id === selectedPack);
      
      if (!pack) {
        toast.error(t("Errors.InvalidPack"));
        return;
      }
      
      await createCheckoutSession(selectedPack);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error(t("Errors.PaymentFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <div className="mb-2 flex flex-col gap-2">
          <div
            className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-primary/10"
            aria-hidden="true"
          >
            <Image src="/assets/coin.webp" alt="Coin" width={40} height={40} className="inline-block" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">{t("Title")}</DialogTitle>
            <DialogDescription className="text-left">
              {t("Description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <RadioGroup className="gap-2" defaultValue={selectedPack} onValueChange={setSelectedPack}>
            {CREDIT_PACKAGES.map((pack) => (
              <div
                key={pack.id}
                className={cn(
                  "relative flex w-full items-center gap-2 rounded-md px-3 py-3 outline-none",
                  "border-input has-data-[state=checked]:border-primary/50", {
                    "border": pack.id !== selectedPack,
                  },
                  "has-data-[state=checked]:bg-accent"
                )}
              >
                {pack.id === selectedPack && <ShineBorder className="rounded-md border-[1.3px]" shineColor={["#fff", "#0418cf", "#bbc1fc", "#0418cf"]} />}

                <RadioGroupItem
                  value={pack.id}
                  id={`${id}-${pack.id}`}
                  aria-describedby={`${id}-${pack.id}-description`}
                  className="order-1 after:absolute after:inset-0"
                />

                <div className="grid grow gap-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${id}-${pack.id}`} className="font-medium">{t(`Packages.${pack.id}.Name`)}</Label>

                    {pack.popular && (
                      <Badge className="bg-primary text-primary-foreground text-xs">{t("Popular")}</Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-semibold">{pack.credits}</span>
                    {pack.bonusCredits && <span className="text-green-600 text-xs">+{pack.bonusCredits}</span>}
                    <span className="text-muted-foreground text-xs">{t("Credits")}</span>
                    <span className="text-muted-foreground text-xs mx-1">•</span>
                    <span className="font-semibold">{formatPrice(pack.price, lang)}</span>
                  </div>

                  <p id={`${id}-${pack.id}-description`} className="text-muted-foreground text-xs">
                    {t(`Packages.${pack.id}.Description`)}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="grid gap-2">
            <Button 
              type="button" 
              className="w-full" 
              onClick={handlePurchase}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t("Loading")}
                </>
              ) : (
                t("BuyButton")
              )}
            </Button>

            <p className="text-muted-foreground text-xs text-center flex items-center justify-center gap-1">
              {t("Footer.SecurePayment")}
              <FaStripe className="text-indigo-500" size={32} />
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 