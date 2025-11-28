import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface Props {
  type: string;
  label: string;
}

export function DraggableSidebarItem({ type, label }: Props) {
  // O ID precisa ser diferente dos blocos da lista para não dar conflito
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-btn-${type}`,
    data: {
      type: type,
      isSidebarItem: true, // Flag para identificarmos no onDragEnd
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="bg-white border border-gray-200 p-3 rounded shadow-sm cursor-grab hover:bg-gray-50 mb-2 flex items-center gap-2"
    >
      <span className="text-gray-500 text-lg">::</span>
      <span className="font-bold text-gray-700 text-sm">{label}</span>
    </div>
  );
}