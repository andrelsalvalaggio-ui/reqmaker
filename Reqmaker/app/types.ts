import React from 'react';

// O formato de como salvamos no banco/JSON
export interface Block {
  id: string;
  type: string;
  content: any; // Pode ser texto, dados do CDU, imagem, etc.
}

// O CONTRATO DO PLUGIN
// Todo componente novo deve exportar um objeto seguindo essa interface
export interface BlockPlugin {
  type: string;          // ID único (ex: 'cdu', 'texto', 'imagem')
  label: string;         // Nome no botão (ex: '+ Tabela CDU')
  buttonColor: string;   // Classes Tailwind para o botão
  initialContent: any;   // Dados iniciais ao criar o bloco
  usesVisualId?: boolean; // Se true, recebe o contador (ex: CDU01)

  // O Componente React que aparece na tela
  Component: React.FC<{ 
    data: any; 
    onUpdate: (newData: any) => void; 
    readOnly?: boolean;
    idVisual?: string; // ex: "CDU01"
  }>;

  PropertiesComponent?: React.FC<{
    data: any;
    onUpdate: (newData: any) => void;
  }>;

  // A função que transforma os dados em nós do DOCX
  exporter: (content: any, idVisual?: string) => any[];
}