import crypto from 'crypto';

export interface IStorageAdapter {
  uploadFile(fileKey: string, buffer: Buffer, mimeType: string): Promise<{ fileKey: string; sizeBytes: number; checksum: string }>;
  getSignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(fileKey: string): Promise<boolean>;
}

export class LocalStorageAdapter implements IStorageAdapter {
  private files: Map<string, { buffer: Buffer; mimeType: string }> = new Map();

  async uploadFile(fileKey: string, buffer: Buffer, mimeType: string) {
    this.files.set(fileKey, { buffer, mimeType });
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    return {
      fileKey,
      sizeBytes: buffer.length,
      checksum,
    };
  }

  async getSignedUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = crypto.createHash('md5').update(`${fileKey}:${expires}:secret`).digest('hex');
    return `https://s3.ap-south-1.amazonaws.com/legal-metrology-evidence/${fileKey}?expires=${expires}&token=${token}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return this.files.delete(fileKey);
  }
}
