import React, { ReactNode } from 'react';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`
      relative p-8 text-center transition-all duration-200 rounded-2xl shadow-medium border hover:shadow-large hover:-translate-y-1
      bg-white/95 border-white/30
      ${className}
    `}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white shadow-large bg-gradient-primary">
        {icon}
      </div>
      
      <h3 className="text-2xl font-semibold mb-2 text-text-primary">
        {title}
      </h3>
      
      <p className="mb-6 leading-relaxed text-text-secondary">
        {description}
      </p>
      
      {children}
    </div>
  );
}; 