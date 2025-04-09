import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { unauthorized } from "next/navigation";
import CreditsSection from "./_components/credits-section";
import { getTranslations } from "next-intl/server";

const AccountPage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return unauthorized();

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      credits: true,
      email: true,
      display_name: true,
      image_url: true,
      subscription_tier: true,
      subscription_status: true,
      subscription_end: true,
      creditTransactions: {
        select: {
          id: true,
          amount: true,
          balanceAfter: true,
          description: true,
          transactionType: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!userData) return unauthorized();

  const t = await getTranslations("Pages.Account");

  return (
    <div className="container max-w-6xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-6">{t("description")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CreditsSection credits={userData.credits} transactions={userData.creditTransactions} />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center gap-4">
              {userData.image_url && (
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <img 
                    src={userData.image_url} 
                    alt={userData.display_name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl font-medium">{userData.display_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;