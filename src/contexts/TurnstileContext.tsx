import React, { createContext, useContext, ReactNode, useCallback } from 'react';

interface TurnstileContextType {
  token: string | null;
  isConfigured: boolean;
  refreshToken: () => Promise<string | null>;
  createUrlWithToken: (baseUrl: string, params?: Record<string, string>) => Promise<string>;
}

const TurnstileContext = createContext<TurnstileContextType | null>(null);

interface TurnstileProviderProps {
  children: ReactNode;
  token: string | null;
  isConfigured: boolean;
  refreshToken: () => Promise<string | null>;
}

export const TurnstileProvider: React.FC<TurnstileProviderProps> = ({ 
  children, 
  token, 
  isConfigured,
  refreshToken
}) => {
  const createUrlWithToken = useCallback(async (baseUrl: string, params: Record<string, string> = {}): Promise<string> => {
    const urlParams = new URLSearchParams(params);
    
    if (isConfigured) {
      let tokenToUse = token;
      
      tokenToUse = await refreshToken();
      if (!tokenToUse) {
        throw new Error('Failed to refresh Turnstile token');
      }
      
      urlParams.append('turnstileToken', tokenToUse);
    }
    
    const queryString = urlParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [isConfigured, refreshToken, token]);

  return (
    <TurnstileContext.Provider value={{ 
      token, 
      isConfigured, 
      refreshToken, 
      createUrlWithToken 
    }}>
      {children}
    </TurnstileContext.Provider>
  );
};

export const useTurnstile = () => {
  const context = useContext(TurnstileContext);
  if (!context) {
    throw new Error('useTurnstile must be used within a TurnstileProvider');
  }
  return context;
}; 