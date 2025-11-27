"use client";

import React from 'react';
import { Paragraph, TextRun, AlignmentType } from "docx";
import { BlockPlugin } from '../app/types';

// --- COMPONENTE VISUAL ---
const BlocoTextoComponent = ({ data, onUpdate, readOnly = false }: any) => {
  return (
    <div className={`my-2 max-w-4xl mx-auto ${readOnly ? 'preview-mode px-0' : 'bg-white group hover:shadow-md px-4'}`}>
      <textarea
        className="w-full text-gray-700 outline-none resize-none field-sizing-content min-h-[24px] bg-transparent"
        placeholder={readOnly ? "" : "Digite um texto explicativo..."}
        value={data as string}
        onChange={(e) => onUpdate(e.target.value)}
        disabled={readOnly}
      />
    </div>
  );
};

// --- LÓGICA DE EXPORTAÇÃO DOCX ---
const exportLogic = (content: string) => {
  return [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ 
          text: content || "", 
          font: "Arial", 
          size: 22 // 11pt
        })
      ],
      spacing: { after: 200 }
    })
  ];
};

// --- DEFINIÇÃO DO PLUGIN ---
export const PluginTexto: BlockPlugin = {
  type: 'texto',
  label: '+ Texto',
  buttonColor: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100',
  initialContent: "",
  Component: BlocoTextoComponent,
  exporter: exportLogic
};