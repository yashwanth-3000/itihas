"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle, ChevronDown, Brain, Cpu, Zap } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Model Selector Component
export interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tier: 'fast' | 'balanced' | 'advanced';
  capabilities: string[];
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
  isDarkMode?: boolean;
}

const availableModels: ModelOption[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast, efficient, and cost-effective for most everyday tasks',
    icon: Zap,
    tier: 'fast',
    capabilities: ['Text generation', 'Q&A', 'Summarization', 'Translation']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Balanced model with strong reasoning and broad capabilities',
    icon: Cpu,
    tier: 'balanced',
    capabilities: ['Complex reasoning', 'Code analysis', 'Research', 'Writing']
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Most capable model for complex tasks requiring deep analysis',
    icon: Brain,
    tier: 'advanced',
    capabilities: ['Advanced reasoning', 'Complex analysis', 'Research', 'Creative tasks']
  }
];

const getTierColor = (tier: string, isDarkMode: boolean) => {
  switch (tier) {
    case 'fast':
      return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
    case 'balanced':
      return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    case 'advanced':
      return isDarkMode ? 'text-purple-400' : 'text-purple-600';
    default:
      return isDarkMode ? 'text-gray-400' : 'text-gray-600';
  }
};

const getTierBadgeColor = (tier: string, isDarkMode: boolean) => {
  switch (tier) {
    case 'fast':
      return isDarkMode 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'balanced':
      return isDarkMode 
        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
        : 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'advanced':
      return isDarkMode 
        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
        : 'bg-purple-50 text-purple-700 border border-purple-200';
    default:
      return isDarkMode 
        ? 'bg-gray-800 text-gray-300 border border-gray-600' 
        : 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  className,
  isDarkMode = true 
}: ModelSelectorProps) {
  const selectedModelData = availableModels.find(model => model.id === selectedModel) || availableModels[0];

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 text-sm",
              "rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              isDarkMode
                ? "bg-gray-800/80 border border-gray-700/40 text-gray-200 hover:bg-gray-700/80 focus:ring-gray-600/50"
                : "bg-white border border-gray-200/60 text-gray-900 hover:bg-gray-50 focus:ring-gray-400/50"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <selectedModelData.icon className={cn("w-4 h-4 flex-shrink-0", getTierColor(selectedModelData.tier, isDarkMode))} />
              <span className="font-medium truncate">{selectedModelData.name}</span>
              <span className={cn(
                "px-1.5 py-0.5 text-xs font-medium rounded capitalize",
                getTierBadgeColor(selectedModelData.tier, isDarkMode)
              )}>
                {selectedModelData.tier}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 ml-2", isDarkMode ? "text-gray-400" : "text-gray-500")} />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className={cn(
          "w-80 p-2",
          isDarkMode 
            ? "bg-gray-800/95 border-gray-700/40" 
            : "bg-white border-gray-200/60"
        )}>
          <DropdownMenuLabel>Choose Model</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {availableModels.map((model) => {
            const Icon = model.icon;
            const isSelected = model.id === selectedModel;
            
            return (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={cn(
                  "p-3 cursor-pointer focus:bg-accent rounded-lg",
                  isSelected && "bg-accent/50"
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={cn("w-5 h-5", getTierColor(model.tier, isDarkMode))} />
                  </div>
                  
                                     <div className="flex-1 min-w-0 space-y-1">
                     <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-sm">{model.name}</h3>
                       <span className={cn(
                         "px-1.5 py-0.5 text-xs font-medium rounded capitalize flex-shrink-0",
                         getTierBadgeColor(model.tier, isDarkMode)
                       )}>
                         {model.tier}
                       </span>
                     </div>
                     
                     <p className="text-xs text-muted-foreground leading-relaxed">
                       {model.description}
                     </p>
                   </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className={cn("w-4 h-4", getTierColor(model.tier, isDarkMode))} />
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Choose the model that best fits your task complexity and speed requirements.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} 