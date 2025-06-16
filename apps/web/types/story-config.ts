import type { z } from "zod"
import type React from "react"
import { LucideIcon, LucideProps } from "lucide-react"
import { COLOR } from "./color"

export type ConfigType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "range"
  | "file"
  | "array"
  | "group"

export type HTMLPropsForType<T extends ConfigType> = T extends "text" | "number" | "email" | "password" | "url" | "tel"
  ? React.InputHTMLAttributes<HTMLInputElement>
  : T extends "textarea"
    ? React.TextareaHTMLAttributes<HTMLTextAreaElement>
    : T extends "select"
      ? React.SelectHTMLAttributes<HTMLSelectElement>
      : T extends "file" | "checkbox" | "radio" | "range"
        ? React.InputHTMLAttributes<HTMLInputElement>
        : Record<string, never>

export type ConfigSchema<T extends ConfigType = ConfigType> = {
  type: T
  label: string
  description?: string
  icon?: React.ComponentType<LucideProps>
  cost?: number | ((value: ConfigValue, config?: Record<string, ConfigValue>) => number)
  default?: ConfigValue

  htmlProps?: HTMLPropsForType<T>
  config?: { [key: string]: ConfigSchema }

  options?: Array<{
    value: string
    label: string
    description?: string
    cost?: number

    config?: { [key: string]: ConfigSchema }
  }>

  itemConfig?: { [key: string]: ConfigSchema }
  maxItems?: number
  minItems?: number

  validation?: z.ZodSchema
  required?: boolean
}

export type FeatureSchema = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: COLOR
  baseCost: number
  config?: {
    [key: string]: ConfigSchema
  }
}

export type ConfigValue = string | number | boolean | ConfigValue[] | { [key: string]: ConfigValue }

export type FeatureConfig = {
  enabled: boolean
  config: { [key: string]: ConfigValue }
}

export type StoryConfig = {
  [featureId: string]: FeatureConfig
}