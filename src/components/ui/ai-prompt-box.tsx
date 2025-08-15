"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUp, Paperclip, Square, X, Globe, BrainCog, ScrollText, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-sm resize-none",
      "text-gray-900 dark:text-gray-100",
      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
      "focus-visible:outline-none focus-visible:ring-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "min-h-[44px]",
      "selection:bg-blue-200 dark:selection:bg-blue-800",
      className
    )}
    ref={ref}
    rows={1}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Dialog Components
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-gray-200/80 dark:bg-gray-700/80 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
        <X className="h-5 w-5 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white hover:bg-white/80 text-black",
      outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
      ghost: "bg-transparent hover:bg-[#3A3A40]",
    };
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full aspect-[1/1]",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// VoiceRecorder Component
interface VoiceRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (duration: number) => void;
  visualizerBars?: number;
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  visualizerBars = 32,
}) => {
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isRecording) {
      onStartRecording();
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onStopRecording(time);
      setTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, time, onStartRecording, onStopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full transition-all duration-300 py-3",
        isRecording ? "opacity-100" : "opacity-0 h-0"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-xs text-gray-800/80 dark:text-white/80">{formatTime(time)}</span>
      </div>
      <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
        {[...Array(visualizerBars)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-gray-600/50 dark:bg-white/50 animate-pulse"
            style={{
              height: `${Math.max(15, Math.random() * 100)}%`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ImageViewDialog Component
interface ImageViewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-[800px]">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-[#1F2023] rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={imageUrl}
            alt="Full preview"
            className="w-full max-h-[80vh] object-contain rounded-2xl"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// PromptInput Context and Components
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});
function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) throw new Error("usePromptInput must be used within a PromptInput");
  return context;
}

interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
      onDragOver,
      onDragLeave,
      onDrop,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "rounded-3xl border p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
              "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
              "hover:border-gray-400 dark:hover:border-gray-500",
              "focus-within:border-blue-500 dark:focus-within:border-blue-400",
              "focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] dark:focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.1)]",
              isLoading && "border-red-500/70",
              className
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = "PromptInput";

interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
}
const PromptInputTextarea: React.FC<PromptInputTextareaProps & React.ComponentProps<typeof Textarea>> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

interface PromptInputActionsProps extends React.HTMLAttributes<HTMLDivElement> {}
const PromptInputActions: React.FC<PromptInputActionsProps> = ({ children, className, ...props }) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

// Custom Divider Component
const CustomDivider: React.FC = () => (
  <div className="relative h-6 w-[1.5px] mx-1">
    <div
      className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full"
      style={{
        clipPath: "polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)",
      }}
    />
  </div>
);

