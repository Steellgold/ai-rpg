import { useTranslations } from "next-intl";
import { ReactElement } from "react";
import { PageLayout } from "./_l";

const Page = (): ReactElement=> {
  const t = useTranslations();

  return (
    <PageLayout>
      <p className="text-2xl font-bold text-center">
        Hey
      </p>
    </PageLayout>
  );
}

export default Page;
