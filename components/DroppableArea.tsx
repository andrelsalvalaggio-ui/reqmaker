// components/DroppableArea.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function DroppableArea({ children, id, className }: { children: React.ReactNode; id: string; className?: string }) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}