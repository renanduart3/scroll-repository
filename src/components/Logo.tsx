import React from 'react';
import LogoIcon from './LogoIcon';
import palavraVivaLogo from '../img/palavra-viva.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  useCustomImage?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true,
  useCustomImage = true
}) => {
  const sizeClasses = {
    sm: { size: 24, class: 'h-6 w-auto max-w-16' },
    md: { size: 32, class: 'h-8 w-auto max-w-20' },
    lg: { size: 48, class: 'h-12 w-auto max-w-24' }
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {useCustomImage ? (
          <img 
            src={palavraVivaLogo} 
            alt="Palavra Viva" 
            className={`${sizeClasses[size].class} object-contain drop-shadow-sm hover:drop-shadow-md transition-all duration-200`}
          />
        ) : (
          <LogoIcon 
            size={sizeClasses[size].size}
            className={`${sizeClasses[size].class} rounded-lg shadow-sm`}
          />
        )}
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-serif font-bold`}>
          Palavra Viva
        </span>
      )}
    </div>
  );
};

export default Logo;
