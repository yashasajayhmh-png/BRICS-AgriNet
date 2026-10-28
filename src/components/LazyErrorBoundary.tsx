/**
 * Resilient Error Boundary for Dynamic Chunk Loading & Lazy Tab Navigation.
 * Catches chunk download failures (e.g. during sudden connectivity drops) and provides a graceful retry action.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LazyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Lazy Chunk / Component Error Boundary caught:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isChunkLoadError =
        this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Failed to fetch');

      return (
        <div className="p-8 my-6 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 max-w-xl mx-auto shadow-xl text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || (isChunkLoadError ? 'Connection Interrupted' : 'Section Temporarily Unavailable')}
          </h3>

          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            {isChunkLoadError
              ? 'A network interruption prevented loading this section. If you are in the field with poor cellular reception, reconnect or retry once signal improves.'
              : 'An unexpected runtime error occurred while rendering this component.'}
          </p>

          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
