"use client";

import React, { ChangeEvent } from 'react';
import { Paragraph, ImageRun, AlignmentType, TextRun } from "docx";
import { BlockPlugin } from '../app/types';

interface ImagemData {
  base64: string;
  legenda: string;
  width?: number;
  height?: number;
}

// --- COMPONENTE VISUAL ---
const BlocoImagemComponent = ({ data, onUpdate, readOnly }: any) => {
  const typedData = data as ImagemData;

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      
      // Truque para pegar as dimensões reais da imagem
      const img = new Image();
      img.src = result;
      img.onload = () => {
        onUpdate({ 
          ...ImageData, 
          base64: result,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
    };
    reader.readAsDataURL(file);
  };

  const id = React.useId();

  return (
    <div className={`my-4 mx-auto transition-all ${readOnly ? 'preview-mode' : 'p-4 bg-white shadow-sm border border-gray-200'}`}>
      {!typedData.base64 && !readOnly && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
          <p className="text-gray-500 mb-2">Adicionar Imagem</p>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id={`upload-${id}`} />
          <label htmlFor={`upload-${id}`} className="cursor-pointer text-blue-500 font-bold" onClick={(e) => (e.target as HTMLElement).previousElementSibling?.querySelector('input')?.click()}>
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
             <button onClick={() => onUpdate({...typedData, base64: "", width: 0, height: 0})} className="text-xs text-red-500 mt-2 hover:underline">Remover Imagem</button>
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
      let imgType: "png" | "jpg" | "gif" = "png"; // Padrão seguro
      if (data.base64.includes("image/jpeg") || data.base64.includes("image/jpg")) {
        imgType = "jpg";
      } else if (data.base64.includes("image/gif")) {
        imgType = "gif";
      }

      const binaryString = window.atob(data.base64.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const MAX_WIDTH = 500;
      let finalWidth = MAX_WIDTH;
      let finalHeight = 300; // fallback

      if (data.width && data.height) {
        const ratio = data.height / data.width;
        finalHeight = Math.round(MAX_WIDTH * ratio);
      }

      elements.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({ 
            data: bytes.buffer, 
            transformation: { 
              width: finalWidth, 
              height: finalHeight 
            },
            type: imgType
          })
        ],
      }));
    } catch (e) { console.error(e); }
  }
  if (data.legenda) {
    elements.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ 
          text: `Figura - ${data.legenda}`, 
          font: "Arial", 
          size: 18, // 9pt
          bold: true, 
          italics: true,
          color: "666666"
        })
      ]
    }));
  }
  return elements;
};

const ImagemProperties = ({ data, onUpdate }: { data: ImagemData, onUpdate: (d: any) => void }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-gray-700 border-b pb-2">Configurações de Imagem</h3>
      
      {/* Inputs de Dimensão */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-bold text-gray-500">Largura (px)</label>
          <input 
            type="number" 
            className="w-full border rounded p-1 text-sm"
            value={data.width || 0}
            onChange={(e) => onUpdate({ ...data, width: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Altura (px)</label>
          <input 
            type="number" 
            className="w-full border rounded p-1 text-sm"
            value={data.height || 0}
            onChange={(e) => onUpdate({ ...data, height: Number(e.target.value) })}
          />
        </div>
      </div>
      
      <p className="text-xs text-gray-400">
        Defina 0 para usar o tamanho automático. A proporção será mantida se apenas um valor for definido.
      </p>
    </div>
  );
};

// --- DEFINIÇÃO DO PLUGIN ---
export const PluginImagem: BlockPlugin = {
  type: 'imagem',
  label: 'Imagem',
  buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  initialContent: { base64: "", legenda: "", width: 0, height: 0 },
  
  Component: BlocoImagemComponent,
  PropertiesComponent: ImagemProperties,

  exporter: exportLogic
};