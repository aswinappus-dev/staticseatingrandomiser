import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';

const AnimatedLogo: React.FC = () => {
  const location = useLocation();
  // Using a key that changes on navigation will force React to re-mount the component,
  // which effectively restarts the CSS animation.
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prevKey => prevKey + 1);
  }, [location.pathname]);

  return (
    <div key={animationKey} className="flex items-center transition-transform duration-300 ease-in-out hover:scale-110">
      <Logo className="w-8 h-8 animated-svg-logo" />
    </div>
  );
};

export default AnimatedLogo;
