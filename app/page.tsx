"use client";

import React, { useState, useId } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';
import { Block } from './types';
import { generateAndDownloadDocx } from '../app/services/docxGenerator';
import { getPlugins, getPlugin } from './registry';
import DocxViewer from '../components/DocxViewer';

export default function Home() {
  const dndContextId = useId();
  const [isPreview, setIsPreview] = useState(false);
  
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Adiciona bloco buscando dados iniciais do Plugin
  const addBlock = (pluginType: string) => {
    const plugin = getPlugin(pluginType);
    if (!plugin) return;

    const newBlock: Block = {
      id: `blk-${Date.now()}`,
      type: pluginType,
      content: JSON.parse(JSON.stringify(plugin.initialContent)) // Deep copy
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks(prevBlocks => prevBlocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < blocks.length) setBlocks((items) => arrayMove(items, index, newIndex));
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(b => b.id === active.id);
        const newIndex = items.findIndex(b => b.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const renderList = () => {
    return blocks.map((block, index) => {
      const plugin = getPlugin(block.type);
      if (!plugin) return <div key={block.id} className="text-red-500 p-4 border">Erro: Tipo {block.type} não registrado.</div>;

      // Lógica genérica de contador
      let visualId = "";
      if (plugin.usesVisualId) {
         const count = blocks.slice(0, index + 1).filter(b => getPlugin(b.type)?.usesVisualId).length;
         visualId = `CDU${count.toString().padStart(2, '0')}`;
      }

      // Renderiza o Componente do Plugin
      const content = (
        <plugin.Component 
          data={block.content}
          onUpdate={(newData: any) => updateBlockContent(block.id, newData)}
          readOnly={isPreview}
          idVisual={visualId}
        />
      );

      if (isPreview) return <div key={block.id}>{content}</div>;

      return (
        <SortableItem 
          key={block.id} id={block.id} 
          isFirst={index === 0} isLast={index === blocks.length - 1}
          onMoveUp={() => moveBlock(index, 'up')} onMoveDown={() => moveBlock(index, 'down')}
        >
          {content}
        </SortableItem>
      );
    });
  };

  return (
    <main className={`min-h-screen pb-40 transition-colors ${isPreview ? 'bg-gray-800' : 'bg-gray-50 p-10'}`}>
      
      {/* HEADER FIXO */}
      <div className={`${isPreview ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'} sticky top-0 z-20 py-4 border-b shadow-sm px-8 flex justify-between items-center transition-colors`}>
        <h1 className="text-2xl font-bold">{isPreview ? 'Visualização' : 'Editor de Requisitos'}</h1>
        
        <div className="flex gap-2 items-center">
          {/* BOTÕES GERADOS AUTOMATICAMENTE PELO REGISTRO */}
          {!isPreview && getPlugins().map((plugin) => (
             <button key={plugin.type} onClick={() => addBlock(plugin.type)} className={`${plugin.buttonColor} px-4 py-2 rounded font-bold transition ml-2`}>
               {plugin.label}
             </button>
          ))}
          
          {!isPreview && <div className="w-px bg-gray-300 mx-2 h-8"></div>}

          <button onClick={() => setIsPreview(!isPreview)} className={`px-4 py-2 rounded font-bold border flex items-center gap-2 transition-all ${isPreview ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
             {isPreview ? '✎ Editar' : '👁️ Visualizar'}
          </button>
          <button onClick={() => generateAndDownloadDocx(blocks)} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 flex items-center gap-2">
            <span>📄</span> DOCX
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className={isPreview ? '' : 'max-w-5xl mx-auto mt-8'}>
        {isPreview ? <DocxViewer blocks={blocks} /> : (
          <DndContext id={dndContextId} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {renderList()}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </main>
  );
}