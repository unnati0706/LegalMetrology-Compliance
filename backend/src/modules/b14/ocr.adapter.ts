export interface OCRBlock {
  text: string;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface OCRResultData {
  rawText: string;
  overallConfidence: number;
  blocks: OCRBlock[];
  providerName: string;
}

export interface IOCRAdapter {
  extractText(imageSource: string, simulateFailure?: boolean): Promise<OCRResultData>;
}

export class MockOCRAdapter implements IOCRAdapter {
  async extractText(imageSource: string, simulateFailure = false): Promise<OCRResultData> {
    if (simulateFailure) {
      throw new Error('OCR upstream engine connection timed out');
    }

    const blocks: OCRBlock[] = [
      { text: 'NET QUANTITY: 70g', confidence: 0.95, bbox: { x: 50, y: 120, width: 200, height: 30 } },
      { text: 'MRP Rs. 14.00 (Incl. of all taxes)', confidence: 0.92, bbox: { x: 50, y: 160, width: 250, height: 30 } },
      { text: 'MFG DATE: 01/2026', confidence: 0.88, bbox: { x: 50, y: 200, width: 180, height: 30 } },
      { text: 'Mfd by: Nestle India Ltd, Moga, Punjab - 142001', confidence: 0.90, bbox: { x: 50, y: 240, width: 400, height: 40 } },
      { text: 'Consumer Care Cell: 1800-225-537 / wecare@nestle.in', confidence: 0.86, bbox: { x: 50, y: 290, width: 420, height: 30 } },
    ];

    const rawText = blocks.map((b) => b.text).join('\n');
    const totalConf = blocks.reduce((acc, b) => acc + b.confidence, 0);
    const overallConfidence = parseFloat((totalConf / blocks.length).toFixed(2));

    return {
      rawText,
      overallConfidence,
      blocks,
      providerName: 'Mock-Tesseract-v5',
    };
  }
}
