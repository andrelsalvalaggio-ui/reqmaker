import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function SortableItem({ id, children, onMoveUp, onMoveDown, isFirst, isLast }: SortableItemProps) {
  const {
    attributes,
    listeners, // <--- Estes são os eventos de mouse (mousedown, touchstart)
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Garante que o item fique "por cima" quando arrastado
    zIndex: isDragging ? 999 : 'auto', 
    // Garante que a posição seja relativa para respeitar o layout
    position: 'relative' as const, 
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="mb-6 w-full" // w-full força a largura total
    >
      
      {/* BARRA DE CONTROLE (HANDLE) */}
      <div 
        {...attributes} 
        {...listeners}
        className={`
          flex items-center justify-between px-4 py-1 rounded-t select-none transition-colors border border-b-0 border-gray-300
          ${isDragging ? 'bg-blue-100 shadow-xl' : 'bg-gray-200 hover:bg-gray-300'}
        `}
      >
        {/* Texto do meio (Ícone de Grip visual) */}
        <div className="flex-1 text-center text-xs text-gray-500 font-bold uppercase tracking-wider cursor-move">
          ::: Arrastar :::
        </div>

        {/* --- ÁREA DOS BOTÕES --- */}
        {/* preventDefault e stopPropagation são CRICIAIS aqui para não ativar o Drag and Drop ao clicar no botão */}
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          
          <button 
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1 rounded hover:bg-white text-gray-700 font-bold ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Mover para cima"
          >
            ↑
          </button>
          
          <button 
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1 rounded hover:bg-white text-gray-700 font-bold ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Mover para baixo"
          >
            ↓
          </button>

        </div>
      </div>
      
      {/* CONTEÚDO (Tabela ou Texto) */}
      <div className={`cursor-default ${isDragging ? 'opacity-50' : ''}`}>
        {children}
      </div>
    </div>
  );
}