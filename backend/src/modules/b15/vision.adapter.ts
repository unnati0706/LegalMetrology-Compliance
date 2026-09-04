export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisionDetectionItem {
  regionType: 'PDP' | 'MRP' | 'NET_QUANTITY' | 'MANUFACTURER_INFO';
  boundingBox: BoundingBox;
  confidence: number;
}

export interface IVisionAdapter {
  detectRegions(imageSource: string, simulateFailure?: boolean): Promise<VisionDetectionItem[]>;
}

export class MockVisionAdapter implements IVisionAdapter {
  async detectRegions(imageSource: string, simulateFailure = false): Promise<VisionDetectionItem[]> {
    if (simulateFailure) {
      throw new Error('Computer Vision object detection model unavailable');
    }

    return [
      {
        regionType: 'PDP',
        boundingBox: { x: 10, y: 10, width: 600, height: 800 },
        confidence: 0.96,
      },
      {
        regionType: 'NET_QUANTITY',
        boundingBox: { x: 50, y: 120, width: 200, height: 30 },
        confidence: 0.94,
      },
      {
        regionType: 'MRP',
        boundingBox: { x: 50, y: 160, width: 250, height: 30 },
        confidence: 0.91,
      },
      {
        regionType: 'MANUFACTURER_INFO',
        boundingBox: { x: 50, y: 240, width: 400, height: 40 },
        confidence: 0.89,
      },
    ];
  }
}
