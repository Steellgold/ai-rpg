import { ReactElement } from "react";
import { Syne } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@workspace/ui/components/page-layout";
import { Check, Loader } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

const syne = Syne({ subsets: ["latin"] });

const status = [
  "initialized",
  "detecting_language",
  "generating_story",
  "creating_main_chars"
];

const Page = async (): Promise<ReactElement> => {
  const t = await getTranslations("Proccessing"); 

  return (
    <>
      <PageLayout>
        <section className="flex flex-col items-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h1 className={`${syne.className} text-2xl lg:text-4xl font-extrabold`}>
              {t("Top.title")}
            </h1>
            <p className={`${syne.className} text-sm lg:text-lg font-medium`}>
              {t("Top.subtitle")}
            </p>
          </div>

          <div className="h-6" />

          <Card
            className={cn(
              "relative overflow-hidden border-0 p-6 z-20 rounded-xl",
              "backdrop-blur-md dark:bg-white/2"
            )}
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
            </div>

            <CardContent>
              {[...status].reverse().map((s, index) => {
                const isLast = index === 0;
                const isCompleted = index !== 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center mb-2 animate-slide-in",
                      !isLast && "opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full mr-2 flex items-center justify-center",
                        isCompleted ? "bg-green-500" : "bg-blue-500"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="text-white w-3 h-3" />
                      ) : (
                        <Loader className="text-white w-3 h-3 animate-spin" />
                      )}
                    </div>

                    <span className={`text-sm lg:text-lg font-medium`}>
                      {t(`States.${s}`)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </PageLayout>
    </>
  );
};

export default Page;
