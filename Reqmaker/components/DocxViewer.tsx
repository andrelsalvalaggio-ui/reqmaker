"use client";

import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview'; // A mágica acontece aqui
import { Block } from '../app/types';
import { generateDocxBlob } from '../app/services/docxGenerator';

interface DocxViewerProps {
  blocks: Block[];
}

export default function DocxViewer({ blocks }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDoc = async () => {
      if (!containerRef.current) return;

      try {
        // 1. Gera o arquivo real na memória (igual ao que seria baixado)
        const blob = await generateDocxBlob(blocks);
        
        // 2. Limpa o container
        containerRef.current.innerHTML = "";

        // 3. Renderiza o DOCX dentro da DIV
        await renderAsync(blob, containerRef.current, undefined, {
          inWrapper: true, // Adiciona margens e sombras automáticas
          ignoreWidth: false, // Respeita a largura da página
          className: "docx-viewer-wrapper", // Classe para customizarmos se precisar
        });
      } catch (error) {
        console.error("Erro ao renderizar DOCX:", error);
      }
    };

    renderDoc();
  }, [blocks]); // Re-renderiza sempre que os blocos mudarem

  return (
    <div className="flex justify-center bg-gray-200 py-8 min-h-[500px] overflow-auto">
      {/* O documento será injetado aqui dentro */}
      <div ref={containerRef} className="shadow-2xl" /> 
    </div>
  );
}