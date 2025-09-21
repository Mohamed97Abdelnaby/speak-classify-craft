import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileAudio, 
  X, 
  PlayCircle,
  Mic,
  FolderOpen,
  Settings
} from "lucide-react";
import { BatchFile } from "@/types/batch";

const BatchUploader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock categories from CategoryManager
  const categories = [
    "Business Meeting",
    "Personal Note", 
    "Interview",
    "Lecture",
    "Phone Call",
    "Brainstorming",
    "Project Discussion"
  ];

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const audioFiles = Array.from(selectedFiles).filter(file => 
      file.type.startsWith('audio/') || 
      ['mp3', 'wav', 'm4a', 'ogg'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were skipped. Only audio files are supported.",
        variant: "destructive"
      });
    }

    const newFiles: BatchFile[] = audioFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      status: 'uploading' as const,
      category: bulkCategory || undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [bulkCategory, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileCategory = (fileId: string, category: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, category } : f
    ));
  };

  const applyBulkCategory = () => {
    if (!bulkCategory) return;
    setFiles(prev => prev.map(f => ({ ...f, category: bulkCategory })));
    toast({
      title: "Category Applied",
      description: `Applied "${bulkCategory}" to all ${files.length} files.`
    });
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Create batch and navigate after "upload"
    setTimeout(() => {
      const batchId = Math.random().toString(36).substr(2, 9);
      // Store batch data in localStorage for demo
      localStorage.setItem(`batch_${batchId}`, JSON.stringify({
        id: batchId,
        files: files.map(f => ({ ...f, status: 'transcribing' })),
        createdAt: new Date(),
        status: 'processing'
      }));
      
      navigate(`/batch-processing/${batchId}`);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-primary-foreground animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Uploading Files</h2>
            <p className="text-muted-foreground mb-6">Uploading {files.length} files to process...</p>
            <div className="w-full max-w-md">
              <Progress value={uploadProgress} className="mb-4" />
              <p className="text-center text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <span>Batch Audio Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drag and Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center transition-all cursor-pointer group"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Drop files here or click to browse</h3>
                <p className="text-muted-foreground">Support for MP3, WAV, M4A, and other audio formats</p>
              </div>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept="audio/*,.mp3,.wav,.m4a,.ogg"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Bulk Category Assignment */}
          <div className="flex items-center space-x-4 mt-6">
            <div className="flex-1">
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign category to all files" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={applyBulkCategory}
              disabled={!bulkCategory || files.length === 0}
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Apply to All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files Ready for Upload ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-card-hover transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileAudio className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file.size)} • 
                        {file.category ? (
                          <Badge variant="secondary" className="ml-2">{file.category}</Badge>
                        ) : (
                          <span className="ml-2 text-warning">No category</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select
                      value={file.category || ""}
                      onValueChange={(value) => updateFileCategory(file.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => removeFile(file.id)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Action */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleUploadAll}
                disabled={files.length === 0 || files.some(f => !f.category)}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload All Files ({files.length})
              </Button>
            </div>
            
            {files.some(f => !f.category) && (
              <p className="text-sm text-warning mt-2 text-right">
                All files must have a category assigned before upload
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchUploader;