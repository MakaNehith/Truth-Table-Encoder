import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { VerilogOutput } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const VARIABLE_NAMES = ['A', 'B', 'C', 'D', 'E'];

const getMinterms = (truthTable: number[]): number[] => {
  return truthTable
    .map((output, index) => (output === 1 ? index : -1))
    .filter((index) => index !== -1);
};

export const generateLogicData = async (
  truthTable: number[],
  numVariables: number
): Promise<{ simplifiedFunction: string; kMapSvg: string }> => {
  const minterms = getMinterms(truthTable);
  const variableNames = VARIABLE_NAMES.slice(0, numVariables);

  const prompt = `
    You are an expert digital logic designer. Based on the provided truth table minterms for ${numVariables} variables named ${variableNames.join(', ')}, perform the following tasks:

    The minterms (decimal indices where output Y=1) are: [${minterms.join(', ')}]. If the list is empty, the function is Y=0. If all possible inputs result in Y=1, the function is Y=1.

    1.  **Simplify the Boolean Expression:** Generate the simplified sum-of-products (SOP) boolean expression for the output Y. Use single letters for variables. Use a single quote (') for NOT, juxtaposition for AND (e.g., A'B), and a plus sign (+) for OR. Example: Y = A'B + C'D.

    2.  **Generate Karnaugh Map SVG:** Create a detailed SVG visualization of the Karnaugh Map for the function. The SVG must adhere to these specifications:
        *   The SVG must have a transparent background and a correct \`viewBox\` attribute to ensure it scales properly within its container. Set width="100%" and height="auto".
        *   Grid and Labels: Use a light gray color (stroke="#718096") for grid lines and text (fill="#cbd5e0"). Label the axes with Gray code. The labels must be positioned neatly outside the grid lines and not overlap them.
        *   **Variable Label**: Add a label in the top-left corner, outside the grid, to indicate the variables on each axis. For 2 variables, use 'A\\B'. For 3, use 'A\\BC'. For 4, use 'AB\\CD'. For 5, use 'AB\\CDE'.
        *   **Cell Values**: Place a '1' in cells corresponding to the minterms and a '0' in all other cells. Use a white color (fill="#FFFFFF") for '1's and a dimmer gray (fill="#718096") for '0's. Make the font bold.
        *   Groupings: For each prime implicant in the simplified solution, draw a semi-transparent, rounded rectangle or square around the grouped '1's. Use different vibrant, transparent colors for each group (e.g., rgba(59, 130, 246, 0.4), rgba(239, 68, 68, 0.4), rgba(16, 185, 129, 0.4)). The stroke of these rectangles should be a slightly more opaque version of the fill color.
        *   **5-Variable Map**: For 5 variables, you MUST generate a single 8x4 grid. The variables should be split with AB along the side (4 rows, Gray code: 00, 01, 11, 10) and CDE across the top (8 columns, Gray code: 000, 001, 011, 010, 110, 111, 101, 100).

    Return your response as a single, valid JSON object with the following structure, and nothing else. Do not include markdown backticks or the word "json" in your response.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    simplifiedFunction: { type: Type.STRING },
                    kMapSvg: { type: Type.STRING },
                },
            },
        },
    });
  
    return JSON.parse(response.text);
};

export const generateCircuit = async (
  simplifiedFunction: string,
  numVariables: number
): Promise<string> => {
  const variableNames = VARIABLE_NAMES.slice(0, numVariables);
  const prompt = `
    You are an expert digital logic illustrator. Your task is to generate a clean, professional, and LOGICALLY CORRECT SVG diagram for the boolean expression: Y = ${simplifiedFunction}.
    The available inputs are ${variableNames.join(', ')}.

    **=== Core Principles of Digital Logic Schematics ===**

    You must adhere to the following universal standards for drawing logic circuits:

    1.  **Logic Flow:** The circuit must be drawn to reflect the flow of logic, progressing strictly from left to right. Inputs (${variableNames.join(', ')}) are on the far left, and the final output 'Y' is on the far right.
    2.  **Order of Operations:** The physical arrangement of gates must follow the Boolean order of operations.
        *   **NOT gates** (inverters) are applied first, closest to the inputs.
        *   **AND gates** for each product term are next.
        *   **OR gates** to sum the terms are last, before the final output.
    3.  **Connections and Wires:**
        *   Lines represent wires. They should be straight (horizontal or vertical) with 90-degree turns.
        *   **CRITICAL: If two wires must cross without connecting, you MUST use a small semi-circular "jump" or "bridge" arc on one wire to indicate there is no connection.**
        *   Use a small, solid circle (a "tap point" or "junction dot") ONLY at points where wires are intentionally connected or a signal branches.
    4.  **Standardized Symbols:** You MUST use standard, non-distorted IEEE symbols.
        *   **AND gate:** D-shaped.
        *   **OR gate:** Curved input side.
        *   **NOT gate (inverter):** Triangle with a small circle at the output.
    5.  **Labels:** All inputs and the final output must be clearly labeled with their variable names.

    **=== Gold Standard Example: Y = A'B + AB' ===**

    This is the style you must replicate.
    1.  **Inputs & Main Lines:** 'A' and 'B' are labeled on the far left. A straight horizontal line extends right from each input, forming a main track for that signal.
    2.  **Inverters:** To create 'A'', a wire taps off the main 'A' line (using a junction dot), goes into a NOT gate. The output of this gate is the 'A'' signal. The same is done for 'B''.
    3.  **AND Gates:**
        *   The top AND gate represents 'A'B'. It takes inputs from the 'A'' line and the main 'B' track.
        *   The bottom AND gate represents 'AB''. It takes inputs from the main 'A' track and the 'B'' line.
    4.  **OR Gate:** The outputs from both AND gates feed into a single, final OR gate.
    5.  **Output:** A single line extends from the OR gate's output to the right, labeled 'Y'.
    6.  **Appearance:** White lines and symbols on a transparent background. The layout is clean, spacious, and easy to follow.

    **=== YOUR TASK ===**

    Now, apply these principles and replicate this style to generate an SVG for **Y = ${simplifiedFunction}**.

    **=== FINAL CHECKS ===**
    *   Does it flow left-to-right?
    *   Are the symbols correct (D-shape AND, curved OR)?
    *   Are wire crossings handled with "jumps"?
    *   Are connection points clearly marked with dots?
    *   Is the wiring logically correct for the expression?

    Return ONLY the raw SVG code as a string. Do not include any other text, explanation, or markdown formatting.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
  return response.text;
};

