'use client';

import { DrawingTool } from '@/types/canvas';

interface DrawingToolbarProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

export default function DrawingToolbar({ currentTool, onToolChange }: DrawingToolbarProps) {
  const tools: { name: DrawingTool; icon: string; label: string }[] = [
    { name: 'cursor', icon: '↖', label: 'Cursor' },
    { name: 'pencil', icon: '✎', label: 'Pencil' },
    { name: 'eraser', icon: '⌫', label: 'Eraser' },
  ];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => onToolChange(tool.name)}
          className={`w-14 h-14 rounded-lg border transition-all flex items-center justify-center text-2xl ${
            currentTool === tool.name
              ? 'bg-accent border-accent text-white shadow-lg'
              : 'bg-surface border-border text-foreground-muted hover:border-border-hover hover:bg-surface-hover'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
