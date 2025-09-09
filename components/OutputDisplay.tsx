import React from 'react';
import { ViewOption, VerilogOutput } from '../types';
import KMapDisplay from './KMapDisplay';
import CircuitDisplay from './CircuitDisplay';
import VerilogDisplay from './VerilogDisplay';
import Spinner from './Spinner';

interface OutputDisplayProps {
  activeView: ViewOption;
  onViewChange: (view: ViewOption) => void;
  simplifiedFunction: string | null;
  kMapSvg: string | null;
  circuitSvg: string | null;
  verilogContent: VerilogOutput | null;
  isLoading: boolean;
  isCircuitLoading: boolean;
  isVerilogLoading: boolean;
  error: string | null;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  activeView,
  onViewChange,
  simplifiedFunction,
  kMapSvg,
  circuitSvg,
  verilogContent,
  isLoading,
  isCircuitLoading,
  isVerilogLoading,
  error,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Spinner />
            <p className="mt-4 text-gray-400">Decoding truth table...</p>
        </div>
      );
    }
    if (error) {
      return <div className="text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>;
    }
    if (!simplifiedFunction) {
      return (
        <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 18h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            <p>Your decoded results will appear here.</p>
            <p className="text-sm mt-1">Modify the truth table and click "Decode".</p>
        </div>
      );
    }

    switch (activeView) {
      case 'kmap':
        // The wrapper div ensures the KMap aligns to the top instead of centering
        return (
          <div className="w-full h-full flex items-start justify-center">
            {kMapSvg ? <KMapDisplay svgContent={kMapSvg} /> : <p>Could not generate K-Map.</p>}
          </div>
        );
      case 'circuit':
        if(isCircuitLoading) return <Spinner/>
        return circuitSvg ? <CircuitDisplay svgContent={circuitSvg} /> : <p>Could not generate Circuit Diagram.</p>;
      case 'verilog':
        if(isVerilogLoading) return <Spinner/>
        return verilogContent ? <VerilogDisplay content={verilogContent} /> : <p>Could not generate Verilog code.</p>;
      default:
        return null;
    }
  };

  const TABS: { id: ViewOption; label: string }[] = [
    { id: 'kmap', label: 'Karnaugh Map' },
    { id: 'circuit', label: 'Logic Circuit' },
    { id: 'verilog', label: 'Verilog Code' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-xl shadow-2xl p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-300 mb-2">Simplified Logic Function</h2>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-cyan-400 min-h-[50px] flex items-center">
          {isLoading ? 'Generating...' : simplifiedFunction || 'Y = ...'}
        </div>
      </div>

      {simplifiedFunction && !isLoading && (
        <div className="flex border-b border-gray-700 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`py-2 px-4 text-sm font-medium transition-colors duration-200 focus:outline-none -mb-px
                ${activeView === tab.id
                  ? 'border-b-2 border-cyan-500 text-cyan-400'
                  : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex-grow min-h-0">{renderContent()}</div>
    </div>
  );
};

export default OutputDisplay;
