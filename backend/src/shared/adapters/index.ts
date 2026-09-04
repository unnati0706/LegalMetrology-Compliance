import { BoundingBox, Evidence } from '../types/index.js';

export interface StorageAdapter {
  uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<{ url: string; key: string }>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

export interface OcrResultField {
  field: string;
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface OcrAdapter {
  extractText(imageUrlOrBuffer: string | Buffer): Promise<{
    rawText: string;
    fields: OcrResultField[];
    averageConfidence: number;
  }>;
}

export interface VisionReadabilityResult {
  contrastRatio: number;
  isLegible: boolean;
  estimatedFontHeightMm: number;
  confidence: number;
  pdpBoundingBox?: BoundingBox;
}

export interface VisionAdapter {
  analyzePlacementAndReadability(imageUrlOrBuffer: string | Buffer, packageSide?: string): Promise<VisionReadabilityResult>;
}

// Mock Default Adapters for test / runtime without external vendor locks
export class MockStorageAdapter implements StorageAdapter {
  async uploadFile(_buffer: Buffer, filename: string, _mimeType: string) {
    return {
      url: `https://s3.ap-south-1.amazonaws.com/legalmetrology-evidence/mock-${filename}`,
      key: `evidence/mock-${Date.now()}-${filename}`,
    };
  }

  async getSignedUrl(key: string) {
    return `https://s3.ap-south-1.amazonaws.com/legalmetrology-evidence/${key}?signed=true`;
  }

  async deleteFile(_key: string) {}
}

export class MockOcrAdapter implements OcrAdapter {
  async extractText(_imageUrlOrBuffer: string | Buffer) {
    return {
      rawText: 'MRP Rs. 150.00 incl. of all taxes Net Qty: 500 g Mfd: 01/2026 Priya Foods Hyderabad 500001',
      fields: [
        { field: 'mrp', value: '₹150.00 incl. of all taxes', confidence: 0.96 },
        { field: 'net_quantity', value: '500 g', confidence: 0.94 },
        { field: 'mfg_date', value: '01/2026', confidence: 0.92 },
      ],
      averageConfidence: 0.94,
    };
  }
}

export class MockVisionAdapter implements VisionAdapter {
  async analyzePlacementAndReadability(_imageUrlOrBuffer: string | Buffer, _packageSide?: string) {
    return {
      contrastRatio: 4.8,
      isLegible: true,
      estimatedFontHeightMm: 3.2,
      confidence: 0.91,
      pdpBoundingBox: { ymin: 0.1, xmin: 0.1, ymax: 0.8, xmax: 0.9 },
    };
  }
}
