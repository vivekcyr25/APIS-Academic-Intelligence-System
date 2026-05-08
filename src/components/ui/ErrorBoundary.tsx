import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
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

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Telemetry.logCrash(error, errorInfo.componentStack || undefined);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#030014]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-panel p-10 rounded-3xl border border-rose-500/20 text-center relative overflow-hidden"
          >
            {/* Background neural pulse for error */}
            <div className="absolute inset-0 bg-rose-500/5 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                <AlertTriangle className="w-10 h-10 text-rose-400" />
              </div>

              <h1 className="text-3xl font-black text-white mb-4 tracking-tight">APIS Encountered a Temporary Recovery Issue</h1>
              <p className="text-muted-foreground mb-10 leading-relaxed font-medium">
                Your academic memory remains safe and recoverable. A minor conflict occurred during synchronization.
              </p>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Recovery
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReset}
                  className="w-full border-white/10"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
