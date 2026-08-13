import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'auto';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const KreLinkIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <img
      src="/Kre8Link-06.svg"
      alt="Kre8link Icon"
      className={`${className} object-contain inline-block`}
    />
  );
};

export const KreLinkLogo: React.FC<LogoProps> = ({
  className = "",
  variant = 'dark',
  showText = true,
  size = 'md',
}) => {
  const heightClasses = {
    sm: 'h-4 sm:h-5',
    md: 'h-5 sm:h-6',
    lg: 'h-6 sm:h-7',
    xl: 'h-8 sm:h-9',
  };

  const filterClass = variant === 'light' ? 'brightness-0 invert' : '';

  if (showText) {
    return (
      <div className={`inline-flex items-center font-bold tracking-tight select-none ${className}`}>
        <img
          src="/Kre8Link-06.svg"
          alt="Kre8link Logo"
          className={`${heightClasses[size]} w-auto object-contain ${filterClass}`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center font-bold tracking-tight select-none ${className}`}>
      <KreLinkIcon className={heightClasses[size]} />
    </div>
  );
};

