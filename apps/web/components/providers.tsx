import { ThemeProvider as NextThemesProvider } from "next-themes"
import { getMessages } from "next-intl/server";
import { AsyncComponent } from "@workspace/ui/types/component";
import { PropsWithChildren } from "react";
import { Locale, NextIntlClientProvider } from "next-intl";

type ProvidersProps = PropsWithChildren & {
  locale?: Locale;
};

export const Providers: AsyncComponent<ProvidersProps> = async ({ children, locale }) => {
  const messages = await getMessages();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </NextThemesProvider>
  )
}
