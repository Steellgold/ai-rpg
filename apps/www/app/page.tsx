import { useTranslations } from "next-intl";
import { ReactElement } from "react";

const Page = (): ReactElement=> {
  const t = useTranslations();

  return (
    <p>
      {t("Title")}
    </p>
  );
}

export default Page;
