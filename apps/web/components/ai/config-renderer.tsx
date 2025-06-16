"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import type { ConfigSchema, ConfigValue } from "@/types/story-config"
import { Textarea } from "@workspace/ui/components/textarea"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Slider } from "@workspace/ui/components/slider"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { useTranslations } from "next-intl"
import { BadgeBonusCredit } from "./credits-badge"

type ConfigRendererProps = {
  schema: { [key: string]: ConfigSchema }
  values: { [key: string]: ConfigValue }
  onChange: (key: string, value: ConfigValue) => void
  path?: string
  level?: number
}

export const ConfigRenderer = ({ schema, values, onChange, path = "", level = 0 }: ConfigRendererProps) => {
  const t = useTranslations("ConfigRenderer")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(key)) newExpanded.delete(key)
    else newExpanded.add(key)
    setExpandedGroups(newExpanded)
  }

  const renderSingleConfig = (key: string, configSchema: ConfigSchema, value: ConfigValue) => {
    const fullPath = path ? `${path}.${key}` : key
    const isExpanded = expandedGroups.has(fullPath)

    const getCost = (): number => {
      if (typeof configSchema.cost === "function") {
        return configSchema.cost(value, values)
      }
      return configSchema.cost || 0
    }

    const renderInput = () => {
      switch (configSchema.type) {
        case "text":
        case "email":
        case "password":
        case "url":
        case "tel":
          return (
            <Input
              type={configSchema.type}
              value={(value as string) || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(key, e.target.value)}
              {...(configSchema.htmlProps as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )

        case "number":
          return (
            <Input
              type="number"
              value={(value as number) || 0}
              className="w-[150px]"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(key, Number(e.target.value))}
              {...(configSchema.htmlProps as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )

        case "textarea":
          return (
            <Textarea
              value={(value as string) || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(key, e.target.value)}
              {...(configSchema.htmlProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          )

        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={(value as boolean) || false}
                onCheckedChange={(checked: boolean) => onChange(key, checked)}
              />
              <Label className="text-sm text-gray-300">
                {configSchema.label}
              </Label>
            </div>
          )

        case "select":
          return (
            <Select 
              value={(value as string) || ""} 
              onValueChange={(newValue: string) => onChange(key, newValue)}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {configSchema.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.cost && option.cost > 0 ? (
                        <BadgeBonusCredit nbr={option.cost} />
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case "range":
          return (
            <div className="space-y-2">
              <Slider
                value={[(value as number) || 0]}
                onValueChange={([newValue]: number[]) => onChange(key, newValue ?? 0)}
                min={Number((configSchema.htmlProps as React.InputHTMLAttributes<HTMLInputElement>)?.min) || 0}
                max={Number((configSchema.htmlProps as React.InputHTMLAttributes<HTMLInputElement>)?.max) || 100}
                step={Number((configSchema.htmlProps as React.InputHTMLAttributes<HTMLInputElement>)?.step) || 1}
                className="w-full"
              />
              <div className="text-xs text-gray-400 text-center">
                {(value as number) || 0}
              </div>
            </div>
          )

        case "array": {
          const arrayValue = (value as Record<string, ConfigValue>[]) || []
          return (
            <div className="space-y-3">
              {arrayValue.map((item, index) => (
                <Card key={index} className="p-3 bg-gray-800/30 border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      {t("element")}
                      <span className={cn(
                        "ml-1",
                        "text-indigo-400",
                        "bg-indigo-500/10",
                        "border border-indigo-500/30",
                        "px-1.5 py-0.5 rounded-md"
                      )}>
                        {index + 1}
                      </span>
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newArray = [...arrayValue]
                        newArray.splice(index, 1)
                        onChange(key, newArray)
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>

                  {configSchema.itemConfig && (
                    <ConfigRenderer
                      schema={configSchema.itemConfig}
                      values={item || {}}
                      onChange={(itemKey: string, itemValue: ConfigValue) => {
                        const newArray = [...arrayValue]
                        newArray[index] = { ...newArray[index], [itemKey]: itemValue }
                        onChange(key, newArray)
                      }}
                      path={`${fullPath}[${index}]`}
                      level={level + 1}
                    />
                  )}
                </Card>
              ))}

              {(!configSchema.maxItems || arrayValue.length < configSchema.maxItems) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem = configSchema.itemConfig
                      ? Object.keys(configSchema.itemConfig).reduce((acc: Record<string, ConfigValue>, k) => {
                          acc[k] = configSchema.itemConfig![k]?.default || ""
                          return acc
                        }, {})
                      : {}
                    onChange(key, [...arrayValue, newItem])
                  }}
                  className="w-full border-dashed border-gray-600 text-gray-400 hover:text-gray-300"
                >
                  <Plus size={14} />
                  {t("add_element")}
                </Button>
              )}
            </div>
          )
        }

        case "group":
          return (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroup(fullPath)}
                className="w-full justify-start p-2 h-auto text-gray-300 hover:text-gray-100"
              >
                {isExpanded
                  ? <ChevronDown size={16} />
                  : <ChevronRight size={16} />
                }
                <span className="ml-2">{configSchema.label}</span>
              </Button>

              {isExpanded && configSchema.config && (
                <div className="ml-4 pl-4 border-l-2 border-gray-700/50 space-y-4">
                  <ConfigRenderer
                    schema={configSchema.config}
                    values={(value as Record<string, ConfigValue>) || {}}
                    onChange={(subKey: string, subValue: ConfigValue) => {
                      const currentValue = (value as Record<string, ConfigValue>) || {}
                      onChange(key, { ...currentValue, [subKey]: subValue })
                    }}
                    path={fullPath}
                    level={level + 1}
                  />
                </div>
              )}
            </div>
          )

        default:
          return (
            <div className="text-red-400 text-sm">
              {t("not_supported", { type: configSchema.type })}
            </div>
          )
      }
    }

    const renderConditionalConfig = () => {
      if (configSchema.type === "select" && configSchema.options) {
        const selectedOption = configSchema.options.find((opt) => opt.value === value)
        if (selectedOption?.config) {
          const conditionalKey = `${key}_config`
          const conditionalValue = (values[conditionalKey] as Record<string, ConfigValue>) || {}

          return (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-3">
              <ConfigRenderer
                schema={selectedOption.config}
                values={conditionalValue}
                onChange={(subKey: string, subValue: ConfigValue) => {
                  onChange(conditionalKey, {
                    ...conditionalValue,
                    [subKey]: subValue
                  })
                }}
                path={`${fullPath}_config`}
                level={level + 1}
              />
            </div>
          )
        }
      }
      return null
    }

    if (configSchema.type === "checkbox") {
      return (
        <div key={key} className="space-y-2">
          <div className="flex items-center">
            {renderInput()}
            {getCost() > 0 && <BadgeBonusCredit nbr={getCost()} />}
          </div>

          {configSchema.description && <p className="text-xs text-gray-500">{configSchema.description}</p>}
          {renderConditionalConfig()}
        </div>
      )
    }

    return (
      <div key={key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-300">
            {configSchema.label}
            {configSchema.required && <span className="text-red-400 ml-1">{t("required")}</span>}
          </Label>

          {getCost() > 0 && (
            <BadgeBonusCredit nbr={getCost()} />
          )}
        </div>

        {renderInput()}

        {configSchema.description && <p className="text-xs text-gray-500">{configSchema.description}</p>}

        {renderConditionalConfig()}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", level > 0 && "pl-2")}>
      {Object.entries(schema).map(([key, configSchema]) =>
        renderSingleConfig(
          key,
          configSchema,
          values[key] !== undefined
            ? values[key]
            : configSchema.type === "checkbox"
              ? false
              : configSchema.type === "array"
                ? []
                : configSchema.type === "group"
                  ? {}
                  : ""
        )
      )}
    </div>
  )
}