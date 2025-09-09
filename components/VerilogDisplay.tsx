import React, { useState } from 'react';
import { VerilogOutput } from '../types';

interface VerilogDisplayProps {
  content: VerilogOutput;
}

const CodeBlock: React.FC<{ title: string; code: string }> = ({ title, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden relative">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
                <h3 className="text-sm font-semibold text-cyan-400">{title}</h3>
                <button
                    onClick={handleCopy}
                    className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 px-2 py-1 rounded transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const VerilogDisplay: React.FC<VerilogDisplayProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="w-full space-y-4">
      <CodeBlock title="Verilog Module" code={content.code} />
      <CodeBlock title="Testbench" code={content.testbench} />
    </div>
  );
};

export default VerilogDisplay;
