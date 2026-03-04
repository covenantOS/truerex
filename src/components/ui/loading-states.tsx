"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

// =============================================================================
// Loading Spinner
// =============================================================================

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
    </div>
  );
}

// =============================================================================
// Skeleton Components
// =============================================================================

export interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 border-b" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                "h-4 bg-muted rounded animate-pulse",
                colIndex === 0 ? "w-3/4" : "w-full"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export interface SkeletonListProps {
  items?: number;
  withAvatar?: boolean;
  className?: string;
}

export function SkeletonList({
  items = 5,
  withAvatar = true,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          {withAvatar && (
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
          )}
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Page Loader (Full Screen)
// =============================================================================

export interface PageLoaderProps {
  text?: string;
  className?: string;
}

export function PageLoader({ text = "Loading...", className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] gap-4",
        className
      )}
    >
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

// =============================================================================
// Button with Loading State
// =============================================================================

export interface ButtonLoadingProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const ButtonLoading = React.forwardRef<HTMLButtonElement, ButtonLoadingProps>(
  ({ className, children, loading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("gap-2", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? loadingText || children : children}
      </Button>
    );
  }
);

ButtonLoading.displayName = "ButtonLoading";

// =============================================================================
// Card with Loading State
// =============================================================================

export interface CardLoadingProps {
  className?: string;
}

export function CardLoading({ className }: CardLoadingProps) {
  return (
    <div className={cn("bg-card rounded-lg border p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
