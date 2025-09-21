// Utility functions to serialize and deserialize File objects for localStorage

export interface SerializedFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string; // Base64 encoded file data
}

export interface SerializedBatchFile {
  id: string;
  name: string;
  serializedFile: SerializedFile;
  category?: string;
  status: 'uploading' | 'transcribing' | 'summarizing' | 'ready_for_review' | 'classifying' | 'completed';
  transcription?: string;
  summary?: string;
  classification?: {
    predicted: string;
    confidence: number;
    verified?: string;
  };
}

export interface SerializedBatchData {
  id: string;
  files: SerializedBatchFile[];
  createdAt: string; // ISO string instead of Date
  status: 'processing' | 'reviewing' | 'completed';
}

/**
 * Converts a File object to a serialized format that can be stored in localStorage
 */
export const fileToSerialized = async (file: File): Promise<SerializedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
      const data = base64.split(',')[1];
      
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data
      });
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to serialize file: ${file.name}`));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a serialized file back to a File object
 */
export const serializedToFile = (serialized: SerializedFile): File => {
  console.log('Deserializing file:', serialized.name, 'Type:', serialized.type, 'Size:', serialized.size);
  
  // Convert base64 back to binary data
  const binaryString = atob(serialized.data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create a new File object
  const file = new File([bytes], serialized.name, {
    type: serialized.type,
    lastModified: serialized.lastModified
  });
  
  console.log('File reconstructed:', {
    name: file.name,
    size: file.size,
    type: file.type,
    constructor: file.constructor.name,
    isValidFile: file instanceof File
  });
  
  return file;
};

/**
 * Converts a BatchFile array to serialized format for localStorage storage
 */
export const serializeBatchFiles = async (files: import('@/types/batch').BatchFile[]): Promise<SerializedBatchFile[]> => {
  const serializedFiles: SerializedBatchFile[] = [];
  
  for (const file of files) {
    try {
      const serializedFile = await fileToSerialized(file.file);
      serializedFiles.push({
        id: file.id,
        name: file.name,
        serializedFile,
        category: file.category,
        status: file.status,
        transcription: file.transcription,
        summary: file.summary,
        classification: file.classification
      });
    } catch (error) {
      console.error(`Failed to serialize file ${file.name}:`, error);
      // Skip this file rather than failing the entire batch
    }
  }
  
  return serializedFiles;
};

/**
 * Converts serialized batch files back to BatchFile array
 */
export const deserializeBatchFiles = (serializedFiles: SerializedBatchFile[]): import('@/types/batch').BatchFile[] => {
  return serializedFiles.map(serializedFile => ({
    id: serializedFile.id,
    name: serializedFile.name,
    file: serializedToFile(serializedFile.serializedFile),
    category: serializedFile.category,
    status: serializedFile.status,
    transcription: serializedFile.transcription,
    summary: serializedFile.summary,
    classification: serializedFile.classification
  }));
};

/**
 * Converts BatchData to serialized format for localStorage
 */
export const serializeBatchData = async (batchData: import('@/types/batch').BatchData): Promise<SerializedBatchData> => {
  const serializedFiles = await serializeBatchFiles(batchData.files);
  
  return {
    id: batchData.id,
    files: serializedFiles,
    createdAt: batchData.createdAt.toISOString(),
    status: batchData.status
  };
};

/**
 * Converts serialized batch data back to BatchData
 */
export const deserializeBatchData = (serializedData: SerializedBatchData): import('@/types/batch').BatchData => {
  return {
    id: serializedData.id,
    files: deserializeBatchFiles(serializedData.files),
    createdAt: new Date(serializedData.createdAt),
    status: serializedData.status
  };
};