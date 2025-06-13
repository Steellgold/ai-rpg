import { useTranslations } from "next-intl";
import type { Component } from "@/lib/types";
import Link from "next/link";

export const Footer: Component<{}> = () => {
  const t = useTranslations("Footer");
  
  return (
    <footer className="w-full bg-card/10 border-t border-border mt-auto z-[13] backdrop-blur-3xl">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{t("about.title")}</h3>
            <p className="text-muted-foreground mb-4 w-4/6">{t("about.description")}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("links.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("links.home")}
                </Link>
              </li>
              <li>
                <Link href="/continue" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("links.stories")}
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("links.account")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("legal.title")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("legal.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("legal.privacy")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("contact.title")}</h3>

            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("contact.form")}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("contact.support")}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("contact.feedback")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Imagine. {t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
};