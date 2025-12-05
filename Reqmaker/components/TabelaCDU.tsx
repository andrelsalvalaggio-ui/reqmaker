"use client";

import React from 'react';
// 1. Adicionado VerticalAlign aos imports
import { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, TableLayoutType, AlignmentType, VerticalAlign } from "docx";
import { BlockPlugin } from '../app/types';
import { StringInput } from './ui/StringInput';

// 1. Definição dos dados
interface CDUData {
  titulo: string;
  modulo: string;
  descricao: string;
  atores: string;
  preCondicoes: string;
  posCondicoes: string;
  fluxoPrincipal: string;
  fluxoAlternativo: string;
  fluxoExcecao: string;
}

// 2. Componente Visual
const BlocoCDUComponent = ({ data, onUpdate, readOnly, idVisual }: any) => {
  const cduData = data as CDUData;

  const updateField = (field: keyof CDUData, value: string) => {
    onUpdate({ ...cduData, [field]: value });
  };

  return (
    <div className={`my-4 max-w-4xl mx-auto ${readOnly ? 'preview-mode' : 'bg-white border border-gray-300 shadow-sm p-6 rounded-lg'}`}>
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-4 border-b pb-2">
        <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-sm">
          {idVisual || "CDU??"}
        </span>
        <input 
          className="flex-1 font-bold text-lg text-gray-800 outline-none bg-transparent placeholder-gray-400"
          placeholder="Título do Caso de Uso"
          value={cduData.titulo}
          onChange={(e) => updateField('titulo', e.target.value)}
          disabled={readOnly}
        />
        <input 
          className="w-32 text-right text-sm text-gray-500 outline-none bg-transparent"
          placeholder="Módulo..."
          value={cduData.modulo}
          onChange={(e) => updateField('modulo', e.target.value)}
          disabled={readOnly}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição Resumida</label>
           <textarea className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none resize-none h-16"
             value={cduData.descricao} onChange={(e) => updateField('descricao', e.target.value)} disabled={readOnly} />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Atores</label>
          <input className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none"
            value={cduData.atores} onChange={(e) => updateField('atores', e.target.value)} disabled={readOnly} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pré-condições</label>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none resize-none h-20"
              value={cduData.preCondicoes} onChange={(e) => updateField('preCondicoes', e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pós-condições</label>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none resize-none h-20"
              value={cduData.posCondicoes} onChange={(e) => updateField('posCondicoes', e.target.value)} disabled={readOnly} />
          </div>
        </div>

        {/* Fluxos */}
        {['fluxoPrincipal', 'fluxoAlternativo', 'fluxoExcecao'].map((field) => (
          <div key={field}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              {field.replace(/([A-Z])/g, ' $1').trim()} {/* Formata CamelCase para Texto */}
            </label>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none resize-y min-h-[60px]"
              value={cduData[field as keyof CDUData]} 
              onChange={(e) => updateField(field as keyof CDUData, e.target.value)} 
              disabled={readOnly} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Lógica de Exportação
const exportLogic = (data: CDUData, idVisual?: string) => {
  const fontStyle = "Arial";
  const fontSize = 20; 
  const grayColor = "F2F2F2";

  const safeId = idVisual || "";

  type AlignOption = (typeof AlignmentType)[keyof typeof AlignmentType];
  
  const cleanText = (t: string) => (t && t.trim() !== "") ? t : "\u200B";

  // Helper de Parágrafo
  const para = (text: string, align: AlignOption = AlignmentType.LEFT, bold = false) => 
    new Paragraph({
      alignment: align,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({ text: cleanText(text), font: fontStyle, size: fontSize, bold: bold })
      ]
    });

  // Helper de Célula
  const cell = (
    text: string, 
    bold = false, 
    align: AlignOption = AlignmentType.LEFT, 
    fill = "", 
    colSpan = 1
  ) => 
    new TableCell({
      columnSpan: colSpan,
      shading: fill ? { fill: fill } : undefined,
      verticalAlign: VerticalAlign.CENTER, // 2. Correção: Uso do Enum VerticalAlign
      children: [para(text, align, bold)],
      margins: { top: 0, bottom: 0, left: 100, right: 100 }, // Margens positivas (Twips)
    });

  const rowMerged = (label: string, value: string) => 
    new TableRow({
      children: [
        cell(label, true, AlignmentType.CENTER, grayColor), 
        cell(value, false, AlignmentType.LEFT, "", 2)       
      ]
    });

  const col1 = 1800; // Largura da primeira coluna
  const col2 = 5200; // Largura do meio
  const col3 = 2000; // Largura da última

  // 3. Correção: Retornar ARRAY
  return [
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [col1, col2, col3],
      rows: [
        // Cabeçalho
        new TableRow({
          children: [
            cell("ID", true, AlignmentType.CENTER, grayColor),
            cell("Título", true, AlignmentType.CENTER, grayColor),
            cell("Módulo", true, AlignmentType.CENTER, grayColor),
          ],
        }),
        // Dados Principais
        new TableRow({
          children: [
            cell(safeId, true, AlignmentType.CENTER),
            cell(data.titulo, false, AlignmentType.LEFT),
            cell(data.modulo, true, AlignmentType.CENTER),
          ],
        }),
        // Linhas Detalhadas
        rowMerged("Descrição", data.descricao),
        rowMerged("Atores", data.atores),
        rowMerged("Pré-condições", data.preCondicoes),
        rowMerged("Fluxo Principal", data.fluxoPrincipal),
        rowMerged("Fluxos Alternativos", data.fluxoAlternativo),
        rowMerged("Fluxos de Exceção", data.fluxoExcecao),
        rowMerged("Pós-condições", data.posCondicoes),
      ],
    }),
    para(''),
  ];
};

const CDUProperties = ({ data, onUpdate }: { data: CDUData, onUpdate: (d: any) => void }) => {

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h3 className="text-xs uppercase font-bold text-gray-400 border-b pb-2 mb-2">Conteúdo</h3>
  
        <StringInput 
          label="Titulo" 
          value={data.titulo}
          onChange={(val) => onUpdate({ ...data, titulo: val })} 
          placeholder="Titulo do caso de uso..."
        />
        <StringInput 
          label="Descrição" 
          value={data.descricao}
          height={80}
          onChange={(val) => onUpdate({ ...data, descricao: val })} 
          placeholder="Conteúdo da descrição..."
        />
        <StringInput 
          label="Atores" 
          value={data.atores}
          onChange={(val) => onUpdate({ ...data, atores: val })} 
          placeholder="Atores do caso de uso..."
        />
        <StringInput 
          label="Pré Condições" 
          value={data.preCondicoes}
          height={80}
          onChange={(val) => onUpdate({ ...data, preCondicoes: val })} 
          placeholder="Pré condições do caso de uso..."
        />
        <StringInput 
          label="Fluxo Principal" 
          value={data.fluxoPrincipal}
          height={150}
          onChange={(val) => onUpdate({ ...data, fluxoPrincipal: val })} 
          placeholder="Fluxo Principal do caso de uso..."
        />
        <StringInput 
          label="Fluxos Alternativos" 
          value={data.fluxoAlternativo}
          height={150}
          onChange={(val) => onUpdate({ ...data, fluxoAlternativo: val })} 
          placeholder="Fluxos Alternativos do caso de uso..."
        />
        <StringInput 
          label="Fluxo Exceção" 
          value={data.fluxoExcecao}
          height={150}
          onChange={(val) => onUpdate({ ...data, fluxoExcecao: val })} 
          placeholder="Fluxo Exceção do caso de uso..."
        />
        <StringInput 
          label="Pós Condições" 
          value={data.posCondicoes}
          height={80}
          onChange={(val) => onUpdate({ ...data, posCondicoes: val })} 
          placeholder="Pós Condições do caso de uso..."
        />

        
    </div>
  );
};

// 4. Definição do Plugin
export const PluginTabelaCDU: BlockPlugin = {
  type: 'cdu',
  label: 'Tabela CDU',
  buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  usesVisualId: true,
  
  // 4. Correção: Inicializar todos os campos para evitar undefined
  initialContent: {
    titulo: "",
    modulo: "",
    descricao: "",
    atores: "",
    preCondicoes: "",
    posCondicoes: "",
    fluxoPrincipal: "1. O usuário acessa...",
    fluxoAlternativo: "",
    fluxoExcecao: ""
  },
  
  Component: BlocoCDUComponent,
  exporter: exportLogic,

  PropertiesComponent: CDUProperties
};