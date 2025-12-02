import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function SidebarButton({ label, onClick, className = "" }: { label: string, onClick?: () => void, className?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-gray-200 p-3 rounded shadow-sm cursor-grab hover:bg-gray-50 mb-2 flex items-center gap-2 select-none ${className}`}
    >
      <span className="text-gray-400 text-lg">::</span>
      <span className="font-bold text-gray-700 text-sm">{label}</span>
    </div>
  );
}
// 2. O Componente com Lógica de Drag
interface Props {
  type: string;
  label: string;
  onAddClick: () => void;
}

export function DraggableSidebarItem({ type, label, onAddClick }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-btn-${type}`,
    data: {
      type: type,
      label: label,
      isSidebarItem: true,
    },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : 'opacity-100'}>
      {/* Passamos o clique para o botão visual */}
      <SidebarButton label={label} onClick={onAddClick} />
    </div>
  );
}