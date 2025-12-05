"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectsList, createNewProject, deleteProject, ProjectMetadata } from './services/storage';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(getProjectsList());
  };

  const handleCreate = () => {
    const newId = createNewProject();
    router.push(`/project/${newId}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      deleteProject(id);
      loadProjects();
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="font-bold mb-8 text-4xl text-gray-800">ReqMaker <span className="text-xs font-normal text-gray-500">v2.0</span></div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Meus Projetos</h1>
            <p className="text-gray-500">Gerencie seus documentos de requisitos</p>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Novo Projeto
          </button>
        </div>

        {/* Grid de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card de Criar (Atalho) */}
          <div 
            onClick={handleCreate}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group min-h-[200px]"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-4">
              <span className="text-3xl text-gray-400 group-hover:text-blue-600">+</span>
            </div>
            <span className="font-bold text-gray-500 group-hover:text-blue-600">Criar Novo Documento</span>
          </div>

          {/* Lista de Projetos Existentes */}
          {projects.map((proj) => (
            <div 
              key={proj.id}
              onClick={() => router.push(`/project/${proj.id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 cursor-pointer transition-all relative group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2 truncate pr-6">{proj.title}</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Editado há {new Date(proj.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between items-center mt-4 border-t pt-4">
                 <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">DOCX</span>
                 
                 <button 
                   onClick={(e) => handleDelete(e, proj.id)}
                   className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                   title="Excluir projeto"
                 >
                   🗑️
                 </button>
              </div>
            </div>
          ))}

        </div>
        
        {projects.length === 0 && (
          <div className="text-center mt-12 text-gray-400">
            Nenhum projeto encontrado. Crie o primeiro acima!
          </div>
        )}

      </div>
    </main>
  );
}