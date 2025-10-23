import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

const LogoIcon: React.FC<LogoIconProps> = ({ 
  className = '', 
  size = 32 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle with gradient */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#gradient1)"
        stroke="url(#gradient2)"
        strokeWidth="1.5"
      />
      
      {/* Inner glow */}
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="url(#gradient3)"
        opacity="0.3"
      />
      
      {/* Cross with shadow */}
      <path
        d="M16 8L16 24M8 16L24 16"
        stroke="url(#gradient4)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
      />
      
      {/* Book/Scroll with depth */}
      <path
        d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V20C22 21.1046 21.1046 22 20 22H12C10.8954 22 10 21.1046 10 20V12Z"
        fill="url(#gradient5)"
        stroke="white"
        strokeWidth="1.2"
        opacity="0.9"
      />
      
      {/* Text lines with gradient */}
      <path
        d="M12 14H20M12 16H18M12 18H16"
        stroke="url(#gradient6)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default LogoIcon;