// Main PromptInputBox Component
interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  onThinkModeChange?: (isThinkMode: boolean) => void;
  isThinkMode?: boolean;
  onShowLogsToggle?: () => void;
  showLogs?: boolean;
  initialValue?: string;
  // New options for specialized UIs (e.g., Explore page)
  searchAlwaysOn?: boolean; // keep Search mode always enabled (non-toggle)
  hideThinkAndLogs?: boolean; // hide Think and Logs controls entirely
  hideThinkOnly?: boolean; // hide only Think button, keep Logs button
  showLocationButton?: boolean; // show Location control to attach coordinates
  autoDetectLocation?: boolean; // automatically detect location on component mount
}
export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>((props, ref) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Type your message here...", className, onThinkModeChange, isThinkMode = false, onShowLogsToggle, showLogs = false, initialValue, searchAlwaysOn = false, hideThinkAndLogs = false, hideThinkOnly = false, showLocationButton = false, autoDetectLocation = false } = props;
  const [input, setInput] = React.useState(initialValue || "");
  const [files, setFiles] = React.useState<File[]>([]);
  const [filePreviews, setFilePreviews] = React.useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const [showSearch, setShowSearch] = React.useState(searchAlwaysOn);
  const [showThink, setShowThink] = React.useState(isThinkMode);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const promptBoxRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [placeName, setPlaceName] = React.useState<string | null>(null);

  // Sync showThink state with isThinkMode prop
  React.useEffect(() => {
    setShowThink(isThinkMode);
  }, [isThinkMode]);

  // Sync external initial value into input when it changes
  React.useEffect(() => {
    if (typeof initialValue === 'string') {
      setInput(initialValue);
    }
  }, [initialValue]);

  // Auto-detect location on mount if enabled
  React.useEffect(() => {
    if (autoDetectLocation && !coords) {
      requestLocation();
    }
  }, [autoDetectLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleChange = (value: string) => {
    if (value === "search") {
      // When search is locked on, ignore toggling
      if (!searchAlwaysOn) {
        setShowSearch((prev) => !prev);
        setShowThink(false);
        onThinkModeChange?.(false);
      }
    } else if (value === "think") {
      const newThinkState = !showThink;
      setShowThink(newThinkState);
      setShowSearch(false);
      onThinkModeChange?.(newThinkState);
    }
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)");
      return;
    }
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => isImageFile(file));
    if (imageFiles.length > 0) processFile(imageFiles[0]);
  }, []);

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove && filePreviews[fileToRemove.name]) setFilePreviews({});
    setFiles([]);
  };

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

  const handlePaste = React.useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          break;
        }
      }
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleSubmit = async () => {
    if (input.trim() || files.length > 0) {
      // Lock search mode if requested
      const useSearch = searchAlwaysOn ? true : showSearch;
      // Ensure place name is available if we have coordinates
      if (coords && !placeName) {
        try {
          const n = await reverseGeocode(coords.lat, coords.lng);
          setPlaceName(n);
        } catch {}
      }
      let base = useSearch ? `[Search: ${input}]` : showThink ? `[Think: ${input}]` : input;
      if (coords) base = `${base} [Location: ${placeName || 'Current Location'}]`;
      onSend(base, files);
      setInput("");
      setFiles([]);
      setFilePreviews({});
    }
  };



  const requestLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      console.log('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
        reverseGeocode(position.coords.latitude, position.coords.longitude)
          .then(name => setPlaceName(name))
          .catch(() => setPlaceName(null));
      },
      (error) => {
        console.log('Location error:', error.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
    );
  };

  async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    // Try Google's Geocoding API first (more reliable)
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
        const res = await fetch(googleUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && data.results?.length > 0) {
            const result = data.results[0];
            // Extract city, state, country from address components
            const components = result.address_components || [];
            const city = components.find((c: any) => c.types.includes('locality'))?.long_name ||
                        components.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name;
            const state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name;
            const country = components.find((c: any) => c.types.includes('country'))?.long_name;
            
            const parts = [city, state, country].filter(Boolean);
            if (parts.length > 0) {
              return parts.join(', ');
            }
            // Fallback to formatted address
            return result.formatted_address || null;
          }
        }
      } catch (error) {
        console.log('Google reverse geocoding failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Fallback to Nominatim
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Shorter timeout
      
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { 
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'ExploreApp/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) return null;
      const data = await res.json();
      const a = data?.address || {};
      const parts = [a.city || a.town || a.village || a.hamlet, a.state, a.country].filter(Boolean);
      return (parts.join(', ') || data?.display_name || null);
    } catch (error) {
      console.log('Nominatim reverse geocoding failed (non-critical):', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  const hasContent = input.trim() !== "" || files.length > 0;

  return (
    <>
      <style jsx>{`
        *:focus-visible {
          outline-offset: 0 !important;
          --ring-offset: 0 !important;
        }
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background-color: rgb(156 163 175);
          border-radius: 3px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background-color: rgb(107 114 128);
        }
        .dark textarea::-webkit-scrollbar-thumb {
          background-color: rgb(75 85 99);
        }
        .dark textarea::-webkit-scrollbar-thumb:hover {
          background-color: rgb(107 114 128);
        }
      `}</style>
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className={cn(
          "w-full shadow-lg transition-all duration-300 ease-in-out rounded-2xl",
          className
        )}
        disabled={isLoading}
        ref={ref || promptBoxRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith("image/") && filePreviews[file.name] && (
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                    onClick={() => openImageModal(filePreviews[file.name])}
                  >
                    <img
                      src={filePreviews[file.name]}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="transition-all duration-300 opacity-100">
          <PromptInputTextarea
            placeholder={
              searchAlwaysOn
                ? placeholder
                : showSearch
                ? "Search the web..."
                : showThink
                ? "Think deeply..."
                : placeholder
            }
            className="text-base"
          />
        </div>

        <PromptInputActions className="flex items-center justify-between gap-2 p-0 pt-2">
          <div className="flex items-center gap-1 transition-opacity duration-300 opacity-100 visible">
            <PromptInputAction tooltip="Upload image">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="flex h-8 w-8 text-gray-500 dark:text-gray-400 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Paperclip className="h-5 w-5 transition-colors" />
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
                    if (e.target) e.target.value = "";
                  }}
                  accept="image/*"
                />
              </button>
            </PromptInputAction>

            <div className="flex items-center">
              {/* Search pill (always visible). If searchAlwaysOn, it is locked ON */}
              <button
                type="button"
                onClick={() => handleToggleChange("search")}
                aria-disabled={searchAlwaysOn}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                  (searchAlwaysOn || showSearch)
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: (searchAlwaysOn || showSearch) ? 360 : 0, scale: (searchAlwaysOn || showSearch) ? 1.1 : 1 }}
                    whileHover={{ rotate: (searchAlwaysOn || showSearch) ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  >
                    <Globe className={cn("w-4 h-4", (searchAlwaysOn || showSearch) ? "text-white dark:text-black" : "text-inherit")} />
                  </motion.div>
                </div>
                <span className="text-[10px] overflow-hidden whitespace-nowrap text-inherit flex-shrink-0">Search</span>
              </button>

              {showLocationButton && (
                <>
                  <CustomDivider />
                  <button
                    type="button"
                    onClick={requestLocation}
                    className={cn(
                      "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                      coords
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <motion.div
                        animate={{ rotate: coords ? 360 : 0, scale: coords ? 1.1 : 1 }}
                        whileHover={{ rotate: coords ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                      >
                        <MapPin className={cn("w-4 h-4", coords ? "text-white dark:text-black" : "text-inherit")} />
                      </motion.div>
                    </div>
                    <span className="text-[10px] overflow-hidden whitespace-nowrap text-inherit flex-shrink-0">
                      {isLocating ? "Locating..." : placeName || (coords ? "Location detected" : "Location")}
                    </span>
                  </button>
                </>
              )}

              {!hideThinkAndLogs && (
                <>
                  {!hideThinkOnly && (
                    <>
                      <CustomDivider />
                      <button
                        type="button"
                        onClick={() => handleToggleChange("think")}
                        className={cn(
                          "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                          showThink
                            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                            : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <motion.div
                            animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                            whileHover={{ rotate: showThink ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                            transition={{ type: "spring", stiffness: 260, damping: 25 }}
                          >
                            <BrainCog className={cn("w-4 h-4", showThink ? "text-white dark:text-black" : "text-inherit")} />
                          </motion.div>
                        </div>
                        <span className="text-[10px] overflow-hidden whitespace-nowrap text-inherit flex-shrink-0">Think</span>
                      </button>
                    </>
                  )}

                  <CustomDivider />

                  <button
                    type="button"
                    onClick={onShowLogsToggle}
                    className={cn(
                      "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                      showLogs
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <motion.div
                        animate={{ rotate: showLogs ? 360 : 0, scale: showLogs ? 1.1 : 1 }}
                        whileHover={{ rotate: showLogs ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                      >
                        <ScrollText className={cn("w-4 h-4", showLogs ? "text-white dark:text-black" : "text-inherit")} />
                      </motion.div>
                    </div>
                    <span className="text-[10px] overflow-hidden whitespace-nowrap text-inherit flex-shrink-0">Logs</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <PromptInputAction
            tooltip={
              isLoading
                ? "Stop generation"
                : hasContent
                ? "Send message"
                : "Type a message to send"
            }
          >
            <Button
              variant="default"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                hasContent
                  ? "bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
              onClick={handleSubmit}
              disabled={isLoading || !hasContent}
            >
              {isLoading ? (
                <Square className="h-4 w-4 animate-pulse" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
});
PromptInputBox.displayName = "PromptInputBox"; 