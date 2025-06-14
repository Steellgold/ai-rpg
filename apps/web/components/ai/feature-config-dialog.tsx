"use client"

// ((((((((((())))))))))) //
//                        //
//       PROTOTYPE        //
//                        //
// ((((((((((())))))))))) //

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { AlertTriangle, RotateCcw, Power, Save, X } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { ConfigRenderer } from "./config-renderer"
import type { ConfigValue } from "@/types/story-config"
import { useStoryContext } from "@/app/contexts/story-context"

type DialogState = "closed" | "confirming" | "configuring"

type FeatureConfigDialogProps = {
  featureId: string
  children: React.ReactNode
}

export const FeatureConfigDialog = ({ featureId, children }: FeatureConfigDialogProps) => {
  const {
    isFeatureEnabled,
    getFeatureSchema,
    getFeatureConfig,
    getFeatureCost,
    toggleFeature,
    updateFeatureConfig,
    resetFeatureConfig,
    totalCost,
  } = useStoryContext()

  const [dialogState, setDialogState] = useState<DialogState>("closed")
  const [tempConfig, setTempConfig] = useState<{ [key: string]: ConfigValue }>({})

  const feature = getFeatureSchema(featureId)
  const isEnabled = isFeatureEnabled(featureId)
  const currentConfig = getFeatureConfig(featureId)
  const featureCost = getFeatureCost(featureId)
  const baseCost = feature?.baseCost || 0

  useEffect(() => {
    if (dialogState === "configuring") {
      setTempConfig(currentConfig)
    }
  }, [dialogState, currentConfig])

  const handleChildClick = () => {
    if (!feature) return

    if (isEnabled) {
      setDialogState("configuring")
    } else {
      setDialogState("confirming")
    }
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
      <div onClick={handleChildClick} className="cursor-pointer">
        {children}
      </div>

      <Dialog
        open={dialogState !== "closed"}
        onOpenChange={() => {}}
      >
        <DialogContent
          className={cn(
            "bg-gray-900/95 border-gray-700/50 backdrop-blur-md",
            "w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden",
            "sm:w-[90vw] sm:max-w-3xl",
            "md:w-[80vw] md:max-w-4xl",
            "lg:w-[70vw] lg:max-w-5xl",
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
                  <DialogTitle className="text-xl text-gray-100">{feature.label}</DialogTitle>
                  <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-gray-400 hover:text-gray-300">
                <X size={18} />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh]">
            {dialogState === "confirming" && (
              <div className="space-y-6">
                <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-400 mb-2">Activer cette fonctionnalité ?</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Cette fonctionnalité ajoutera des capacités à votre génération d'histoire. Vous pourrez la
                        configurer après activation.
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                          Coût de base: {baseCost} crédits
                        </Badge>
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          Total actuel: {totalCost} crédits
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleCancel}>
                    Annuler
                  </Button>
                  <Button onClick={handleConfirmActivation} className="bg-indigo-600 hover:bg-indigo-700">
                    Activer la fonctionnalité
                  </Button>
                </div>
              </div>
            )}

            {dialogState === "configuring" && (
              <div className="space-y-6">
                {/* Statut et coût */}
                <Card className="p-4 bg-green-500/10 border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">Fonctionnalité activée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        Coût: {featureCost.toFixed(1)} crédits
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Configuration */}
                {feature.config && Object.keys(feature.config).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-200">Configuration</h3>
                    <ConfigRenderer schema={feature.config} values={tempConfig} onChange={updateTempConfig} />
                  </div>
                )}

                {/* Actions */}
                <Separator className="bg-gray-700/50" />

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="text-gray-400 border-gray-600 hover:text-gray-300"
                    >
                      <RotateCcw size={14} className="mr-1" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisable}
                      className="text-red-400 border-red-600/50 hover:text-red-300 hover:border-red-500/50"
                    >
                      <Power size={14} className="mr-1" />
                      Désactiver
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                      <Save size={14} className="mr-1" />
                      Sauvegarder
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