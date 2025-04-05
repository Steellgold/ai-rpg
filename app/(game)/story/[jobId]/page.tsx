"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Component } from "@/lib/types";

type Params = {
  params: Promise<{ jobId: string }>;
};

const Page: Component<Params> = ({ params }) => {
  const [status, setStatus] = useState<string>("PENDING");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [hasItems, setHasItems] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("Pages.New");

  const { jobId } = use(params);

  useEffect(() => {
    let realtimeChannel: RealtimeChannel | null = null;

    const subscribeToJobStatus = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("Job")
          .select("*")
          .eq("id", jobId)
          .single();

        if (fetchError) throw fetchError;

        if (data.input && typeof data.input === 'object' && 'items' in data.input) {
          setHasItems(Boolean(data.input.items));
        }

        updateJobStatus(data);

        realtimeChannel = supabase
          .channel(`job-${jobId}`)
          .on(
            'postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'Job', 
              filter: `id=eq.${jobId}` 
            },
            (payload) => {
              if (payload.eventType === 'UPDATE') {
                updateJobStatus(payload.new);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.error("Error setting up job status tracking:", e);
        setError("Erreur lors du suivi du statut");
      }
    };

    const updateJobStatus = (jobData: any) => {
      const currentStatus = jobData.stage || jobData.status;
      setStatus(currentStatus);

      const progressMap: {[key: string]: number} = {
        PENDING: 5,
        INITIALIZED: 10,
        GENERATING_STORY: 20,
        CREATING_STORY: 30,
        CREATING_MAIN_CHARS: 40,
        CREATING_SEC_CHARS: 50,
        GENERATING_ITEMS: 55,
        CREATING_FIRST_SCENE: 60,
        GENERATING_BANNER: 70,
        UPLOADING_BANNER: 80,
        GENERATING_SCENE_IMG: 90,
        UPLOADING_SCENE_IMG: 95,
        FINALIZING: 99,
        COMPLETED: 100,
        ERROR: 0,
        FAILED: 0
      };

      const newProgress = progressMap[currentStatus] || progress;
      setProgress(newProgress);

      if (currentStatus === 'COMPLETED' && jobData.storyId) {
        router.push(`/${jobData.storyId}`);
      } else if (currentStatus === 'FAILED' || currentStatus === 'ERROR') {
        setError(jobData.error || "An error occurred");
      }
    };

    subscribeToJobStatus();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [jobId, router, supabase]);

  const statusMessages = {
    PENDING: t("GeneratingSteps.Pending"),
    INITIALIZED: t("GeneratingSteps.Pending"),
    GENERATING_STORY: t("GeneratingSteps.Processing"),
    CREATING_STORY: t("GeneratingSteps.Processing"),
    CREATING_MAIN_CHARS: t("GeneratingSteps.Processing"),
    CREATING_SEC_CHARS: t("GeneratingSteps.Processing"),
    GENERATING_ITEMS: t("GeneratingSteps.GeneratingItems"),
    CREATING_FIRST_SCENE: t("GeneratingSteps.GeneratingScenes"),
    GENERATING_BANNER: t("GeneratingSteps.GeneratingImages"),
    UPLOADING_BANNER: t("GeneratingSteps.GeneratingImages"),
    GENERATING_SCENE_IMG: t("GeneratingSteps.GeneratingImages"),
    UPLOADING_SCENE_IMG: t("GeneratingSteps.GeneratingImages"),
    FINALIZING: t("GeneratingSteps.Completed"),
    COMPLETED: t("GeneratingSteps.Completed"),
    FAILED: t("GeneratingSteps.Error"),
    ERROR: t("GeneratingSteps.Error")
  };

  const generationSteps = [
    { key: 'PENDING', label: t("GeneratingSteps.Pending"), progress: 10 },
    { key: 'GENERATING_STORY', label: t("GeneratingSteps.Processing"), progress: 30 },
    ...(hasItems ? [{ key: 'GENERATING_ITEMS', label: t("GeneratingSteps.GeneratingItems"), progress: 55 }] : []),
    { key: 'CREATING_FIRST_SCENE', label: t("GeneratingSteps.GeneratingScenes"), progress: 60 },
    { key: 'GENERATING_BANNER', label: t("GeneratingSteps.GeneratingImages"), progress: 80 },
    { key: 'COMPLETED', label: t("GeneratingSteps.Completed"), progress: 100 }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t("GeneratingTitle")}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Progress value={progress} className="h-2 w-full" />
          
          <div className="flex items-center justify-center gap-3">
            {!error ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-lg">
                  {statusMessages[status as keyof typeof statusMessages] || t("GeneratingDescription")}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                <p>{error}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {generationSteps.map(({ key, label, progress: stepProgress }) => (
              <div key={key} className="flex justify-between items-center">
                <span>{label}</span>
                <Badge variant={status === key ? "default" : progress >= stepProgress ? "success" : "outline"}>
                  {progress >= stepProgress ? "✓" : "..."}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        
        {error && (
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/new")}
            >
              {t("BackToCreator")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default Page;