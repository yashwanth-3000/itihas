"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const filterBadgeVariants = cva(
  "inline-flex items-center border text-xs leading-none",
  {
    variants: {
      variant: {
        default: "rounded-md gap-2 py-1 pl-2.5 pr-1",
        pill: "rounded-full gap-2 py-1 pl-2.5 pr-1",
        avatar: "rounded-full gap-2 px-1 py-1",
      },
      tone: {
        subtle: "bg-white/10 border-white/20 text-white/80",
        solid: "bg-white text-black border-white",
        transparent: "bg-transparent border-white/30 text-white/80",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      tone: "subtle",
      size: "sm",
    },
  }
);

export interface FilterBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof filterBadgeVariants> {
  label?: string;
  value?: string;
  avatarSrc?: string;
  children?: React.ReactNode;
  onRemove?: () => void;
}

export function FilterBadge({
  className,
  variant,
  tone,
  size,
  label,
  value,
  avatarSrc,
  children,
  onRemove,
  ...props
}: FilterBadgeProps) {
  if (variant === "avatar") {
    return (
      <span className={cn(filterBadgeVariants({ variant, tone, size }), className)} {...props}>
        {avatarSrc && (
          <img className="inline-block size-5 rounded-full" src={avatarSrc} alt="" />
        )}
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-0.5 flex size-5 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Remove"
          >
            <X className="size-3.5" aria-hidden={true} />
          </button>
        )}
      </span>
    );
  }

  const hasValue = typeof value === "string" ? value.length > 0 : Boolean(value);

  return (
    <span className={cn(filterBadgeVariants({ variant, tone, size }), className)} {...props}>
      {label}
      {hasValue && <span className="mx-2 h-4 w-px bg-white/20" />}
      {hasValue && <span className="font-medium text-white">{value}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "-ml-0.5 flex size-5 items-center justify-center rounded",
            "text-white/70 hover:bg-white/10 hover:text-white"
          )}
          aria-label="Remove"
        >
          <X className="size-3.5" aria-hidden={true} />
        </button>
      )}
    </span>
  );
}

