import { BlockPlugin } from "./types";
import { PluginTabelaCDU } from "../components/TabelaCDU";
import { PluginTexto } from "../components/BlocoTexto";
import { PluginImagem } from "../components/BlocoImagem";

// MAPA DE REGISTRO
// Aqui você liga a chave 'tipo' ao Plugin importado
export const BLOCK_REGISTRY: Record<string, BlockPlugin> = {
  [PluginTexto.type]: PluginTexto,
  [PluginTabelaCDU.type]: PluginTabelaCDU,
  [PluginImagem.type]: PluginImagem,
};

// Helpers para a UI e o Gerador usarem
export const getPlugins = () => Object.values(BLOCK_REGISTRY);
export const getPlugin = (type: string) => BLOCK_REGISTRY[type];