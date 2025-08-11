import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FiShield, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { TurnstileProvider } from '@/contexts/TurnstileContext';

interface TurnstileProtectionProps {
  children: React.ReactNode;
  onVerified?: () => void;
  skipInitialVerification?: boolean;
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
}

interface RenderTurnstileWidgetOptions {
  container: HTMLElement;
  onSuccess: (token: string) => void;
  onError: () => void;
  timeout?: number;
  isTemporary?: boolean;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export const TurnstileProtection: React.FC<TurnstileProtectionProps> = ({ 
  children, 
  onVerified, 
  skipInitialVerification = false 
}) => {
  const [isVerified, setIsVerified] = useState(skipInitialVerification);
  const [isLoading, setIsLoading] = useState(!skipInitialVerification);
  const [token, setToken] = useState<string | null>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [uniqueId, setUniqueId] = useState<string>('turnstile-widget-loading');
  
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  // Generate unique ID after component mounts to avoid hydration mismatch
  useEffect(() => {
    setUniqueId(`turnstile-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const renderTurnstileWidget = useCallback(({
    container,
    onSuccess,
    onError,
    timeout = 10000,
    isTemporary = false
  }: RenderTurnstileWidgetOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isConfigured || !window.turnstile) {
        onError();
        resolve(null);
        return;
      }

      if (isTemporary) {
        container.style.position = 'fixed';
        container.style.top = '-1000px';
        container.style.left = '-1000px';
        container.style.visibility = 'hidden';
        container.style.pointerEvents = 'none';
      }

      container.innerHTML = '';

      let hasResolved = false;
      let currentWidgetId: string | null = null;

      const cleanup = () => {
        if (window.turnstile && currentWidgetId) {
          try {
            window.turnstile.remove(currentWidgetId);
          } catch (error) {
            console.warn('Turnstile: Failed to remove widget during cleanup', error);
          }
        }
        if (isTemporary && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };

      const handleSuccess = (verificationToken: string) => {
        if (!hasResolved && verificationToken) {
          hasResolved = true;
          onSuccess(verificationToken);
          if (isTemporary) {
            cleanup();
          }
          resolve(verificationToken);
        }
      };

      const handleError = () => {
        if (!hasResolved) {
          hasResolved = true;
          onError();
          if (isTemporary) {
            cleanup();
          }
          resolve(null);
        }
      };

      try {
        currentWidgetId = window.turnstile.render(container, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: handleSuccess,
          'error-callback': handleError
        });

        setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true;
            console.warn('Turnstile: Widget rendering timed out');
            if (isTemporary) {
              cleanup();
            }
            resolve(null);
          }
        }, timeout);

        if (!isTemporary && currentWidgetId) {
          setWidgetId(currentWidgetId);
        }

      } catch (error) {
        console.error('Turnstile: Failed to render widget', error);
        handleError();
      }
    });
  }, [isConfigured]);

  const refreshToken = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isConfigured || !window.turnstile) {
        resolve(token);
        return;
      }

      // Create temporary container
      const tempContainer = document.createElement('div');
      document.body.appendChild(tempContainer);

      renderTurnstileWidget({
        container: tempContainer,
        onSuccess: (newToken: string) => {
          setToken(newToken);
          resolve(newToken);
        },
        onError: () => {
          console.error('Turnstile: Token refresh failed');
          resolve(token); // Return existing token as fallback
        },
        isTemporary: true
      });
    });
  }, [isConfigured, token, renderTurnstileWidget]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    setIsLoading(true);

    try {
      const container = containerRef.current;
      if (!container) {
        throw new Error('Container not found');
      }

      await renderTurnstileWidget({
        container,
        onSuccess: (verificationToken: string) => {
          setToken(verificationToken);
          setIsVerified(true);
          setIsLoading(false);
          setIsRetrying(false);
          onVerified?.();
        },
        onError: () => {
          setError('Verification failed. Please try again.');
          setIsLoading(false);
          setIsRetrying(false);
        }
      });
    } catch (err) {
      setError(`Failed to initialize verification. Please refresh the page. ${err}`);
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    // Skip initial verification if requested
    if (skipInitialVerification) {
      setIsVerified(true);
      setIsLoading(false);
      onVerified?.();
      return;
    }

    if (!isConfigured) {
      console.warn('Turnstile: No site key configured, skipping');
      setIsVerified(true);
      setIsLoading(false);
      onVerified?.();
      return;
    }

    if (!window.turnstile) {
      console.warn('Turnstile: Script not loaded, skipping');
      setIsVerified(true);
      setIsLoading(false);
      onVerified?.();
      return;
    }

    // Only proceed if we're in loading state and container is available
    if (!isLoading || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      console.error('Turnstile: Container not found');
      setError('Failed to initialize security verification');
      setIsLoading(false);
      return;
    }

    renderTurnstileWidget({
      container,
      onSuccess: (verificationToken: string) => {
        setToken(verificationToken);
        setIsVerified(true);
        setIsLoading(false);
        onVerified?.();
      },
      onError: () => {
        console.error('Turnstile: Verification failed');
        setError('Security verification failed');
        setIsLoading(false);
      }
    });

    // Cleanup function
    return () => {
      if (window.turnstile && widgetId) {
        try {
          window.turnstile.remove(widgetId);
        } catch (error) {
          console.warn('Turnstile: Failed to remove widget during cleanup', error);
        }
      }
      if (container) {
        container.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onVerified, isConfigured, skipInitialVerification, isLoading, renderTurnstileWidget]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto p-8">
          {/* Animated Shield Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FiShield size={32} className="text-white" />
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex items-center gap-3">
            <FiRefreshCw 
              size={20} 
              className={`text-blue-500 ${isRetrying ? 'animate-spin' : 'animate-spin'}`} 
            />
            <span className="text-sm text-gray-500">
              {isRetrying ? 'Retrying verification...' : 'Verifying...'}
            </span>
          </div>

          {/* Turnstile Container */}
          <div className="mt-4">
            <div ref={containerRef} id={uniqueId}></div>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto p-8 text-center">
          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-20"></div>
            <div className="relative w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <FiAlertCircle size={32} className="text-white" />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-600">
              Verification Failed
            </h2>
            <p className="text-gray-600">
              {error || 'Security verification could not be completed'}
            </p>
          </div>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="
              flex items-center gap-3 
              px-6 py-3 
              bg-gradient-to-r from-blue-500 to-purple-600 
              text-white font-medium 
              rounded-xl 
              transition-all duration-300 
              hover:from-blue-600 hover:to-purple-700 
              hover:shadow-lg hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:scale-100
            "
          >
            <FiRefreshCw 
              size={18} 
              className={isRetrying ? 'animate-spin' : ''} 
            />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-400 mt-4">
            If this problem persists, please refresh the page or contact support
          </p>
        </div>
      </div>
    );
  }

  return (
    <TurnstileProvider token={token} isConfigured={isConfigured} refreshToken={refreshToken}>
      {children}
    </TurnstileProvider>
  );
}; 