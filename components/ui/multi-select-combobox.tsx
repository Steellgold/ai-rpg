"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Dna, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type Option = {
  value: string
  label: string
  description?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  badgeClassName?: string
  disabled?: boolean
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  emptyMessage = "No options found.",
  disabled = false
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  return (
    <Popover open={open && !disabled} onOpenChange={(value) => !disabled && setOpen(value)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          size={selected.length > 0 ? "default" : "icon"}
          aria-expanded={open}
          disabled={disabled}
          className={cn(disabled && "opacity-70 cursor-not-allowed", "h-8 rounded-full text-white  !border border", {
            "!w-8": selected.length === 0
          })}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <Dna className="h-4 w-4" />
            ) : (
              <span className="text-sm text-gray-400 flex flex-row items-center gap-1">
                {selected.length} genre{selected.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher des genres..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                    <div className="flex items-center">
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <div>
                        <div>{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}