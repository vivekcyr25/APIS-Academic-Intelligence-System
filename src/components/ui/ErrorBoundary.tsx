import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from './Button';
import { Telemetry } from '../../services/telemetry/telemetryService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function dashboardHref(): string {
  const base = import.meta.env.BASE_URL || '/';
  // HashRouter: path lives after #
  return `${base}#/dashboard`;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Telemetry.logCrash(error, errorInfo.componentStack || undefined);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = dashboardHref();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full glass-panel-unified p-8 sm:p-10 rounded-3xl border border-rose-500/20 text-center">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-400" aria-hidden />
            </div>

            <h1 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
              This screen hit an unexpected error. Your saved academic data is unchanged. Try again, or return to the dashboard.
            </p>

            {this.state.error?.message && (
              <p className="mb-6 text-xs font-mono text-muted-foreground/80 bg-muted/50 rounded-xl px-3 py-2 break-words">
                {this.state.error.message}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden />
                Reload page
              </Button>
              <Button variant="outline" onClick={this.handleReset} className="w-full">
                <LayoutDashboard className="w-4 h-4 mr-2" aria-hidden />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
