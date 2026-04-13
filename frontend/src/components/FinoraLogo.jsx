import React from 'react';

/**
 * Finora-Co Logo Component
 * Displays company logo image
 */
function FinoraLogo({ size = 40, variant = 'dark', showText = false }) {
  return (
    <img 
      src="/finora-logo.jpg" 
      alt="Finora-Co Logo"
      width={size * 2.5}
      height={size}
      style={{ 
        objectFit: 'contain',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
}

export default FinoraLogo;
