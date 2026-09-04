import { v4 as uuidv4 } from 'uuid';
import { OCRBlock } from './ocr.adapter';

export interface OCRResultEntity {
  id: string;
  evidenceId: string;
  rawText: string;
  overallConfidence: number;
  blocks: OCRBlock[];
  providerName: string;
  createdAt: string;
}

const ocrStore: Map<string, OCRResultEntity> = new Map();

// Seed initial OCR result
const seedOcrId = 'ocr_001';
ocrStore.set(seedOcrId, {
  id: seedOcrId,
  evidenceId: 'ev_001',
  rawText: 'NET QUANTITY: 70g\nMRP Rs. 14.00 (Incl. of all taxes)\nMFG DATE: 01/2026',
  overallConfidence: 0.92,
  blocks: [
    { text: 'NET QUANTITY: 70g', confidence: 0.95 },
    { text: 'MRP Rs. 14.00 (Incl. of all taxes)', confidence: 0.92 },
    { text: 'MFG DATE: 01/2026', confidence: 0.88 },
  ],
  providerName: 'Mock-Tesseract-v5',
  createdAt: new Date().toISOString(),
});

export class B14Repository {
  async findAll(filters: { evidenceId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(ocrStore.values());

    if (filters.evidenceId) {
      list = list.filter((o) => o.evidenceId === filters.evidenceId);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<OCRResultEntity | null> {
    return ocrStore.get(id) || null;
  }

  async create(data: { evidenceId: string; rawText: string; overallConfidence: number; blocks: OCRBlock[]; providerName: string }): Promise<OCRResultEntity> {
    const id = uuidv4();
    const result: OCRResultEntity = {
      id,
      evidenceId: data.evidenceId,
      rawText: data.rawText,
      overallConfidence: data.overallConfidence,
      blocks: data.blocks,
      providerName: data.providerName,
      createdAt: new Date().toISOString(),
    };
    ocrStore.set(id, result);
    return result;
  }

  async updateText(id: string, rawText: string): Promise<OCRResultEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: OCRResultEntity = {
      ...existing,
      rawText,
    };
    ocrStore.set(id, updated);
    return updated;
  }
}
