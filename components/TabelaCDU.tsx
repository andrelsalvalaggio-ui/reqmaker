"use client";

import React, { useState, ChangeEvent } from 'react';

// 1. A INTERFACE (O "Molde" dos dados)
// Isso é o equivalente a criar uma classe POJO/DTO no Java.
// Define que nosso estado OBRIGATORIAMENTE tem que ter esses campos.
interface DadosCDU {
  id: string;
  titulo: string;
  modulo: string;
  descricao: string;
  atores: string;
  preCondicoes: string;
  fluxoPrincipal: string;
  fluxosAlternativos: string;
  fluxosExcecao: string;
  posCondicoes: string;
}

export default function TabelaCDU() {
  
  // 2. O ESTADO TIPADO
  // <DadosCDU> avisa ao React que essa variável 'dados' segue a interface acima.
  const [dados, setDados] = useState<DadosCDU>({
    id: "CDU01",
    titulo: "",
    modulo: "",
    descricao: "",
    atores: "",
    preCondicoes: "",
    fluxoPrincipal: "",
    fluxosAlternativos: "",
    fluxosExcecao: "",
    posCondicoes: ""
  });

  // 3. O EVENTO TIPADO
  // No Java seria (ActionEvent e). Aqui, precisamos dizer que o evento 'e'
  // vem de um Input ou de um TextArea do HTML.
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  };

  return (
    <div className="border border-gray-400 my-4 shadow-lg max-w-4xl mx-auto bg-white">
      
      {/* Cabeçalho */}
      <div className="grid grid-cols-12 text-black border-b border-gray-400 bg-gray-100">
        <div className="w-40 col-span-2 p-2 text-black border-r border-gray-400 font-bold text-center flex items-center justify-center">ID</div>
        <div className="col-span-8 p-2 text-black border-r border-gray-400 font-bold text-center flex items-center justify-center">Título</div>
        <div className="col-span-2 p-2 text-black font-bold text-center flex items-center justify-center">Módulo</div>
      </div>

      {/* Inputs Cabeçalho */}
      <div className="grid grid-cols-12 border-b border-gray-400">
        <div className="w-40 col-span-2 border-r border-gray-400">
          <input 
            className="w-full text-black p-2 text-center font-bold outline-none focus:bg-blue-50"
            name="id"
            value={dados.id}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-8 border-r border-gray-400">
          <input 
            className="w-full text-black p-2 outline-none focus:bg-blue-50"
            name="titulo"
            value={dados.titulo}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-2">
          <input 
            className="w-full p-2 text-center font-bold text-black outline-none focus:bg-blue-50"
            name="modulo"
            value={dados.modulo}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold bg-gray-50 text-black border-r border-gray-400 flex items-center">
          Descrição
        </div>
        <div className="flex-1">
          <textarea 
            className="w-full field-sizing-content p-2 h-full overflow-auto outline-none text-black resize-none focus:bg-blue-50 block"
            name="descricao"
            placeholder="Descreva o caso de uso..."
            value={dados.descricao}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Atores */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold text-black bg-gray-50 border-r border-gray-400 flex items-center">
          Atores
        </div>
        <div className="flex-1">
          <input 
            className="w-full p-2 text-black outline-none focus:bg-blue-50"
            name="atores"
            placeholder="Atores envolvidos..."
            value={dados.atores}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Pré-condições */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold text-black bg-gray-50 border-r border-gray-400 flex items-center">
          Pré-condições
        </div>
        <div className="flex-1">
          <input 
            className="w-full p-2 text-black outline-none focus:bg-blue-50"
            name="preCondicoes"
            placeholder="Pré-condições para este CDU..."
            value={dados.preCondicoes}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Fluxo Principal */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold text-black bg-gray-50 border-r border-gray-400 flex items-center">
          Fluxo Principal
        </div>
        <div className="flex-1">
          <input 
            className="w-full p-2 text-black outline-none focus:bg-blue-50"
            name="fluxoPrincipal"
            placeholder="Fluxo principal deste CDU..."
            value={dados.fluxoPrincipal}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Fluxos Alternativos */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold text-black bg-gray-50 border-r border-gray-400 flex items-center">
          Fluxos Alternativos
        </div>
        <div className="flex-1">
          <input 
            className="w-full p-2 text-black outline-none focus:bg-blue-50"
            name="fluxosAlternativos"
            placeholder="Fluxos Alternativos deste CDU..."
            value={dados.fluxosAlternativos}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Fluxos Exceção */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold text-black bg-gray-50 border-r border-gray-400 flex items-center">
          Fluxos Exceção
        </div>
        <div className="flex-1">
          <input 
            className="w-full p-2 text-black outline-none focus:bg-blue-50"
            name="fluxosExcecao"
            placeholder="Fluxos Exceção deste CDU..."
            value={dados.fluxosExcecao}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Pós Condições */}
      <div className="flex border-b border-gray-400">
        <div className="w-40 p-2 font-bold text-black bg-gray-50 border-r border-gray-400 flex items-center">
          Pós Condições
        </div>
        <div className="flex-1">
          <input 
            className="w-full p-2 text-black outline-none focus:bg-blue-50"
            name="posCondicoes"
            placeholder="Pós Condições deste CDU..."
            value={dados.posCondicoes}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Debug Area (Só pra gente ver funcionando) */}
      <div className="bg-gray-800 text-white p-2 text-xs font-mono">
        <span>TS State: {JSON.stringify(dados)}</span>
      </div>

    </div>
  );
}