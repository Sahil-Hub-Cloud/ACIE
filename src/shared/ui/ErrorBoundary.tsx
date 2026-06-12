import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: 'app' | 'widget';
  onLog?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
    if (this.props.onLog) {
      try {
        this.props.onLog(error, errorInfo);
      } catch (logError) {
        console.error("Failed to run custom logging hook inside ErrorBoundary:", logError);
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.variant === 'widget') {
        return (
          <div className="flex flex-col items-center justify-center p-4 text-center rounded-xl border border-rose-950/30 bg-slate-950/50 min-h-[140px] h-full w-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rose-500 mb-1.5 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="text-xs font-bold text-slate-200">Widget Error</span>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate">{this.state.error?.message || 'Failed to render.'}</p>
            <button
              onClick={this.handleRetry}
              className="mt-2.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              Retry
            </button>
          </div>
        );
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-950/40 bg-slate-950/60 backdrop-blur-md shadow-2xl max-w-xl mx-auto">
          {/* Warning Icon Graphic with glowing red drop shadow */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-950/20 border border-rose-800/30 text-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] mb-6 animate-pulse shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Telemetry Temporarily Unavailable
          </h2>
          
          {/* Description */}
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
            System remains operational. Some live data could not be loaded.
          </p>

          {/* Error Details */}
          {this.state.error && (
            <div className="w-full mb-8 rounded-xl border border-slate-900 bg-slate-950/90 p-4 font-mono text-[11px] text-left text-slate-500 overflow-x-auto max-h-[120px] scrollbar-thin">
              <span className="text-rose-400 font-semibold">Error:</span> {this.state.error.message}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center space-x-4">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              Retry
            </button>
            <button
              onClick={this.handleRefresh}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:from-cyan-400 hover:to-blue-500 transition-all duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
