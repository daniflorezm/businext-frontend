"use client";
import React from "react";

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
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow">
              <h2 className="text-xl font-bold text-red-700 mb-2">
                Algo salió mal
              </h2>
              <p className="text-red-600 text-sm mb-4">{this.state.message}</p>
              <button
                onClick={() => this.setState({ hasError: false, message: "" })}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
