import { BatchData } from '@/types/batch';
import { SerializedBatchFile } from '@/utils/fileSerializer';

export interface SerializedBatchData {
  id: string;
  files: SerializedBatchFile[];
  createdAt: string; // ISO string
  status: 'processing' | 'reviewing' | 'completed';
}

const DB_NAME = 'AudioTranscriptionDB';
const DB_VERSION = 1;
const STORE_NAME = 'batches';

interface DBBatch {
  id: string;
  data: SerializedBatchData;
  timestamp: number;
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeBatch(batchId: string, batchData: SerializedBatchData): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const dbBatch: DBBatch = {
        id: batchId,
        data: batchData,
        timestamp: Date.now()
      };

      const request = store.put(dbBatch);

      request.onsuccess = () => {
        console.log(`Batch ${batchId} stored successfully in IndexedDB`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Failed to store batch ${batchId}:`, request.error);
        reject(request.error);
      };
    });
  }

  async getBatch(batchId: string): Promise<SerializedBatchData | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(batchId);

      request.onsuccess = () => {
        const result = request.result as DBBatch | undefined;
        resolve(result ? result.data : null);
      };

      request.onerror = () => {
        console.error(`Failed to get batch ${batchId}:`, request.error);
        reject(request.error);
      };
    });
  }

  async deleteBatch(batchId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(batchId);

      request.onsuccess = () => {
        console.log(`Batch ${batchId} deleted from IndexedDB`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Failed to delete batch ${batchId}:`, request.error);
        reject(request.error);
      };
    });
  }

  async getAllBatches(): Promise<DBBatch[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as DBBatch[]);
      };

      request.onerror = () => {
        console.error('Failed to get all batches:', request.error);
        reject(request.error);
      };
    });
  }

  async clearOldBatches(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;
    const batches = await this.getAllBatches();
    
    for (const batch of batches) {
      if (batch.timestamp < cutoffTime) {
        await this.deleteBatch(batch.id);
      }
    }
  }
}

// Create singleton instance
export const indexedDbStorage = new IndexedDBStorage();

// Fallback to localStorage for compatibility
export const setBatchData = async (batchId: string, batchData: SerializedBatchData): Promise<void> => {
  try {
    // Try IndexedDB first
    await indexedDbStorage.storeBatch(batchId, batchData);
  } catch (error) {
    console.warn('IndexedDB failed, falling back to localStorage:', error);
    // Fallback to localStorage (will likely fail for large files, but worth trying)
    try {
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(batchData));
    } catch (localStorageError) {
      console.error('Both IndexedDB and localStorage failed:', localStorageError);
      throw new Error('Unable to store batch data: storage quota exceeded');
    }
  }
};

export const getBatchData = async (batchId: string): Promise<SerializedBatchData | null> => {
  try {
    // Try IndexedDB first
    const data = await indexedDbStorage.getBatch(batchId);
    if (data) return data;
  } catch (error) {
    console.warn('IndexedDB failed, trying localStorage:', error);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(`batch-${batchId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to retrieve from localStorage:', error);
    return null;
  }
};

export const deleteBatchData = async (batchId: string): Promise<void> => {
  try {
    await indexedDbStorage.deleteBatch(batchId);
  } catch (error) {
    console.warn('IndexedDB delete failed:', error);
  }

  // Also remove from localStorage if exists
  try {
    localStorage.removeItem(`batch-${batchId}`);
  } catch (error) {
    console.warn('localStorage delete failed:', error);
  }
};