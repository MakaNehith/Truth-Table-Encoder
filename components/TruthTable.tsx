import React from 'react';

interface TruthTableProps {
  numVariables: number;
  outputs: number[];
  onToggleOutput: (index: number) => void;
}

const VARIABLE_NAMES = ['A', 'B', 'C', 'D', 'E'];

const TruthTable: React.FC<TruthTableProps> = ({ numVariables, outputs, onToggleOutput }) => {
  const rowCount = 2 ** numVariables;
  const headers = [...VARIABLE_NAMES.slice(0, numVariables), 'Y'];

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-cyan-400 uppercase bg-gray-700">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-3 text-center font-bold tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => {
              const inputs = rowIndex.toString(2).padStart(numVariables, '0').split('');
              return (
                <tr key={rowIndex} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                  {inputs.map((input, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`} className="px-6 py-3 text-center font-mono">
                      {input}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-center font-mono">
                    <button
                      onClick={() => onToggleOutput(rowIndex)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                        outputs[rowIndex] === 1 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {outputs[rowIndex]}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TruthTable;
