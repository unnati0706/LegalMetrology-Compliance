export interface OCRBlock {
  text: string;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface LegalMetrologyFields {
  mrp?: string;
  netQuantity?: string;
  mfgDate?: string;
  expiryDate?: string;
  batchNo?: string;
  manufacturerName?: string;
  consumerCare?: string;
  countryOfOrigin?: string;
  commodityName?: string;
  unitSalePrice?: string;
}

export interface OCRResultData {
  rawText: string;
  overallConfidence: number;
  blocks: OCRBlock[];
  providerName: string;
  parsedFields?: LegalMetrologyFields;
}

export interface IOCRAdapter {
  extractText(imageSource: string, simulateFailure?: boolean): Promise<OCRResultData>;
}

export function parseLegalMetrologyFields(rawText: string): LegalMetrologyFields {
  if (!rawText) return {};

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fields: LegalMetrologyFields = {};

  for (const line of lines) {
    if (!fields.mrp && /(?:mrp|max(?:imum)?\s*retail\s*price|rs\.?|₹|incl\.?\s*of\s*all\s*taxes)/i.test(line)) {
      fields.mrp = line;
    } else if (!fields.netQuantity && /(?:net\s*(?:qty|quantity|wt\.?|weight|vol\.?|volume)|n\.wt\.?|\d+\s*(?:g|gm|kg|ml|l|ltr)[\b\s,.]?)/i.test(line)) {
      fields.netQuantity = line;
    } else if (!fields.mfgDate && /(?:mfg|pkd|packed|mfd\.?|dop\.?|date\s*of\s*(?:mfg|pkg|packing)|\d{2}[\/\.-]\d{2,4})/i.test(line)) {
      fields.mfgDate = line;
    } else if (!fields.expiryDate && /(?:exp|expiry|use\s*by|best\s*before|valid\s*till)/i.test(line)) {
      fields.expiryDate = line;
    } else if (!fields.batchNo && /(?:batch|lot|b\.?\s*no|bn|code)/i.test(line)) {
      fields.batchNo = line;
    } else if (!fields.unitSalePrice && /(?:usp|unit\s*sale\s*price|rs\.?\s*\d+.*(?:per|\/))/i.test(line)) {
      fields.unitSalePrice = line;
    } else if (!fields.manufacturerName && /(?:mfd\.?\s*by|manufactured\s*by|mktd\.?\s*by|marketed\s*by|packed\s*by|imported\s*by|pvt\.?\s*ltd\.?|ltd\.?)/i.test(line)) {
      fields.manufacturerName = line;
    } else if (!fields.consumerCare && /(?:consumer|customer)\s*care|care\s*cell|helpline|toll\s*free|1800|wecare|feedback|complaint|care@/i.test(line)) {
      fields.consumerCare = line;
    } else if (!fields.countryOfOrigin && /(?:country\s*of\s*origin|made\s*in|product\s*of)/i.test(line)) {
      fields.countryOfOrigin = line;
    } else if (!fields.commodityName && /(?:commodity|generic\s*name|product\s*name|item)/i.test(line)) {
      fields.commodityName = line;
    }
  }

  if (!fields.mrp) {
    const match = rawText.match(/(?:mrp|rs\.?|₹)\s*[:.-]?\s*([0-9.,]+(?:\s*\(?incl\.?\s*of\s*all\s*taxes\)?)?)/i);
    if (match) fields.mrp = match[0].trim();
  }
  if (!fields.netQuantity) {
    const match = rawText.match(/(?:net\s*(?:qty|quantity|wt\.?|weight|vol\.?|volume)?\s*[:.-]?\s*\d+\s*(?:g|gm|kg|ml|l|ltr|units|pcs))/i);
    if (match) fields.netQuantity = match[0].trim();
  }
  if (!fields.mfgDate) {
    const match = rawText.match(/(?:mfg|pkd|mfd|packed)\s*[:.-]?\s*(\d{2}[\/\.-]\d{2,4}|\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4}|\w+\s+\d{4})/i);
    if (match) fields.mfgDate = match[0].trim();
  }
  if (!fields.expiryDate) {
    const match = rawText.match(/(?:exp|expiry|use\s*by|best\s*before)\s*[:.-]?\s*(\d{2}[\/\.-]\d{2,4}|\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4}|\w+\s+\d{4}|\d+\s*months)/i);
    if (match) fields.expiryDate = match[0].trim();
  }
  if (!fields.batchNo) {
    const match = rawText.match(/(?:batch|b\.?\s*no|bn|code)\s*[:.-]?\s*([a-zA-Z0-9\s-]+)/i);
    if (match) fields.batchNo = match[0].trim();
  }

  return fields;
}

