import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" className={className}>
      <rect x="10" y="10" width="100" height="100" rx="20" stroke="#1E88E5" strokeWidth="6" fill="none" className="logo-frame" />
      <path d="M35 60 L52 77 L85 43" stroke="#1E88E5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="logo-checkmark" />
      <path d="M15 80 Q55 95 105 60" stroke="#1E88E5" strokeWidth="5" strokeLinecap="round" fill="none" className="logo-flow" />
    </svg>
  );
};

export default Logo;