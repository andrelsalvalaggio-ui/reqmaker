"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';
import { Block } from './types';
import { generateAndDownloadDocx } from '../app/services/docxGenerator';
import { getPlugins, getPlugin } from './registry';
import { DraggableSidebarItem, SidebarButton } from '../components/DraggableSidebarItem';
import DocxViewer from '../components/DocxViewer';
import { DroppableArea } from '../components/DroppableArea';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null); // Estado de Seleção
  const [activeDragItem, setActiveDragItem] = useState<any>(null); // Para o Overlay visual
  const [isPreview, setIsPreview] = useState(false);

  // Configuração de sensores para melhorar a experiência do Drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Previne drags acidentais ao clicar
    })
  );

  // Adiciona bloco buscando dados iniciais do Plugin
  const addBlock = (type: string) => {
    const plugin = getPlugin(type);
    if (!plugin) return;
    const newBlock: Block = {
      id: `blk-${Date.now()}`,
      type: type,
      content: JSON.parse(JSON.stringify(plugin.initialContent))
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id); // Seleciona automaticamente ao criar
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < blocks.length) setBlocks((items) => arrayMove(items, index, newIndex));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    // 1. Lógica: Arrastou da Sidebar para a Área Principal
    if (active.data.current?.isSidebarItem) {
      // Adiciona no final da lista
      // (Futuramente podemos calcular o index baseado em onde soltou)
      addBlock(active.data.current.type);
      return;
    }

    // 2. Lógica: Reordenar lista existente
    if (active.id !== over.id && over.id !== 'main-canvas') {
      setBlocks((items) => {
        const oldIndex = items.findIndex(b => b.id === active.id);
        const newIndex = items.findIndex(b => b.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderPropertiesPanel = () => {
    if (!selectedBlockId) return <div className="text-gray-400 text-sm text-center mt-10">Selecione um bloco para editar</div>;
    
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) return null;

    const plugin = getPlugin(block.type);
    if (!plugin || !plugin.PropertiesComponent) {
        return <div className="text-gray-400 text-sm text-center mt-10">Este componente não possui propriedades avançadas.</div>;
    }

    const Properties = plugin.PropertiesComponent;
    
    return (
        <div className="animate-fade-in">
             <h2 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">Propriedades: {plugin.label}</h2>
             <Properties 
                data={block.content} 
                onUpdate={(newData) => updateBlockContent(block.id, newData)}
             />
             <button 
               onClick={() => {
                 setBlocks(blocks.filter(b => b.id !== block.id));
                 setSelectedBlockId(null);
               }}
               className="mt-8 w-full py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 text-sm"
             >
               Excluir Bloco
             </button>
        </div>
    );
  };

  // Se não estiver montado no cliente, retorna null para evitar erro de hidratação
  if (!isMounted) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className="h-screen flex flex-col overflow-hidden bg-gray-100">
        
        {/* HEADER (Toolbar) */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20">
          <div className="font-bold text-xl text-gray-800">ReqMaker <span className="text-xs font-normal text-gray-500">v2.0</span></div>
          <div className="flex gap-3">
             <button onClick={() => setIsPreview(!isPreview)} className="text-sm text-gray-600 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border">
                {isPreview ? 'Voltar para Edição' : 'Visualizar Documento'}
             </button>
             <button onClick={() => generateAndDownloadDocx(blocks)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">
                Baixar .DOCX
             </button>
          </div>
        </header>

        {/* WORKSPACE - Layout de 3 Colunas */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* 1. SIDEBAR ESQUERDA (Componentes) */}
          {!isPreview && (
            <aside className="w-64 bg-white border-r flex flex-col p-4 overflow-y-auto shrink-0 z-10">
              <h2 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">Componentes</h2>
              <div className="flex flex-col gap-2">
                {getPlugins().map((plugin) => (
                  <DraggableSidebarItem key={plugin.type} type={plugin.type} label={plugin.label} />
                ))}
              </div>
              <div className="mt-auto pt-4 border-t text-xs text-gray-400">
                Arraste para o centro para adicionar.
              </div>
            </aside>
          )}

          {/* ÁREA CENTRAL */}
          <section className="flex-1 overflow-y-auto p-8 relative bg-gray-100" onClick={() => setSelectedBlockId(null)}> 
            {/* --- CORREÇÃO 2: ÁREA DROPPABLE --- 
                Envolvemos a folha em uma DroppableArea com ID fixo 'main-canvas'.
                Isso garante que 'over' nunca seja null se soltarmos aqui dentro.
            */}
            <DroppableArea id="main-canvas" className={`max-w-4xl mx-auto min-h-[800px] bg-white shadow-lg p-10 transition-all ${isPreview ? 'scale-100' : ''}`}>
              
              {isPreview ? <DocxViewer blocks={blocks} /> : (
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded text-gray-400 pointer-events-none">
                      Arraste componentes para cá
                    </div>
                  )}
                  
                  {blocks.map((block, index) => {
                     const plugin = getPlugin(block.type);
                     if(!plugin) return null;
                     
                     let visualId = "";
                     if (plugin.usesVisualId) {
                        const count = blocks.slice(0, index + 1).filter(b => getPlugin(b.type)?.usesVisualId).length;
                        visualId = `CDU${count.toString().padStart(2, '0')}`;
                     }
                     const isSelected = block.id === selectedBlockId;

                     return (
                       <div key={block.id} onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                         className={`relative border-2 transition-all rounded mb-4 ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 z-10' : 'border-transparent hover:border-gray-200'}`}>
                         <SortableItem id={block.id} isFirst={index === 0} isLast={index === blocks.length - 1} onMoveUp={()=>{}} onMoveDown={()=>{}}>
                            <plugin.Component data={block.content} onUpdate={(d) => updateBlockContent(block.id, d)} idVisual={visualId} readOnly={false} />
                         </SortableItem>
                       </div>
                     );
                  })}
                </SortableContext>
              )}
            </DroppableArea>
          </section>

          {/* 3. SIDEBAR DIREITA (Propriedades) */}
          {!isPreview && (
            <aside className="w-80 bg-white border-l flex flex-col p-6 overflow-y-auto shrink-0 z-10 shadow-sm">
              {renderPropertiesPanel()}
            </aside>
          )}

        </div>

        {/* OVERLAY */}
        <DragOverlay dropAnimation={null} zIndex={100}>
           {activeDragItem ? (
             activeDragItem.isSidebarItem ? (
               <SidebarButton label={activeDragItem.label} className="rotate-2 scale-105 shadow-2xl border-blue-500 cursor-grabbing w-48" />
             ) : (
               <div className="bg-white p-4 shadow-2xl rounded border border-blue-500 opacity-90 scale-105 w-full">
                  Movendo Bloco...
               </div>
             )
           ) : null}
        </DragOverlay>

      </main>
    </DndContext>
  );
}