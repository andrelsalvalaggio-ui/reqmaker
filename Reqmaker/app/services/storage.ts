// app/services/storage.ts
import { Block } from "../types";

export interface ProjectMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string; // Opcional: texto do primeiro bloco para preview
}

export interface ProjectData extends ProjectMetadata {
  blocks: Block[];
}

const STORAGE_KEY = "reqmaker_projects";

// Lista apenas os metadados para a Home (leve)
export const getProjectsList = (): ProjectMetadata[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  
  const projects: ProjectData[] = JSON.parse(raw);
  // Retorna apenas dados básicos, sem os blocos pesados
  return projects.map(({ id, title, createdAt, updatedAt }) => ({
    id, title, createdAt, updatedAt
  })).sort((a, b) => b.updatedAt - a.updatedAt); // Mais recentes primeiro
};

// Pega um projeto completo pelo ID
export const getProjectById = (id: string): ProjectData | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const projects: ProjectData[] = JSON.parse(raw);
  return projects.find(p => p.id === id) || null;
};

// Cria um novo projeto vazio
export const createNewProject = (): string => {
  const newId = crypto.randomUUID();
  const newProject: ProjectData = {
    id: newId,
    title: "Novo Projeto de Requisitos",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    blocks: []
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  const projects: ProjectData[] = raw ? JSON.parse(raw) : [];
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  
  return newId;
};

// Salva alterações (Auto-save)
export const saveProject = (id: string, blocks: Block[], title?: string) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const projects: ProjectData[] = raw ? JSON.parse(raw) : [];
  
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index].blocks = blocks;
    projects[index].updatedAt = Date.now();
    if (title) projects[index].title = title;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
};

// Deletar Projeto
export const deleteProject = (id: string) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  let projects: ProjectData[] = JSON.parse(raw);
  projects = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};