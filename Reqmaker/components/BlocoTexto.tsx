"use client";

import React from 'react';
import { Paragraph, TextRun, AlignmentType } from "docx";
import { BlockPlugin } from '../app/types';
import { StringInput } from './ui/StringInput';
import { NumberInput } from './ui/NumberInput';
import { text } from 'stream/consumers';

interface TextData {
  value: string;
  placeholder?: string;
  fontSize: number;
}


// --- COMPONENTE VISUAL ---
const BlocoTextoComponent = ({ data, onUpdate, readOnly = false }: any) => {
  // Garante que data é um objeto, mesmo se vier string (legado)
  const textData = (typeof data === 'string' ? { value: data } : data) as TextData;

  const handleChange = (newValue: string) => {
    onUpdate({ ...textData, value: newValue });
  };

  return (
    <div className={`max-w-4xl mx-auto ${readOnly ? 'preview-mode px-0' : 'bg-white group hover:shadow-md px-4 py-2 border border-transparent hover:border-gray-100 transition-all rounded'}`}>
      <textarea
        className="w-full text-gray-700 outline-none resize-none field-sizing-content min-h-[24px] bg-transparent leading-relaxed"
        placeholder={readOnly ? "" : data.placeholder || ""}
        
        // Usa o valor do objeto
        value={textData.value || ""}
        onChange={(e) => handleChange(e.target.value)}
        
        disabled={readOnly}
        // Ajusta altura automaticamente (opcional, estilo simples)
        style={{ height: 'auto', fontSize: `${textData.fontSize}px` }} 
        rows={textData.value ? textData.value.split('\n').length : 1}
      />
    </div>
  );
};

// --- LÓGICA DE EXPORTAÇÃO DOCX ---
const exportLogic = (data: TextData) => {
  const content = typeof data === 'string' ? data : data?.value;
  // Pega o fontSize ou usa 12 como padrão
  const fontSizePt = (typeof data !== 'string' && data?.fontSize) ? data.fontSize : 12;

  return [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({ 
          text: content || "", 
          font: "Arial", 
          // A biblioteca docx usa "half-points" (meio ponto). 
          // Então para ter 12pt, precisamos passar 24.
          size: fontSizePt * 2 
        })
      ],
      spacing: { after: 200 }
    })
  ];
};

const TextoProperties = ({ data, onUpdate }: { data: TextData, onUpdate: (d: any) => void }) => {
  // Fallback caso data venha undefined ou string
  const safeData: TextData = typeof data === 'string' ? { value: data, fontSize: 12, placeholder: data }
    : { 
        value: data?.value || "", 
        fontSize: data?.fontSize || 16, // Se fontSize não existir, usa 
        placeholder: data?.placeholder
      };
  
  if (!safeData.fontSize) safeData.fontSize = 16;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h3 className="text-xs uppercase font-bold text-gray-400 border-b pb-2 mb-2">Conteúdo</h3>
        
        
        <NumberInput
          label="Tamanho da Fonte"
          value={safeData.fontSize}
          suffix='px'
          inputWidth={90}
          dragLabel='P'
          dragSpeed={3}
          onChange={(val) => onUpdate({...safeData, fontSize: val})}
          min={6}
        />

        {/* Usa o componente corrigido */}
        <StringInput 
          label="Texto Principal" 
          value={safeData.value}
          height={150}
          onChange={(val) => onUpdate({ ...safeData, value: val })} 
          placeholder="Conteúdo do parágrafo..."
        />
        
    </div>
  );
};
// --- DEFINIÇÃO DO PLUGIN ---
export const PluginTexto: BlockPlugin = {
  type: 'texto',
  label: 'Texto',
  buttonColor: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100',
  initialContent: { value: "", fontSize: 16, placeholder: "Digite seu texto aqui..."},
  
  Component: BlocoTextoComponent,
  PropertiesComponent: TextoProperties,
  exporter: exportLogic
};