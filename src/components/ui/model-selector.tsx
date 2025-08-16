import * as React from "react"
import { Brain } from "lucide-react"
import { cn } from '../../lib/utils'

interface ModelSelectorProps {
  className?: string;
  isDarkMode?: boolean;
}

export function ModelSelector({ 
  className,
  isDarkMode = true 
}: ModelSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2.5 text-sm",
          "rounded-lg transition-all duration-200",
          isDarkMode
            ? "bg-gray-800/80 border border-gray-700/40 text-gray-200"
            : "bg-white border border-gray-200/60 text-gray-900"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Brain className={cn("w-4 h-4 flex-shrink-0", isDarkMode ? "text-blue-400" : "text-blue-600")} />
          <span className="font-medium">IBM Granite-3-8B</span>
        </div>
      </div>
    </div>
  );
}