import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners, // <--- Estes são os eventos de mouse (mousedown, touchstart)
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // 1. A div PAI recebe a referência (setNodeRef) e estilo, para saber O QUE mover.
    // Mas NÃO recebe os listeners aqui.
    <div ref={setNodeRef} style={style} {...attributes} className="mb-4">
      
      {/* 2. A ALÇA (Handle) recebe os listeners. 
             Só começa a arrastar se clicar AQUI. */}
      <div 
        {...listeners} 
        className="bg-gray-200 text-gray-500 text-center text-xs py-1 rounded-t cursor-move hover:bg-gray-300 active:bg-blue-200 select-none"
      >
        ::: Arraste aqui para mover :::
      </div>
      
      {/* 3. O conteúdo (Inputs) fica livre dos listeners, então o foco funciona. */}
      <div className="cursor-default">
        {children}
      </div>
    </div>
  );
}