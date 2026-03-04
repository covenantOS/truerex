"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "next/link";
import { AlertTriangle, Home, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// =============================================================================
// Error Boundary (React Class Component)
// =============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          onReset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// Error Display (User-Friendly Error Message)
// =============================================================================

export interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onReset?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onReset,
  className,
}: ErrorDisplayProps) {
  // Provide more helpful messages based on error type
  const getHelpfulMessage = () => {
    if (!error) return message;
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
      return "You don't have permission to perform this action.";
    }
    if (errorMessage.includes("not found")) {
      return "The requested resource was not found.";
    }
    if (errorMessage.includes("timeout")) {
      return "The request took too long. Please try again.";
    }
    
    return message;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[50vh] p-6", className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">{getHelpfulMessage()}</p>
          
          {process.env.NODE_ENV === "development" && error && (
            <details className="text-left bg-muted rounded p-3 text-xs">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center pt-2">
            {onReset && (
              <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            <Button asChild size="sm">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Not Found Page (404)
// =============================================================================

export interface NotFoundPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

export function NotFoundPage({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
}: NotFoundPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-muted-foreground">404</span>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          <div className="flex gap-2 justify-center pt-2">
            {showHomeButton && (
              <Button asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Unauthorized Page (401/403)
// =============================================================================

export interface UnauthorizedPageProps {
  statusCode?: 401 | 403;
  title?: string;
  message?: string;
}

export function UnauthorizedPage({
  statusCode = 403,
  title = statusCode === 401 ? "Unauthorized" : "Access Denied",
  message = statusCode === 401
    ? "You need to be logged in to access this page."
    : "You don't have permission to view this page.",
}: UnauthorizedPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {statusCode}
            </span>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          <div className="flex gap-2 justify-center pt-2">
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">
                <Mail className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
          </div>
         </Card>
   </CardContent>
      </div>
  );
}

// =============================================================================
// API Error Handler (for API responses)
// =============================================================================

export interface ApiError {
  message?: string;
  code?: string;
  status?: number;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "An unexpected error occurred";
}