export class OcrSpaceAdapter implements IOCRAdapter {
  private apiUrl = 'https://api.ocr.space/parse/image';

  async extractText(imageSource: string, simulateFailure = false): Promise<OCRResultData> {
    if (simulateFailure) {
      throw new Error('OCR upstream engine connection timed out');
    }

    const apiKey = process.env.OCR_SPACE_API_KEY || 'K85345497288957';

    const isUrl = /^https?:\/\//i.test(imageSource);
    const isBase64 = /^data:image\//i.test(imageSource);
    let payloadBase64 = isBase64 ? imageSource : '';

    // If local file path or relative path, convert file bytes to Base64
    if (!isUrl && !isBase64) {
      try {
        const fs = require('fs');
        const path = require('path');
        let cleanRel = imageSource.replace(/^[/\\]+/, '');
        let absPath = path.join(process.cwd(), cleanRel);
        if (!fs.existsSync(absPath) && fs.existsSync(imageSource)) {
          absPath = imageSource;
        }
        
        if (fs.existsSync(absPath)) {
          const buf = fs.readFileSync(absPath);
          const ext = path.extname(absPath).toLowerCase().replace('.', '') || 'jpeg';
          const mime = ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg';
          payloadBase64 = `data:image/${mime};base64,` + buf.toString('base64');
        } else {
          console.warn(`[OCR] Image file path not found: ${absPath}`);
        }
      } catch (err: any) {
        console.warn(`[OCR] Failed to load local file bytes for ${imageSource}:`, err.message);
      }
    }

    try {
      const formData = new URLSearchParams();
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('OCREngine', '2');

      if (payloadBase64) {
        formData.append('base64Image', payloadBase64);
      } else if (isUrl) {
        formData.append('url', imageSource);
      } else {
        throw new Error(`Unable to resolve image source: ${imageSource}`);
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
      const blocks: OCRBlock[] = [];

      if (result.TextOverlay && result.TextOverlay.Lines) {
        for (const line of result.TextOverlay.Lines) {
          const lineText = line.LineText ? line.LineText.trim() : '';
          if (lineText) {
            blocks.push({
              text: lineText,
              confidence: 0.90,
              bbox: line.Words && line.Words[0] ? {
                x: line.Words[0].Left || 0,
                y: line.Words[0].Top || 0,
                width: line.Words[0].Width || 0,
                height: line.Words[0].Height || 0,
              } : undefined,
            });
          }
        }
      }

      if (blocks.length === 0 && rawText) {
        const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
        for (const l of lines) {
          blocks.push({ text: l, confidence: 0.88 });
        }
      }

      const overallConfidence = blocks.length > 0
        ? parseFloat((blocks.reduce((acc, b) => acc + b.confidence, 0) / blocks.length).toFixed(2))
        : 0.85;

      const parsedFields = parseLegalMetrologyFields(rawText);

      return {
        rawText,
        overallConfidence,
        blocks,
        providerName: 'OCR.space-Engine-2',
        parsedFields,
      };
    } catch (err: any) {
      console.warn(`[OCR] Real OCR processing error (${err.message}). Returning safe controlled unavailable state.`);
      return {
        rawText: "Automatic OCR is unavailable for this image. Please verify packaging declarations manually.",
        overallConfidence: 0.0,
        blocks: [],
        providerName: 'OCR.space-Engine-2 (Offline)',
        parsedFields: {},
      };
    }
  }
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
    const parsedFields = parseLegalMetrologyFields(rawText);

    return {
      rawText,
      overallConfidence,
      blocks,
      providerName: 'Mock-Tesseract-v5',
      parsedFields,
    };
  }
}
