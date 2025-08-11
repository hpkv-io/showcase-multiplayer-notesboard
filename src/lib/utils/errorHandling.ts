export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: Record<string, unknown>;
  severity?: ErrorSeverity;
}

export const logError = (error: Error | string, info?: ErrorInfo): void => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const severity = info?.severity || ErrorSeverity.MEDIUM;
  
  const logData = {
    message: errorMessage,
    code: info?.code,
    context: info?.context,
    severity,
    timestamp: new Date().toISOString(),
    stack: typeof error === 'object' ? error.stack : undefined
  };

  switch (severity) {
    case ErrorSeverity.LOW:
      console.info('[ERROR-LOW]', logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('[ERROR-MEDIUM]', logData);
      break;
    case ErrorSeverity.HIGH:
      console.error('[ERROR-HIGH]', logData);
      break;
    case ErrorSeverity.CRITICAL:
      console.error('[ERROR-CRITICAL]', logData);
      break;
  }
};

export const handleStorageError = (operation: string, error: unknown): void => {
  logError(
    error instanceof Error ? error : new Error(String(error)),
    {
      message: `Storage operation failed: ${operation}`,
      code: 'STORAGE_ERROR',
      context: { operation },
      severity: ErrorSeverity.LOW
    }
  );
};

export const handleAPIError = (operation: string, error: unknown): void => {
  logError(
    error instanceof Error ? error : new Error(String(error)),
    {
      message: `API operation failed: ${operation}`,
      code: 'API_ERROR',
      context: { operation },
      severity: ErrorSeverity.HIGH
    }
  );
};

export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return 'Permission denied. Please refresh the page and try again.';
    }
    if (error.message.includes('storage') || error.message.includes('quota')) {
      return 'Storage limit reached. Please clear some data and try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}; 