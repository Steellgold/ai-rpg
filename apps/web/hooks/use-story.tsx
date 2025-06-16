"use client"

import { useState, useCallback, useMemo } from "react"
import { ImagesIcon, UsersIcon } from "lucide-react"
import type { FeatureSchema, ConfigSchema, StoryConfig, ConfigValue } from "@/types/story-config"

export const FEATURES_SCHEMA: {
  [key: string]: FeatureSchema
} = {
  images: {
    id: "images",
    label: "Scenes Images",
    description: "Generate scenes images to illustrate your story",
    icon: ImagesIcon,
    baseCost: 1,
    color: "rose",
    config: {
      quality: {
        type: "select",
        label: "Image Quality",
        default: "low",
        options: [
          { value: "low", label: "Low Quality", cost: 0 },
          { value: "medium", label: "Medium Quality", cost: 1 },
          { value: "high", label: "High Quality", cost: 2 },
        ],
      },
      style: {
        type: "select",
        label: "Artistic Style",
        default: "realistic",
        options: [
          { value: "auto", label: "Automatic", description: "Let the AI choose the style based on the scene and the story" },
          { value: "realistic", label: "Realistic" },
          { value: "cartoon", label: "Cartoon" },
          { value: "anime", label: "Anime" },
          { value: "oil_painting", label: "Oil Painting" },
        ],
      }
    },
  },
  characters: {
    id: "characters",
    label: "Characters",
    description: "Generate characters to illustrate your story",
    icon: UsersIcon,
    baseCost: 1,
    color: "orange"
  }
}

export const useStory = () => {
  const [config, setConfig] = useState<StoryConfig>(() => {
    const initialConfig: StoryConfig = {}
    Object.keys(FEATURES_SCHEMA).forEach((featureId) => {
      initialConfig[featureId] = {
        enabled: false,
        config: getDefaultConfig(FEATURES_SCHEMA[featureId]?.config || {}),
      }
    })
    return initialConfig
  })

  function getDefaultConfig(schema: { [key: string]: ConfigSchema }): { [key: string]: ConfigValue } {
    const defaultConfig: { [key: string]: ConfigValue } = {}

    Object.entries(schema).forEach(([key, configSchema]) => {
      if (configSchema.default !== undefined) {
        defaultConfig[key] = configSchema.default
      } else {
        switch (configSchema.type) {
          case "text":
          case "textarea":
          case "email":
          case "password":
          case "url":
          case "tel":
            defaultConfig[key] = ""
            break
          case "number":
          case "range":
            defaultConfig[key] = (configSchema.htmlProps as React.InputHTMLAttributes<HTMLInputElement>)?.min || 0
            break
          case "checkbox":
            defaultConfig[key] = false
            break
          case "select":
          case "radio":
            defaultConfig[key] = configSchema.options?.[0]?.value || ""
            break
          case "array":
            defaultConfig[key] = []
            break
          case "group":
            defaultConfig[key] = getDefaultConfig(configSchema.config || {})
            break
        }
      }
    })

    return defaultConfig
  }

  const calculateFeatureCost = useCallback(
    (featureId: string): number => {
      const feature = FEATURES_SCHEMA[featureId]
      const featureConfig = config[featureId]
      if (!feature || !featureConfig || !featureConfig.enabled) return 0

      let totalCost = feature.baseCost

      const calculateConfigCost = (
        configSchema: { [key: string]: ConfigSchema },
        configValues: { [key: string]: ConfigValue },
      ): number => {
        let cost = 0

        Object.entries(configSchema).forEach(([key, schema]) => {
          const value = configValues[key]

          if (typeof schema.cost === "function") {
            cost += schema.cost(value as ConfigValue, configValues)
          } else if (typeof schema.cost === "number") {
            cost += schema.cost
          }

          if (schema.type === "select" && schema.options) {
            const selectedOption = schema.options.find((opt) => opt.value === value)
            if (selectedOption?.cost) {
              cost += selectedOption.cost
            }

            if (selectedOption?.config && typeof configValues[key + "_config"] === "object") {
              cost += calculateConfigCost(
                selectedOption.config,
                configValues[key + "_config"] as { [key: string]: ConfigValue },
              )
            }
          }

          if (schema.config && typeof value === "object" && !Array.isArray(value)) {
            cost += calculateConfigCost(schema.config, value as { [key: string]: ConfigValue })
          }
        })

        return cost
      }

      if (feature.config) {
        totalCost += calculateConfigCost(feature.config, featureConfig.config)
      }

      return totalCost
    },
    [config],
  )

  const totalCost = useMemo(() => {
    return Object.keys(FEATURES_SCHEMA).reduce((total, featureId) => {
      return total + calculateFeatureCost(featureId)
    }, 0)
  }, [config, calculateFeatureCost])

  const toggleFeature = useCallback((featureId: string) => {
    setConfig((prev) => {
      const prevFeature = prev[featureId]
      const fallbackConfig = FEATURES_SCHEMA[featureId]?.config
        ? getDefaultConfig(FEATURES_SCHEMA[featureId].config)
        : {}
      return {
        ...prev,
        [featureId]: {
          enabled: !(prevFeature?.enabled ?? false),
          config: prevFeature?.config ?? fallbackConfig,
        },
      }
    })
  }, [])

  const updateFeatureConfig = useCallback((featureId: string, newConfig: { [key: string]: ConfigValue }) => {
    setConfig((prev) => {
      const prevFeature = prev[featureId];

      return {
        ...prev,
        [featureId]: {
          enabled: prevFeature?.enabled ?? false,
          config: { ...(prevFeature?.config ?? {}), ...newConfig },
        },
      };
    });
  }, [])

  const resetFeatureConfig = useCallback((featureId: string) => {
    const feature = FEATURES_SCHEMA[featureId]
    if (feature) {
      setConfig((prev) => ({
        ...prev,
        [featureId]: {
          enabled: prev[featureId]?.enabled ?? false,
          config: getDefaultConfig(feature.config || {}),
        },
      }))
    }
  }, [])

  const updateConfigAtPath = useCallback((featureId: string, path: string, value: ConfigValue) => {
    setConfig((prev) => {
      const newConfig = { ...prev }
      if (!newConfig[featureId]) return newConfig

      const keys = path.split(".");
      
      let current: any = newConfig[featureId].config

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i] as string
        if (!current[key]) current[key] = {}
        current = current[key]
      }

      const lastKey = keys[keys.length - 1] as string
      current[lastKey] = value

      return newConfig
    })
  }, [])

  const generate = useCallback(() => {
    const activeFeatures = Object.entries(config)
      .filter(([_, featureConfig]) => featureConfig.enabled)
      .reduce(
        (acc, [featureId, featureConfig]) => {
          acc[featureId] = featureConfig.config
          return acc
        },
        {} as { [key: string]: { [key: string]: ConfigValue } },
      )

    return {
      config: activeFeatures,
      totalCost,
      timestamp: new Date().toISOString(),
    }
  }, [config, totalCost])

  return {
    // State
    config,
    totalCost,
    featuresSchema: FEATURES_SCHEMA,

    // Actions
    toggleFeature,
    updateFeatureConfig,
    resetFeatureConfig,
    updateConfigAtPath,
    generate,

    // Helpers
    isFeatureEnabled: (featureId: string) => config[featureId]?.enabled || false,
    getFeatureCost: calculateFeatureCost,
    getFeatureConfig: (featureId: string) => config[featureId]?.config || {},
    getFeatureSchema: (featureId: string) => FEATURES_SCHEMA[featureId],
  }
}