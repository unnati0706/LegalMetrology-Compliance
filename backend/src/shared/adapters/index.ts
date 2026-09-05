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

export class OcrSpaceSharedAdapter implements OcrAdapter {
  private apiUrl = 'https://api.ocr.space/parse/image';

  async extractText(imageUrlOrBuffer: string | Buffer) {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      throw new Error('OCR.space API key is missing. Please set OCR_SPACE_API_KEY in backend/.env');
    }

    let imageSource = '';
    if (typeof imageUrlOrBuffer === 'string') {
      imageSource = imageUrlOrBuffer;
    } else if (Buffer.isBuffer(imageUrlOrBuffer)) {
      imageSource = `data:image/png;base64,${imageUrlOrBuffer.toString('base64')}`;
    }

    const isUrl = /^https?:\/\//i.test(imageSource);
    const isBase64 = /^data:image\//i.test(imageSource);

    if (!isUrl && !isBase64) {
      const mock = new MockOcrAdapter();
      return mock.extractText(imageUrlOrBuffer);
    }

    try {
      const formData = new URLSearchParams();
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('OCREngine', '2');

      if (isBase64) {
        formData.append('base64Image', imageSource);
      } else {
        formData.append('url', imageSource);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(`OCR.space API Key is invalid or unauthorized (HTTP ${response.status})`);
        }
        throw new Error(`OCR.space API HTTP error! Status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (data.IsErroredOnProcessing) {
        const errMsg = Array.isArray(data.ErrorMessage)
          ? data.ErrorMessage.join(', ')
          : data.ErrorMessage || 'Processing error on OCR.space server';
        throw new Error(`OCR.space API Error: ${errMsg}`);
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        throw new Error('OCR.space returned no parsed results.');
      }

      const result = data.ParsedResults[0];

      if (result.FileParseExitCode !== 1) {
        const detail = result.ErrorMessage || result.ErrorDetails || 'Failed to parse image';
        throw new Error(`OCR.space Parsing Error (Code ${result.FileParseExitCode}): ${detail}`);
      }

      const rawText = result.ParsedText ? result.ParsedText.trim() : '';

      return {
        rawText,
        fields: [],
        averageConfidence: 0.90,
      };
    } catch (err: any) {
      throw new Error(`OCR.space extraction failed: ${err.message}`);
    }
  }
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
