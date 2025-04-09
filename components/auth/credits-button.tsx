"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const CreditsButton = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Navbar.Credits");
  const router = useRouter();
  
  useEffect(() => {
    const fetchCredits = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          const { data, error } = await supabase
            .from('User')
            .select('credits')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setCredits(data.credits);
          }
        } catch (error) {
          console.error("Error fetching credits:", error);
        }
      }
      
      setLoading(false);
    };
    
    fetchCredits();
    
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <Button variant="outline" className="flex items-center gap-2 h-9 px-3">
      <div className="relative w-6 h-6">
        <Image src="/coin.webp" alt="Credits" fill className="object-contain" />
      </div>

      <Skeleton className="w-4 h-4" />
    </Button>
  );

  if (credits === null) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3"
            onClick={() => router.push('/account')}
          >
            <div className="relative w-5 h-5">
              <Image
                src="/coin.webp"
                alt="Credits"
                fill
                className="object-contain"
              />
            </div>
            <span className={cn(
              "font-medium",
              credits < 5 ? "text-red-400" : "text-amber-400"
            )}>
              {credits}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("tooltip", { count: credits })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};