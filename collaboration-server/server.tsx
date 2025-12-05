// server.ts (Rode com: tsx server.ts)
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
// Você pode usar SQLite, Postgres, ou salvar em arquivos JSON mesmo
import { saveToDisk, loadFromDisk } from "./utils/storage"; 

const server = new Server({
  port: 1234,
  
  // AQUI ACONTECE A PERSISTÊNCIA
  extensions: [
    new Database({
      // Quando alguém conecta, busca do disco/banco
      fetch: async ({ documentName }) => {
        return await loadFromDisk(documentName);
      },
      // Quando alguém edita, salva no disco/banco
      store: async ({ documentName, state }) => {
        await saveToDisk(documentName, state);
      },
    }),
  ],
});

server.listen();
console.log("🔮 Servidor de Colaboração rodando na porta 1234");