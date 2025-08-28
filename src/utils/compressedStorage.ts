// Compressed localStorage - no external dependencies, 0KB bundle impact
// Uses native browser compression APIs

class CompressedStorage {
  
  // Compress and store data
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      
      // Use native compression if available (modern browsers)
      if ('CompressionStream' in window) {
        const compressed = await this.compress(jsonString);
        localStorage.setItem(key, compressed);
      } else {
        // Fallback: simple string compression
        const compressed = this.simpleCompress(jsonString);
        localStorage.setItem(key, compressed);
      }
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Decompress and retrieve data
  async getItem(key: string): Promise<any> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      // Try decompression
      if ('DecompressionStream' in window && stored.startsWith('compressed:')) {
        const decompressed = await this.decompress(stored);
        return JSON.parse(decompressed);
      } else if (stored.startsWith('simple:')) {
        const decompressed = this.simpleDecompress(stored);
        return JSON.parse(decompressed);
      } else {
        // Fallback: parse as-is
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Decompression failed:', error);
      return null;
    }
  }

  // Native browser compression (modern browsers)
  private async compress(text: string): Promise<string> {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(new TextEncoder().encode(text));
    writer.close();
    
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }
    
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    chunks.forEach(chunk => {
      compressed.set(chunk, offset);
      offset += chunk.length;
    });
    
    return 'compressed:' + btoa(String.fromCharCode(...compressed));
  }

  private async decompress(compressedText: string): Promise<string> {
    const data = compressedText.replace('compressed:', '');
    const compressed = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
    
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(compressed);
    writer.close();
    
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }
    
    const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    chunks.forEach(chunk => {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    });
    
    return new TextDecoder().decode(decompressed);
  }

  // Simple compression fallback (for older browsers)
  private simpleCompress(text: string): string {
    // Run-length encoding for repeated characters
    const compressed = text.replace(/(.)\1{2,}/g, (match, char) => {
      return `${char}${match.length}`;
    });
    return 'simple:' + compressed;
  }

  private simpleDecompress(compressedText: string): string {
    const data = compressedText.replace('simple:', '');
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Remove item
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all
  clear(): void {
    localStorage.clear();
  }

  // Get storage size estimate
  getStorageInfo(): { used: number; available: number; keys: number } {
    let used = 0;
    let keys = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        used += key.length + (value?.length || 0);
        keys++;
      }
    }
    
    return {
      used: used * 2, // Approximate bytes (UTF-16)
      available: 5 * 1024 * 1024 - used * 2, // 5MB limit
      keys
    };
  }
}

// Export singleton
export const compressedStorage = new CompressedStorage();
export default compressedStorage;
