export type ViewOption = 'kmap' | 'circuit' | 'verilog';

export interface VerilogOutput {
  code: string;
  testbench: string;
}
