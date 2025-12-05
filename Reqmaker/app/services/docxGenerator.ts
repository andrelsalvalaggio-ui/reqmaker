import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { Block } from "../types";
import { getPlugin } from "../registry"; // Acesso ao registro

const createDocxDocument = (blocks: Block[]) => {
  const docChildren: any[] = [];
  let cduCounter = 0;

  // Título Fixo
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Especificação de Requisitos", font: "Arial", bold: true, size: 32 })]
    })
  );

  blocks.forEach((block) => {
    // 1. Encontra o plugin responsável
    const plugin = getPlugin(block.type);

    if (plugin) {
      let idVisual = "";
      
      // 2. Verifica se esse plugin precisa de numeração visual
      if (plugin.usesVisualId) {
        cduCounter++;
        idVisual = `CDU${cduCounter.toString().padStart(2, '0')}`;
      }

      // 3. Delega a criação do DOCX para o Plugin
      const nodes = plugin.exporter(block.content, idVisual);
      
      if (Array.isArray(nodes)) {
        docChildren.push(...nodes);
      } else {
        docChildren.push(nodes);
      }
    }
  });

  return new Document({ sections: [{ children: docChildren }] });
};

export const generateDocxBlob = async (blocks: Block[]): Promise<Blob> => {
  const doc = createDocxDocument(blocks);
  return await Packer.toBlob(doc);
};

export const generateAndDownloadDocx = async (blocks: Block[]) => {
  const blob = await generateDocxBlob(blocks);
  saveAs(blob, "Requisitos.docx");
};