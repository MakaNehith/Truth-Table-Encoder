import React, { useState, useCallback } from 'react';
import VariableSelector from './components/VariableSelector';
import TruthTable from './components/TruthTable';
import OutputDisplay from './components/OutputDisplay';
import { ViewOption, VerilogOutput } from './types';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [numVariables, setNumVariables] = useState<number>(2);
  const [truthTable, setTruthTable] = useState<number[]>(() => new Array(2 ** 2).fill(0));
  const [activeView, setActiveView] = useState<ViewOption>('kmap');
  
  const [simplifiedFunction, setSimplifiedFunction] = useState<string | null>(null);
  const [kMapSvg, setKMapSvg] = useState<string | null>(null);
  const [circuitSvg, setCircuitSvg] = useState<string | null>(null);
  const [verilogContent, setVerilogContent] = useState<VerilogOutput | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCircuitLoading, setIsCircuitLoading] = useState<boolean>(false);
  const [isVerilogLoading, setIsVerilogLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetOutputs = () => {
    setSimplifiedFunction(null);
    setKMapSvg(null);
    setCircuitSvg(null);
    setVerilogContent(null);
    setError(null);
    setActiveView('kmap');
  };

  const handleVariableChange = (num: number) => {
    setNumVariables(num);
    setTruthTable(new Array(2 ** num).fill(0));
    resetOutputs();
  };

  const handleToggleOutput = (index: number) => {
    setTruthTable((prev) => {
      const newTable = [...prev];
      newTable[index] = newTable[index] === 0 ? 1 : 0;
      return newTable;
    });
  };

  const fetchCircuit = useCallback(async (func: string, vars: number) => {
    setIsCircuitLoading(true);
    try {
      const svg = await geminiService.generateCircuit(func, vars);
      setCircuitSvg(svg);
    } catch (err) {
      console.error("Circuit generation failed:", err);
      setCircuitSvg('<svg viewBox="0 0 100 50"><text x="50" y="25" fill="red" text-anchor="middle">Error generating circuit.</text></svg>');
    } finally {
        setIsCircuitLoading(false);
    }
  }, []);

  const fetchVerilog = useCallback(async (func: string, vars: number) => {
    setIsVerilogLoading(true);
    try {
      const content = await geminiService.generateVerilog(func, vars);
      setVerilogContent(content);
    } catch (err) {
      console.error("Verilog generation failed:", err);
      setVerilogContent({code: "Error generating Verilog.", testbench: "Error generating testbench."});
    } finally {
        setIsVerilogLoading(false);
    }
  }, []);

  const handleDecode = async () => {
    setIsLoading(true);
    resetOutputs();
    try {
      const { simplifiedFunction, kMapSvg } = await geminiService.generateLogicData(truthTable, numVariables);
      setSimplifiedFunction(simplifiedFunction);
      setKMapSvg(kMapSvg);
    } catch (err) {
      console.error(err);
      setError('An error occurred during decoding. This may be due to API rate limits. Please wait a moment and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (view: ViewOption) => {
    setActiveView(view);
    
    // Lazy-load content for the selected view if it doesn't exist yet and a function has been generated
    if (simplifiedFunction) {
        if (view === 'circuit' && !circuitSvg) {
            fetchCircuit(simplifiedFunction, numVariables);
        } else if (view === 'verilog' && !verilogContent) {
            fetchVerilog(simplifiedFunction, numVariables);
        }
    }
};


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          Truth Table Decoder
        </h1>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-6">
          <VariableSelector numVariables={numVariables} onVariableChange={handleVariableChange} disabled={isLoading}/>
          <TruthTable numVariables={numVariables} outputs={truthTable} onToggleOutput={handleToggleOutput} />
          <button 
            onClick={handleDecode} 
            disabled={isLoading}
            className="w-full max-w-md px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Decoding...' : 'Decode'}
          </button>
        </div>

        <div className="lg:min-h-[75vh]">
          <OutputDisplay 
            activeView={activeView}
            onViewChange={handleViewChange}
            simplifiedFunction={simplifiedFunction}
            kMapSvg={kMapSvg}
            circuitSvg={circuitSvg}
            verilogContent={verilogContent}
            isLoading={isLoading}
            isCircuitLoading={isCircuitLoading}
            isVerilogLoading={isVerilogLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
