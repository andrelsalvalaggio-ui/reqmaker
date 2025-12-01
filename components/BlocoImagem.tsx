"use client";

import React, { ChangeEvent } from 'react';
import { Paragraph, ImageRun, AlignmentType, TextRun } from "docx";
import { BlockPlugin } from '../app/types';
import { NumberInput } from '../components/ui/NumberInput';

interface ImagemData {
  base64: string;
  legenda: string;
  width: number;
  height: number;
}

// --- COMPONENTE VISUAL ---
const BlocoImagemComponent = ({ data, onUpdate, readOnly }: any) => {
  const imgData = data as ImagemData;

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
          ...imgData, 
          base64: result,
          width: img.naturalWidth > 500 ? 500 : img.naturalWidth,
          height: img.naturalHeight > 300 ? 300 : img.naturalHeight
        });
        console.log('natural width: ', img.naturalWidth)
      };
    };
    reader.readAsDataURL(file);
  };

  const id = React.useId();

  const imageStyle: React.CSSProperties = {
    // Se tiver valor, usa pixel. Se for 0 ou undefined, usa 'auto'
    width: imgData.width > 0 ? `${imgData.width}px` : 'auto',
    height: imgData.height > 0 ? `${imgData.height}px` : 'auto',
  };

  return (
    <div className={`my-4 mx-auto transition-all ${readOnly ? 'preview-mode' : 'p-4 bg-white shadow-sm border border-gray-200'}`}>
      {!imgData.base64 && !readOnly && (
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
      {imgData.base64 && (
        <div className="text-center">
          <img src={imgData.base64} alt="Preview" style={imageStyle} className='max-w-full mx-auto rounded shadow-sm'/>
          <input 
            className="w-full text-center text-sm text-gray-600 font-bold italic bg-transparent outline-none mt-2"
            placeholder={readOnly ? "" : "Legenda (opcional)..."}
            value={imgData.legenda}
            onChange={(e) => onUpdate({ ...imgData, legenda: e.target.value })}
            disabled={readOnly}
          />
          {!readOnly && (
             <button onClick={() => onUpdate({...imgData, base64: "", width: 0, height: 0})} className="text-xs text-red-500 mt-2 hover:underline">Remover Imagem</button>
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
      
      const MAX_WIDTH = 600;
      let finalWidth = data.width > MAX_WIDTH ? 600 : data.width;
      let finalHeight = data.height; 

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
  
  const handleChange = (field: 'width' | 'height', value: number) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h3 className="text-xs uppercase font-bold text-gray-400 border-b pb-2 mb-2">Dimensões</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Agora usamos o componente reutilizável */}
        <NumberInput 
          label="Largura" 
          value={data.width}
          dragLabel='W'
          suffix='px'
          dragSpeed={32}
          onChange={(val) => handleChange('width', val)} 
        />
        
        <NumberInput 
          label="Altura" 
          value={data.height}
          dragLabel='H'
          suffix='px'
          dragSpeed={32}
          onChange={(val) => handleChange('height', val)} 
        />
      </div>

      <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded border border-blue-100 mt-2">
        ℹ️ <strong>Dica:</strong> Clique e arraste sobre os nomes "Largura" ou "Altura" para ajustar rapidamente. Deixe 0 para "Auto".
      </div>
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