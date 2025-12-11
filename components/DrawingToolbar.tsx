'use client';

import { useState } from 'react';
import { MousePointer2, Pencil, Eraser, Trash2, X } from 'lucide-react';
import { DrawingTool } from '@/types/canvas';

interface DrawingToolbarProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClear: () => void;
}

type ToolConfig = {
  name: DrawingTool;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
};

export default function DrawingToolbar({ currentTool, onToolChange, onClear }: DrawingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tools: ToolConfig[] = [
    { name: 'cursor', icon: MousePointer2, label: 'Cursor' },
    { name: 'pencil', icon: Pencil, label: 'Pencil' },
    { name: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const handleToolChange = (tool: DrawingTool) => {
    onToolChange(tool);
    setIsExpanded(false);
  };

  const handleClear = () => {
    onClear();
    setIsExpanded(false);
  };

  const getCurrentIcon = () => {
    const tool = tools.find(t => t.name === currentTool);
    return tool ? tool.icon : MousePointer2;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full border shadow-lg transition-all flex items-center justify-center ${
          isExpanded
            ? 'bg-accent border-accent text-white rotate-45'
            : currentTool === 'cursor'
            ? 'bg-surface border-border text-foreground-muted'
            : 'bg-accent border-accent text-white'
        }`}
        title={isExpanded ? 'Close' : 'Drawing Tools'}
      >
        {isExpanded ? <X size={24} /> : <CurrentIcon size={24} />}
      </button>

      <div className={`fixed right-6 z-50 flex flex-col gap-2 transition-all duration-300 ${
        isExpanded ? 'bottom-24 opacity-100' : 'bottom-6 opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
      } md:top-1/2 md:-translate-y-1/2 md:bottom-auto`}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              onClick={() => handleToolChange(tool.name)}
              className={`w-14 h-14 rounded-lg border transition-all flex items-center justify-center shadow-lg ${
                currentTool === tool.name
                  ? 'bg-accent border-accent text-white'
                  : 'bg-surface border-border text-foreground-muted hover:border-border-hover hover:bg-surface-hover'
              }`}
              title={tool.label}
            >
              <Icon size={24} />
            </button>
          );
        })}

        <div className="h-px bg-border my-1" />

        <button
          onClick={handleClear}
          className="w-14 h-14 rounded-lg border bg-surface border-border text-foreground-muted hover:border-error hover:bg-error/10 hover:text-error transition-all flex items-center justify-center shadow-lg"
          title="Clear All"
        >
          <Trash2 size={24} />
        </button>
      </div>
    </>
  );
}
