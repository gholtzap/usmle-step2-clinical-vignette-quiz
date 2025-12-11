'use client';

import { useState } from 'react';
import { DrawingTool } from '@/types/canvas';

interface DrawingToolbarProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClear: () => void;
}

export default function DrawingToolbar({ currentTool, onToolChange, onClear }: DrawingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tools: { name: DrawingTool; icon: string; label: string }[] = [
    { name: 'cursor', icon: '↖', label: 'Cursor' },
    { name: 'pencil', icon: '✎', label: 'Pencil' },
    { name: 'eraser', icon: '⌫', label: 'Eraser' },
  ];

  const handleToolChange = (tool: DrawingTool) => {
    onToolChange(tool);
    setIsExpanded(false);
  };

  const handleClear = () => {
    onClear();
    setIsExpanded(false);
  };

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full border shadow-lg transition-all flex items-center justify-center text-2xl ${
          isExpanded
            ? 'bg-accent border-accent text-white rotate-45'
            : currentTool === 'cursor'
            ? 'bg-surface border-border text-foreground-muted'
            : 'bg-accent border-accent text-white'
        }`}
        title={isExpanded ? 'Close' : 'Drawing Tools'}
      >
        {isExpanded ? '×' : currentTool === 'pencil' ? '✎' : currentTool === 'eraser' ? '⌫' : '↖'}
      </button>

      <div className={`fixed right-6 z-50 flex flex-col gap-2 transition-all duration-300 ${
        isExpanded ? 'bottom-24 opacity-100' : 'bottom-6 opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
      } md:top-1/2 md:-translate-y-1/2 md:bottom-auto`}>
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => handleToolChange(tool.name)}
            className={`w-14 h-14 rounded-lg border transition-all flex items-center justify-center text-2xl shadow-lg ${
              currentTool === tool.name
                ? 'bg-accent border-accent text-white'
                : 'bg-surface border-border text-foreground-muted hover:border-border-hover hover:bg-surface-hover'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}

        <div className="h-px bg-border my-1" />

        <button
          onClick={handleClear}
          className="w-14 h-14 rounded-lg border bg-surface border-border text-foreground-muted hover:border-error hover:bg-error/10 hover:text-error transition-all flex items-center justify-center text-2xl shadow-lg"
          title="Clear All"
        >
          ×
        </button>
      </div>
    </>
  );
}
