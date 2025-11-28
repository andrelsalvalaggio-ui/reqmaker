import React from 'react';
import { useDraggable } from '@dnd-kit/core';

// 1. Componente de UI Puro (Aparência do botão)
// Exportamos ele para usar também no Overlay da page.tsx
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
}

export function DraggableSidebarItem({ type, label }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-btn-${type}`,
    data: {
      type: type,
      label: label, // Passamos o label no data para o Overlay saber o nome
      isSidebarItem: true,
    },
  });

  // TRUQUE: Não aplicamos 'transform' aqui!
  // O item da sidebar fica parado. Se estiver sendo arrastado, reduzimos a opacidade.
  
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : 'opacity-100'}>
      <SidebarButton label={label} />
    </div>
  );
}