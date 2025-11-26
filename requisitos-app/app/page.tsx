"use client"; // Obrigatório para Drag and Drop

import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Nossos componentes
import TabelaCDU from '../components/TabelaCDU';
import { SortableItem } from '../components/SortableItem';

export default function Home() {
  // 1. O ESTADO DA LISTA (Apenas os IDs dos blocos por enquanto)
  // No Java: List<String> items = ["1", "2"];
  const [items, setItems] = useState<string[]>(["1"]);

  // 2. FUNÇÃO PARA ADICIONAR NOVO BLOCO
  const addNewBlock = () => {
    const newId = Date.now().toString(); // Gera um ID único baseado no tempo
    setItems([...items, newId]); // Adiciona ao final do array
  };

  // 3. FUNÇÃO MÁGICA DE REORDENAÇÃO
  // O dnd-kit chama isso quando você solta o mouse.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Se soltou em cima de um item diferente do original...
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        // arrayMove é uma função utilitária que troca os índices no array
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Meus Requisitos</h1>
          <button 
            onClick={addNewBlock}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Adicionar CDU
          </button>
        </div>

        {/* --- ÁREA DO DRAG AND DROP --- */}
        {/* DndContext: O "Mundo" onde a física acontece */}
        <DndContext 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          {/* SortableContext: Diz que a estratégia é uma lista vertical */}
          <SortableContext 
            items={items} 
            strategy={verticalListSortingStrategy}
          >
            {/* O Loop: Renderiza cada item da lista */}
            {items.map((id) => (
              <SortableItem key={id} id={id}>
                <TabelaCDU />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
        
      </div>
    </main>
  );
}