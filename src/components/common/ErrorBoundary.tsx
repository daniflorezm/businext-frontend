"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-8">
            <div className="bg-surface border border-danger/30 rounded-xl p-8 max-w-md w-full text-center shadow-lg flex flex-col items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-danger" />
              <h2 className="font-heading text-h3 font-bold text-danger">
                Algo salió mal
              </h2>
              <p className="text-body-sm text-foreground-muted">
                {this.state.message}
              </p>
              <Button
                variant="primary"
                onClick={() =>
                  this.setState({ hasError: false, message: "" })
                }
                className="mt-2"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
