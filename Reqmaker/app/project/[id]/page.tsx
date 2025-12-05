"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragOverEvent, pointerWithin } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../../../components/SortableItem';
import { Block } from '../../types';
import { generateAndDownloadDocx } from '../../services/docxGenerator';
import { getPlugins, getPlugin } from '../../registry';
import { DraggableSidebarItem, SidebarButton } from '../../../components/DraggableSidebarItem';
import DocxViewer from '../../../components/DocxViewer';
import { DroppableArea } from '../../../components/DroppableArea';
import { useParams } from 'next/navigation';
import { getProjectById, saveProject } from '@/app/services/storage';

const PLACEHOLDER_ID = "placeholder-ghost";

export default function EditorPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null); // Estado de Seleção
  const [activeDragItem, setActiveDragItem] = useState<any>(null); // Para o Overlay visual
  const [isPreview, setIsPreview] = useState(false);

  const params = useParams();
  const projectId = params.id as string;
  const [projectTitle, setProjectTitle] = useState("Carregando...");

  useEffect(() => {
    if (projectId) {
      const savedData = getProjectById(projectId);
      if (savedData) {
        setBlocks(savedData.blocks);
        setProjectTitle(savedData.title);
      }
    }
    setIsMounted(true);
  }, [projectId]);

  useEffect(() => {
    if (isMounted && blocks.length > 0) {
       saveProject(projectId, blocks);
    }
  }, [blocks, projectId, isMounted]);

  // 5. Função para atualizar o Título do Projeto
  const handleTitleChange = (newTitle: string) => {
    setProjectTitle(newTitle);
    saveProject(projectId, blocks, newTitle);
  };

  // Configuração de sensores para melhorar a experiência do Drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Previne drags acidentais ao clicar
    })
  );

  const createBlock = (type: string): Block => {
    const plugin = getPlugin(type);
    return {
      id: `blk-${Date.now()}`,
      type: type,
      content: plugin ? JSON.parse(JSON.stringify(plugin.initialContent)) : {}
    };
  };

  const handleAddClick = (type: string) => {
    const newBlock = createBlock(type);
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlockContent = (id: string, newContent: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragItem(active.data.current);
    // NÃO criamos o ghost aqui mais!
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Se não estiver sobre nada, não faz nada
    if (!over) return;

    // --- LÓGICA DE SPAWN (Criação do Ghost ao entrar) ---
    const isSidebarItem = active.data.current?.isSidebarItem;
    const isOverMainCanvas = over.id === 'main-canvas';
    // Verifica se estamos sobre um bloco que já existe (para inserir no meio)
    const isOverExistingBlock = blocks.some(b => b.id === over.id);

    if (isSidebarItem && (isOverMainCanvas || isOverExistingBlock)) {
       // Verifica se o ghost JÁ existe para não criar duplicado
       const ghostExists = blocks.some(b => b.id === PLACEHOLDER_ID);
       
       if (!ghostExists) {
         // CRIA O GHOST AGORA
         const type = active.data.current?.type;
         setBlocks(prev => [
           ...prev, 
           { id: PLACEHOLDER_ID, type: type, content: {} }
         ]);
         // Retornamos aqui para esperar o próximo ciclo de renderização posicionar o ghost
         return; 
       }
    }

    // --- LÓGICA DE MOVIMENTO (Mantida igual) ---
    // A partir daqui, o ghost já existe, então movemos ele visualmente
    if (isSidebarItem) {
      const ghostIndex = blocks.findIndex(b => b.id === PLACEHOLDER_ID);
      if (ghostIndex === -1) return; 

      const overId = over.id;
      
      if (overId === 'main-canvas') {
         // Se estiver no fundo branco, move para o final (se já não for o último)
         if (ghostIndex !== blocks.length - 1) {
            setBlocks(items => arrayMove(items, ghostIndex, blocks.length - 1));
         }
      } 
      else if (overId !== PLACEHOLDER_ID) {
        // Se estiver sobre outro bloco, troca de lugar
        const overIndex = blocks.findIndex(b => b.id === overId);
        if (overIndex !== -1 && overIndex !== ghostIndex) {
          setBlocks(items => arrayMove(items, ghostIndex, overIndex));
        }
      }
    }
    // Reordenação normal entre blocos existentes
    else if (active.id !== over.id && over.id !== 'main-canvas') {
      setBlocks((items) => {
        const oldIndex = items.findIndex(b => b.id === active.id);
        const newIndex = items.findIndex(b => b.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    const isSidebarDrag = active.data.current?.isSidebarItem;
    
    // Verificamos se o Ghost foi criado
    const ghostIndex = blocks.findIndex(b => b.id === PLACEHOLDER_ID);
    const hasGhost = ghostIndex !== -1;

    // CENÁRIO 1: Soltou fora da janela ou área válida
    if (!over) {
      if (hasGhost) {
        // Remove o ghost (Cancela a operação)
        setBlocks(prev => prev.filter(b => b.id !== PLACEHOLDER_ID));
      }
      return;
    }

    // CENÁRIO 2: Soltou dentro (Confirmar criação)
    if (isSidebarDrag && hasGhost) {
      const type = active.data.current?.type;
      const newBlock = createBlock(type);
      
      // Substitui o ID do ghost pelo ID do novo bloco
      setBlocks(prev => prev.map(b => b.id === PLACEHOLDER_ID ? newBlock : b));
      setSelectedBlockId(newBlock.id);
    }
    
    // CENÁRIO 3: Reordenação normal (sem ghost)
    else if (!isSidebarDrag && active.id !== over.id) {
       // Lógica padrão do sortable (já tratado visualmente no DragOver, 
       // mas o dnd-kit pede confirmação final se não usar modifiers)
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
    if (!plugin || !plugin.PropertiesComponent) return <div className="text-gray-400 text-sm text-center mt-10">Sem propriedades.</div>;
    const Properties = plugin.PropertiesComponent;
    
    return (
        <div className="animate-fade-in">
             <h2 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">Propriedades: {plugin.label}</h2>
             <Properties data={block.content} onUpdate={(d) => updateBlockContent(block.id, d)} />
             <button onClick={() => { setBlocks(blocks.filter(b => b.id !== block.id)); setSelectedBlockId(null); }} className="mt-8 w-full py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 text-sm">Excluir Bloco</button>
        </div>
    );
  };

  // Se não estiver montado no cliente, retorna null para evitar erro de hidratação
  if (!isMounted) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <main className="h-screen flex flex-col overflow-hidden bg-gray-100">
        
        {/* HEADER (Toolbar) */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => window.location.href = '/'} className="text-gray-400 hover:text-gray-800 mr-2">
              ← Voltar
            </button>
            
            {/* INPUT DE TÍTULO EDITÁVEL */}
            <input 
              value={projectTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-bold text-xl text-gray-800 bg-transparent border border-transparent hover:border-gray-200 px-2 rounded outline-none"
            />
         </div>
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
                  <DraggableSidebarItem 
                    key={plugin.type} 
                    type={plugin.type} 
                    label={plugin.label}
                    onAddClick={() => handleAddClick(plugin.type)}
                  />
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