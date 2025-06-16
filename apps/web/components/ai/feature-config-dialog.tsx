"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { AlertTriangle, RotateCcw, Power, Save } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { ConfigRenderer } from "./config-renderer"
import type { ConfigValue } from "@/types/story-config"
import { useStoryContext } from "@/contexts/story-context"
import { useTranslations } from "next-intl"

type DialogState = "closed" | "confirming" | "configuring"

type FeatureConfigDialogProps = {
  featureId: string
  children: React.ReactNode
}

export const FeatureConfigDialog = ({ featureId, children }: FeatureConfigDialogProps) => {
  const t = useTranslations("FeatureConfig.dialog")
  
  const {
    isFeatureEnabled,
    getFeatureSchema,
    getFeatureConfig,
    getFeatureCost,
    toggleFeature,
    updateFeatureConfig,
    resetFeatureConfig
  } = useStoryContext()

  const [dialogState, setDialogState] = useState<DialogState>("closed")
  const [tempConfig, setTempConfig] = useState<{ [key: string]: ConfigValue }>({})

  const feature = getFeatureSchema(featureId)
  const isEnabled = isFeatureEnabled(featureId)
  const currentConfig = getFeatureConfig(featureId)
  const featureCost = getFeatureCost(featureId)
  const baseCost = feature?.baseCost || 0

  useEffect(() => {
    if (dialogState === "configuring") setTempConfig(currentConfig)
  }, [dialogState, currentConfig])

  const handleChildClick = () => {
    if (!feature) return

    if (isEnabled) setDialogState("configuring")
    else setDialogState("confirming")
  }

  const handleConfirmActivation = () => {
    toggleFeature(featureId)
    setDialogState("configuring")
  }

  const handleSave = () => {
    updateFeatureConfig(featureId, tempConfig)
    setDialogState("closed")
  }

  const handleCancel = () => {
    setTempConfig(currentConfig)
    setDialogState("closed")
  }

  const handleReset = () => {
    resetFeatureConfig(featureId)
    setTempConfig(getFeatureConfig(featureId))
  }

  const handleDisable = () => {
    toggleFeature(featureId)
    setDialogState("closed")
  }

  const updateTempConfig = (key: string, value: ConfigValue) => {
    setTempConfig((prev) => ({ ...prev, [key]: value }))
  }

  if (!feature) return <>{children}</>

  const FeatureIcon = feature.icon

  return (
    <>
      {/* Why <DialogTrigger /> does not work, so we use a div with onClick */}
      <div onClick={handleChildClick}>
        {children}
      </div>

      <Dialog
        open={dialogState !== "closed"}
        onOpenChange={() => {}}
      >
        <DialogContent
          className={cn(
            "w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden",
            "sm:w-[90vw] sm:max-w-1xl",
          )}
          showCloseButton={false}
        >
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <FeatureIcon size={20} className="text-indigo-400" />
                </div>
                <div>
                  <DialogTitle>{feature.label}</DialogTitle>
                  <DialogDescription>{feature.description}</DialogDescription>
                </div>
              </div>

              <Badge className={cn({
                "bg-green-500/20 text-green-400 border-green-500/30": isEnabled,
                "bg-gray-500/20 text-gray-400 border-gray-500/30": !isEnabled
              },
                "rounded-lg text-xs gap-1",
                { "pr-0.5": isEnabled }
              )}>
                {isEnabled ? t("enabled") : t("disabled")}

                {isEnabled && (
                  <span className={cn(
                    "ml-1 text-xs p-0.5 px-1",
                    "rounded-md bg-gray-500/30",
                    "border border-gray-500/50"
                  )}> 
                    {featureCost} {t("credits")}
                  </span>
                )}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh]">
            {dialogState === "confirming" && (
              <div className="space-y-6">
                <Alert className="p-4 bg-gray-500/10 border-gray-500/30 text-gray-400">
                  <AlertTriangle size={20} className="text-gray-400" />
                  <AlertTitle>
                    {t("activate.title")}
                  </AlertTitle>
                  <AlertDescription className="text-gray-300">
                    {t("activate.description")}
                  </AlertDescription>

                  <div className="mt-3">
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      {t("base_cost", { cost: baseCost })}
                    </Badge>
                  </div>
                </Alert>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleCancel}>
                    {t("activate.cancel")}
                  </Button>
                  <Button
                    onClick={handleConfirmActivation}
                    className="bg-gray-600 hover:bg-gray-700 text-gray-100"
                  >
                    {t("activate.button")}
                  </Button>
                </div>
              </div>
            )}

            {dialogState === "configuring" && (
              <div className="space-y-6">
                {feature.config && Object.keys(feature.config).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-200">
                      {t("configuration.title")}
                    </h3>
                    
                    <ConfigRenderer
                      schema={feature.config}
                      values={tempConfig}
                      onChange={updateTempConfig}
                    />
                  </div>
                )}

                <Separator className="bg-gray-700/50" />

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="text-gray-400 border-gray-600 hover:text-gray-300"
                    >
                      <RotateCcw size={14} />
                      {t("configuration.reset")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisable}
                      className="text-red-400 border-red-600/50 hover:text-red-300 hover:border-red-500/50"
                    >
                      <Power size={14} />
                      {t("configuration.disable")}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}>
                      {t("configuration.cancel")}
                    </Button>

                    <Button
                      onClick={handleSave}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                      size="sm"
                      disabled={
                        JSON.stringify(tempConfig)
                          ===
                        JSON.stringify(currentConfig)
                      }
                    >
                      <Save size={14} />
                      {t("configuration.save")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}