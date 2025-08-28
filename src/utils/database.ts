// Local database utility using IndexedDB (no external dependencies)
// This replaces localStorage with a proper database

interface AppData {
  id: string;
  key: string;
  value: any;
  timestamp: number;
  siteId?: string;
}

interface AuthData {
  id: string;
  sessionToken: string;
  firstName: string;
  email: string;
  siteId: string;
  exp: number;
  timestamp: number;
}

class LocalDatabase {
  private dbName = 'ConsentbitDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // App data store (replaces localStorage)
        if (!db.objectStoreNames.contains('appData')) {
          const appStore = db.createObjectStore('appData', { keyPath: 'id' });
          appStore.createIndex('key', 'key', { unique: false });
          appStore.createIndex('siteId', 'siteId', { unique: false });
        }

        // Authentication data store
        if (!db.objectStoreNames.contains('authData')) {
          const authStore = db.createObjectStore('authData', { keyPath: 'id' });
          authStore.createIndex('siteId', 'siteId', { unique: false });
        }

        // Temporary session data
        if (!db.objectStoreNames.contains('sessionData')) {
          const sessionStore = db.createObjectStore('sessionData', { keyPath: 'id' });
        }
      };
    });
  }

  // Clear all data (replacement for localStorage.clear())
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['appData', 'authData', 'sessionData'], 'readwrite');
    
    await Promise.all([
      this.clearStore(transaction.objectStore('appData')),
      this.clearStore(transaction.objectStore('authData')),
      this.clearStore(transaction.objectStore('sessionData'))
    ]);

    console.log('All database data cleared');
  }

  private clearStore(store: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Set data (replacement for localStorage.setItem())
  async setItem(key: string, value: any, siteId?: string): Promise<void> {
    if (!this.db) await this.init();

    const data: AppData = {
      id: `${siteId || 'default'}_${key}`,
      key,
      value,
      timestamp: Date.now(),
      siteId
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const request = transaction.objectStore('appData').put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get data (replacement for localStorage.getItem())
  async getItem(key: string, siteId?: string): Promise<any> {
    if (!this.db) await this.init();

    const id = `${siteId || 'default'}_${key}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readonly');
      const request = transaction.objectStore('appData').get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Remove data (replacement for localStorage.removeItem())
  async removeItem(key: string, siteId?: string): Promise<void> {
    if (!this.db) await this.init();

    const id = `${siteId || 'default'}_${key}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const request = transaction.objectStore('appData').delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Store authentication data
  async setAuthData(authData: Omit<AuthData, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) await this.init();

    const data: AuthData = {
      ...authData,
      id: `auth_${authData.siteId}`,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['authData'], 'readwrite');
      const request = transaction.objectStore('authData').put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get authentication data
  async getAuthData(siteId: string): Promise<AuthData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['authData'], 'readonly');
      const request = transaction.objectStore('authData').get(`auth_${siteId}`);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all stored keys (for debugging)
  async getAllKeys(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readonly');
      const request = transaction.objectStore('appData').getAllKeys();
      
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  // Get database size estimation
  async getDatabaseSize(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }
}

// Create singleton instance
export const localDB = new LocalDatabase();

// Initialize on import
localDB.init().catch(console.error);

export default localDB;
