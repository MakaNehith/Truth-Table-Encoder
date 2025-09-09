import React from 'react';

interface VariableSelectorProps {
  numVariables: number;
  onVariableChange: (num: number) => void;
  disabled: boolean;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({ numVariables, onVariableChange, disabled }) => {
  const options = [2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center mb-6">
      <label className="text-lg font-semibold mb-3 text-gray-300">Number of Variables</label>
      <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onVariableChange(option)}
            disabled={disabled}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
              numVariables === option
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariableSelector;
