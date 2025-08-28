// Ultra-lightweight storage - 0KB bundle impact
// Combines in-memory storage with sessionStorage backup

class MemoryStorage {
  private memoryStore: Map<string, any> = new Map();
  private persistentKeys: Set<string> = new Set(['consentbit-userinfo', 'siteInfo']);

  // Set item in memory and optionally persist
  setItem(key: string, value: any): void {
    // Store in memory
    this.memoryStore.set(key, value);

    // Persist only important keys to sessionStorage
    if (this.persistentKeys.has(key)) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('SessionStorage failed for key:', key);
      }
    }
  }

  // Get item from memory first, fallback to sessionStorage
  getItem(key: string): any {
    // Try memory first
    if (this.memoryStore.has(key)) {
      return this.memoryStore.get(key);
    }

    // Fallback to sessionStorage for persistent keys
    if (this.persistentKeys.has(key)) {
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          const value = JSON.parse(stored);
          this.memoryStore.set(key, value); // Cache in memory
          return value;
        }
      } catch (error) {
        console.warn('SessionStorage parse failed for key:', key);
      }
    }

    return null;
  }

  // Remove item
  removeItem(key: string): void {
    this.memoryStore.delete(key);
    sessionStorage.removeItem(key);
  }

  // Clear all data
  clear(): void {
    this.memoryStore.clear();
    sessionStorage.clear();
  }

  // Get all keys
  getAllKeys(): string[] {
    const memoryKeys = Array.from(this.memoryStore.keys());
    const sessionKeys = Array.from({ length: sessionStorage.length }, (_, i) => 
      sessionStorage.key(i)
    ).filter(key => key !== null) as string[];
    
    return [...new Set([...memoryKeys, ...sessionKeys])];
  }

  // Get storage info
  getStorageInfo(): { memoryKeys: number; sessionKeys: number; totalSize: number } {
    let totalSize = 0;
    
    // Calculate session storage size
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        totalSize += key.length + (value?.length || 0);
      }
    }

    return {
      memoryKeys: this.memoryStore.size,
      sessionKeys: sessionStorage.length,
      totalSize: totalSize * 2 // UTF-16 estimate
    };
  }

  // Add key to persistent list
  addPersistentKey(key: string): void {
    this.persistentKeys.add(key);
  }

  // Remove key from persistent list
  removePersistentKey(key: string): void {
    this.persistentKeys.delete(key);
  }
}

// Export singleton
export const memoryStorage = new MemoryStorage();
export default memoryStorage;
