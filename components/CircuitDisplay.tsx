import React from 'react';

interface CircuitDisplayProps {
  svgContent: string;
}

const CircuitDisplay: React.FC<CircuitDisplayProps> = ({ svgContent }) => {
  if (!svgContent) return null;

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
      <div
        className="w-full h-auto max-w-full max-h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export default CircuitDisplay;