export const generateVerilog = async (
  simplifiedFunction: string,
  numVariables: number
): Promise<VerilogOutput> => {
  const variableNames = VARIABLE_NAMES.slice(0, numVariables);
  const prompt = `
    You are an expert HDL programmer. For the simplified boolean expression Y = ${simplifiedFunction} with inputs ${variableNames.join(', ')}, generate Verilog code and a testbench.

    1.  **Verilog Module:** Create a module named \`logic_circuit\`. The output \`Y\` should be defined using an \`assign\` statement based on the boolean expression. Use \`~\` for NOT, \`&\` for AND, and \`|\` for OR.
        *   **CRITICAL**: If the function simplifies to a constant \`1\` or \`0\`, you MUST represent it using Verilog's sized literal format. For \`Y = 1\`, the code must be \`assign Y = 1'b1;\`. For \`Y = 0\`, the code must be \`assign Y = 1'b0;\`. Do not use \`assign Y = 1;\` or \`assign Y = 0;\`.
    2.  **Testbench Module:** Create a testbench module named \`logic_circuit_tb\`. It should instantiate the \`logic_circuit\` module. It must systematically iterate through all 2**${numVariables} possible input combinations and display the inputs and the resulting output \`Y\` for each case using \`$display\`.

    **IMPORTANT**: Both the Verilog module and the testbench code MUST be properly formatted with standard indentation (e.g., 2 or 4 spaces) and newlines for readability. The code should not be on a single line.

    Return your response as a single, valid JSON object with the following structure, and nothing else. Do not include markdown backticks or the word "json" in your response.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING },
                    testbench: { type: Type.STRING },
                },
            },
        },
    });

  return JSON.parse(response.text);
};