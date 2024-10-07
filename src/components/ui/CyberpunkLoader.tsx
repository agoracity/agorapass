import React from 'react';

interface CyberpunkLoaderProps {
  isLoading: boolean;
}

export const CyberpunkLoader: React.FC<CyberpunkLoaderProps> = ({ isLoading }) => {
  return (
    <div className={`absolute inset-0 z-50 bg-white rounded-xl overflow-hidden transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-5 h-5 bg-gradient-to-br from-cyan-400 to-fuchsia-600 opacity-10 animate-cyberpunk-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};