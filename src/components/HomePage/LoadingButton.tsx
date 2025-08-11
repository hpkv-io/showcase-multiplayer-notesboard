import React, { ReactNode } from 'react';

interface LoadingButtonProps {
  children: ReactNode;
  isLoading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  variant?: 'primary' | 'secondary';
  loadingText?: string;
  'aria-label'?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  loadingText,
  'aria-label': ariaLabel
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        btn ${variantClasses[variant]}
        w-full px-6 py-4 text-base font-semibold relative overflow-hidden
        ${className}
      `}
      disabled={isLoading || disabled}
      aria-label={ariaLabel}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-[18px] h-[18px] border-2 border-transparent border-t-current rounded-full animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      )}
    </button>
  );
}; 