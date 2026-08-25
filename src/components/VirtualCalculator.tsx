import React, { useState } from 'react';
import { X, Minus, Move, RotateCcw } from 'lucide-react';

interface VirtualCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualCalculator: React.FC<VirtualCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [isRad, setIsRad] = useState(false); // Default to degrees like GATE calc
  const [newNumber, setNewNumber] = useState(true);

  if (!isOpen) return null;

  const handleNum = (n: string) => {
    if (newNumber || display === '0') {
      setDisplay(n);
      setNewNumber(false);
    } else {
      setDisplay(display + n);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
      setNewNumber(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const evalExpression = (fn: (val: number) => number) => {
    try {
      let val = parseFloat(display);
      if (isNaN(val)) return;
      let res = fn(val);
      setDisplay(Number(res.toFixed(8)).toString());
      setNewNumber(true);
    } catch {
      setDisplay('Error');
      setNewNumber(true);
    }
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const handleTrig = (func: string) => {
    evalExpression((v) => {
      let input = isRad ? v : toRad(v);
      switch (func) {
        case 'sin': return Math.sin(input);
        case 'cos': return Math.cos(input);
        case 'tan': return Math.tan(input);
        case 'asin': return isRad ? Math.asin(v) : toDeg(Math.asin(v));
        case 'acos': return isRad ? Math.acos(v) : toDeg(Math.acos(v));
        case 'atan': return isRad ? Math.atan(v) : toDeg(Math.atan(v));
        default: return v;
      }
    });
  };

  const handleOp = (op: string) => {
    switch (op) {
      case 'ln': evalExpression(Math.log); break;
      case 'log10': evalExpression(Math.log10); break;
      case 'sqrt': evalExpression(Math.sqrt); break;
      case 'sqr': evalExpression((x) => x * x); break;
      case 'cube': evalExpression((x) => x * x * x); break;
      case 'inv': evalExpression((x) => 1 / x); break;
      case 'exp': evalExpression(Math.exp); break;
      case '10x': evalExpression((x) => Math.pow(10, x)); break;
      case 'fact':
        evalExpression((x) => {
          let n = Math.floor(x);
          if (n < 0) return NaN;
          let f = 1;
          for (let i = 2; i <= n; i++) f *= i;
          return f;
        });
        break;
      case 'pm':
        setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      case '^':
        setDisplay((prev) => prev + ' ' + op + ' ');
        setNewNumber(false);
        break;
      default:
        break;
    }
  };

  const handleEquals = () => {
    try {
      // Safe mathematical evaluation
      let sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      // basic validation
      if (!/^[0-9+\-*/. ()**]+$/.test(sanitized)) {
        setDisplay('Error');
        return;
      }
      let result = Function(`"use strict"; return (${sanitized})`)();
      setDisplay(Number(result.toFixed(8)).toString());
      setNewNumber(true);
    } catch {
      setDisplay('Error');
      setNewNumber(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-zinc-950 border border-zinc-800 text-white rounded-xl shadow-2xl overflow-hidden font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 cursor-move select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span className="text-xs font-semibold tracking-wider text-zinc-300">GATE VIRTUAL CALCULATOR</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsRad(!isRad)} 
            className={`text-[10px] px-2 py-0.5 rounded font-sans transition ${isRad ? 'bg-sky-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Display Screen */}
      <div className="p-3 bg-zinc-950 border-b border-zinc-800 text-right">
        <div className="text-[10px] text-zinc-500 h-4 overflow-hidden truncate">
          {memory !== null ? `M = ${memory}` : ''}
        </div>
        <div className="text-2xl font-bold text-sky-400 tracking-wider truncate py-1">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-2 grid grid-cols-5 gap-1.5 text-xs bg-zinc-900/60">
        {/* Row 1: Memory & Clear */}
        <button onClick={() => setMemory(null)} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-semibold">MC</button>
        <button onClick={() => memory !== null && setDisplay(memory.toString())} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-semibold">MR</button>
        <button onClick={() => setMemory(parseFloat(display))} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-semibold">MS</button>
        <button onClick={handleBackspace} className="py-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 rounded font-semibold">←</button>
        <button onClick={handleClear} className="py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded font-bold">C</button>

        {/* Row 2: Trig */}
        <button onClick={() => handleTrig('sin')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">sin</button>
        <button onClick={() => handleTrig('cos')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">cos</button>
        <button onClick={() => handleTrig('tan')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">tan</button>
        <button onClick={() => handleOp('ln')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">ln</button>
        <button onClick={() => handleOp('log10')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">log</button>

        {/* Row 3: Powers */}
        <button onClick={() => handleOp('sqr')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">x²</button>
        <button onClick={() => handleOp('cube')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">x³</button>
        <button onClick={() => handleOp('^')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">x^y</button>
        <button onClick={() => handleOp('sqrt')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">√x</button>
        <button onClick={() => handleOp('inv')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">1/x</button>

        {/* Row 4: Numbers & Operators */}
        <button onClick={() => handleNum('7')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">7</button>
        <button onClick={() => handleNum('8')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">8</button>
        <button onClick={() => handleNum('9')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">9</button>
        <button onClick={() => handleOp('/')} className="py-2 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded font-bold">÷</button>
        <button onClick={() => handleOp('fact')} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">n!</button>

        {/* Row 5 */}
        <button onClick={() => handleNum('4')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">4</button>
        <button onClick={() => handleNum('5')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">5</button>
        <button onClick={() => handleNum('6')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">6</button>
        <button onClick={() => handleOp('*')} className="py-2 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded font-bold">×</button>
        <button onClick={() => { setDisplay(Math.PI.toString()); setNewNumber(true); }} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">π</button>

        {/* Row 6 */}
        <button onClick={() => handleNum('1')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">1</button>
        <button onClick={() => handleNum('2')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">2</button>
        <button onClick={() => handleNum('3')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">3</button>
        <button onClick={() => handleOp('-')} className="py-2 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded font-bold">-</button>
        <button onClick={() => { setDisplay(Math.E.toString()); setNewNumber(true); }} className="py-2 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded">e</button>

        {/* Row 7 */}
        <button onClick={() => handleNum('0')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">0</button>
        <button onClick={() => handleNum('.')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-sm">.</button>
        <button onClick={() => handleOp('pm')} className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold">±</button>
        <button onClick={() => handleOp('+')} className="py-2 bg-sky-950 hover:bg-sky-900 text-sky-300 rounded font-bold">+</button>
        <button onClick={handleEquals} className="py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold rounded shadow-lg">=</button>
      </div>
    </div>
  );
};
