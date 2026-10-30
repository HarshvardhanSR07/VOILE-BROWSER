import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Voile ErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#0B0F19] text-slate-200 p-8 select-none">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0D1527]/90 border border-sky-500/20 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {this.props.fallbackTitle || 'Something unexpected occurred'}
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Voile isolated this viewport error to protect your browsing session and prevent browser collapse.
            </p>
            {this.state.error && (
              <div className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-red-300 font-mono text-[11px] mb-6 text-left break-all max-h-28 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recover Viewport</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
