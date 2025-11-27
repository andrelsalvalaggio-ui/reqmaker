"use client";

import React, { ChangeEvent } from 'react';
import { Paragraph, ImageRun, AlignmentType, TextRun } from "docx";
import { BlockPlugin } from '../app/types';

interface ImagemData {
  base64: string;
  legenda: string;
}

// --- COMPONENTE VISUAL ---
const BlocoImagemComponent = ({ data, onUpdate, readOnly }: any) => {
  const typedData = data as ImagemData;

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpdate({ ...typedData, base64: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className={`my-4 max-w-4xl mx-auto transition-all ${readOnly ? 'preview-mode' : 'p-4 bg-white shadow-sm border border-gray-200'}`}>
      {!typedData.base64 && !readOnly && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
          <p className="text-gray-500 mb-2">Adicionar Imagem</p>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id={`upload-${Math.random()}`} />
          <label htmlFor={`upload-${Math.random()}`} className="cursor-pointer text-blue-500 font-bold" onClick={(e) => (e.target as HTMLElement).previousElementSibling?.querySelector('input')?.click()}>
            Clique para selecionar
          </label>
           {/* Fallback input visual */}
           <input type="file" accept="image/*" onChange={handleUpload} className="mt-2" />
        </div>
      )}
      {typedData.base64 && (
        <div className="text-center">
          <img src={typedData.base64} alt="Preview" className="max-w-full h-auto max-h-[500px] mx-auto rounded shadow-sm object-contain"/>
          <input 
            className="w-full text-center text-sm text-gray-600 font-bold italic bg-transparent outline-none mt-2"
            placeholder={readOnly ? "" : "Legenda (opcional)..."}
            value={typedData.legenda}
            onChange={(e) => onUpdate({ ...typedData, legenda: e.target.value })}
            disabled={readOnly}
          />
          {!readOnly && (
             <button onClick={() => onUpdate({...typedData, base64: ""})} className="text-xs text-red-500 mt-2 hover:underline">Remover Imagem</button>
          )}
        </div>
      )}
    </div>
  );
};

// --- LÓGICA DE EXPORTAÇÃO DOCX ---
const exportLogic = (data: ImagemData) => {
  const elements = [];
  if (data.base64) {
    try {
      const binaryString = window.atob(data.base64.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      
      elements.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [new ImageRun({ data: bytes.buffer, transformation: { width: 500, height: 300 } })],
      }));
    } catch (e) { console.error(e); }
  }
  if (data.legenda) {
    elements.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: data.legenda, font: "Arial", size: 18, bold: true, italics: true })]
    }));
  }
  return elements;
};

// --- DEFINIÇÃO DO PLUGIN ---
export const PluginImagem: BlockPlugin = {
  type: 'imagem',
  label: '+ Imagem',
  buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  initialContent: { base64: "", legenda: "" },
  Component: BlocoImagemComponent,
  exporter: exportLogic
};