import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause,
  Trash2,
  X,
  FileAudio,
  MessageSquare,
  Loader2,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BatchFile, BatchData } from "@/types/batch";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { serializeBatchData } from "@/utils/fileSerializer";
import { setBatchData } from "@/utils/indexedDbStorage";
import { saveTranscriptionResult } from "@/services/transcriptionStorageService";
import { getUserCategories } from "@/utils/categoryStorage";

interface UnifiedProcessorProps {
  categories?: string[];
}

const UnifiedProcessor = ({ categories = [] }: UnifiedProcessorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<BatchFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Text input states
  const [text, setText] = useState("");
  const [uploadedTextFiles, setUploadedTextFiles] = useState<{id: string, name: string, size: number, status: 'loading' | 'loaded' | 'error'}[]>([]);
  const [isLoadingTextFiles, setIsLoadingTextFiles] = useState(false);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textFileInputRef = useRef<HTMLInputElement | null>(null);

  // Get all available categories (user categories + default ones)
  const defaultCategories = [
    t("businessMeeting"),
    t("interview"), 
    t("lecture"),
    t("phoneCall"),
    t("personalNote"),
    t("brainstorming"),
    t("projectDiscussion")
  ];
  
  const userCategories = getUserCategories();
  const allCategories = [...new Set([...defaultCategories, ...userCategories, ...categories])];

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        
        const recordedFile: BatchFile = {
          id: `recorded-${Date.now()}`,
          name: `Recording ${new Date().toLocaleTimeString()}`,
          file: new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' }),
          status: 'uploading',
          category: selectedCategory || undefined
        };
        
        setUploadedFiles(prev => [...prev, recordedFile]);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.current.addEventListener('stop', () => {
        clearInterval(timer);
      });

    } catch (error) {
      toast({
        title: t("error"),
        description: t("microphoneError"),
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // File upload functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const handleTextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const textFiles = files.filter(file => isTextFile(file));
    const docxFiles = files.filter(file => isDocxFile(file));
    
    if (textFiles.length > 0) {
      addTextFiles(textFiles);
    }
    
    if (docxFiles.length > 0) {
      addDocxFiles(docxFiles);
    }
    
    // Clear the input value to allow re-uploading the same file
    if (textFileInputRef.current) {
      textFileInputRef.current.value = '';
    }
  };

  const addFiles = (files: File[]) => {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    const textFiles = files.filter(file => isTextFile(file));
    const docxFiles = files.filter(file => isDocxFile(file));
    const validFiles = [...audioFiles, ...textFiles, ...docxFiles];
    const invalidFiles = files.length - validFiles.length;
    
    if (invalidFiles > 0) {
      toast({
        title: t("error"),
        description: `${invalidFiles} ملف غير مدعوم تم تجاهله.`,
        variant: "destructive",
      });
    }
    
    // Handle text files separately
    if (textFiles.length > 0) {
      addTextFiles(textFiles);
    }
    
    // Handle .docx files separately
    if (docxFiles.length > 0) {
      addDocxFiles(docxFiles);
    }
    
    // Handle audio files as before
    const newBatchFiles: BatchFile[] = audioFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      file,
      status: 'uploading',
      category: selectedCategory || undefined
    }));
    
    setUploadedFiles(prev => [...prev, ...newBatchFiles]);
    setAudioBlob(null);
    
    if (audioFiles.length > 0) {
      toast({
        title: t("success"),
        description: `تم إضافة ${audioFiles.length} ملف صوتي بنجاح`,
      });
    }
  };

  const isTextFile = (file: File) => {
    const textExtensions = [
      '.txt', '.md', '.rtf', '.csv', '.json', '.xml', '.yml', '.yaml', 
      '.log', '.ini', '.cfg', '.conf', '.sql', '.py', '.js', '.html', 
      '.css', '.scss', '.ts', '.tsx', '.jsx', '.vue', '.php', '.rb', 
      '.go', '.rs', '.java', '.cpp', '.c', '.h', '.sh', '.bat', '.ps1'
    ];
    
    const fileName = file.name.toLowerCase();
    return file.type.startsWith('text/') || 
           file.type === 'application/json' ||
           file.type === 'application/xml' ||
           textExtensions.some(ext => fileName.endsWith(ext));
  };

  const isDocxFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           fileName.endsWith('.docx');
  };

  const addTextFiles = async (files: File[]) => {
    const validTextFiles = files.filter(file => isTextFile(file));
    
    if (validTextFiles.length === 0) {
      toast({
        title: t("error"),
        description: "لم يتم العثور على ملفات نصية صالحة",
        variant: "destructive",
      });
      return;
    }

    // Check file sizes (limit to 5MB per file)
    const oversizedFiles = validTextFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: t("error"),
        description: `${oversizedFiles.length} ملف كبير جداً (أكثر من 5 ميجابايت) تم تجاهله`,
        variant: "destructive",
      });
    }

    const validFiles = validTextFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    setIsLoadingTextFiles(true);
    
    // Add files to tracking state
    const fileEntries = validFiles.map(file => ({
      id: `text-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      status: 'loading' as const
    }));
    
    setUploadedTextFiles(prev => [...prev, ...fileEntries]);

    // Process files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const entry = fileEntries[i];
      
      try {
        const content = await readFileAsText(file);
        
        // Update file status
        setUploadedTextFiles(prev => prev.map(f => 
          f.id === entry.id ? { ...f, status: 'loaded' } : f
        ));
        
        // Add content to text area with file header
        setText(prev => {
          const separator = prev ? '\n\n' : '';
          const header = `--- ${file.name} ---\n`;
          return prev + separator + header + content;
        });
        
      } catch (error) {
        console.error(`Failed to read file ${file.name}:`, error);
        setUploadedTextFiles(prev => prev.map(f => 
          f.id === entry.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    setIsLoadingTextFiles(false);
    
    const successCount = validFiles.length;
    toast({
      title: t("success"),
      description: `تم تحميل ${successCount} ملف نصي بنجاح`,
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const addDocxFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Check file sizes (limit to 20MB per file for documents)
    const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: t("error"),
        description: `${oversizedFiles.length} ملف كبير جداً (أكثر من 20 ميجابايت) تم تجاهله`,
        variant: "destructive",
      });
    }

    const validFiles = files.filter(file => file.size <= 20 * 1024 * 1024);
    
    setIsLoadingTextFiles(true);
    
    // Add files to tracking state
    const fileEntries = validFiles.map(file => ({
      id: `docx-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      status: 'loading' as const
    }));
    
    setUploadedTextFiles(prev => [...prev, ...fileEntries]);

    // Process files - for now, show as loaded but inform user about manual processing
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const entry = fileEntries[i];
      
      try {
        // Update file status to loaded
        setUploadedTextFiles(prev => prev.map(f => 
          f.id === entry.id ? { ...f, status: 'loaded' } : f
        ));
        
        // Add placeholder content to text area with file header
        setText(prev => {
          const separator = prev ? '\n\n' : '';
          const header = `--- ${file.name} (DOCX) ---\n`;
          const placeholder = `[تم رفع ملف DOCX: ${file.name}]\n[يرجى نسخ ولصق المحتوى من الملف هنا يدوياً]\n`;
          return prev + separator + header + placeholder;
        });
        
      } catch (error) {
        console.error(`Failed to process DOCX file ${file.name}:`, error);
        setUploadedTextFiles(prev => prev.map(f => 
          f.id === entry.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    setIsLoadingTextFiles(false);
    
    const successCount = validFiles.length;
    toast({
      title: t("success"),
      description: `تم رفع ${successCount} ملف DOCX بنجاح. يرجى نسخ المحتوى يدوياً إلى منطقة النص`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileCategory = (fileId: string, category: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, category } : f
    ));
  };

  const assignCategoryToAll = () => {
    if (!selectedCategory) return;
    setUploadedFiles(prev => prev.map(f => ({ ...f, category: selectedCategory })));
    toast({
      title: t("success"),
      description: `تم تعيين جميع الملفات لفئة "${selectedCategory}"`,
    });
  };

  const clearAll = () => {
    setAudioBlob(null);
    setUploadedFiles([]);
    setText("");
    setUploadedTextFiles([]);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const removeTextFile = (fileId: string) => {
    setUploadedTextFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Unified processing function
  const handleProcess = async () => {
    const hasAudio = uploadedFiles.length > 0 || audioBlob;
    const hasText = text.trim().length > 0;
    
    if (!hasAudio && !hasText) {
      toast({
        title: t("error"),
        description: "يرجى إدخال نص أو رفع ملفات صوتية للمعالجة",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const batchId = `batch-unified-${Date.now()}`;
      const batchFiles: BatchFile[] = [];

      // Process text input if available
      if (hasText) {
        console.log('Processing text input...');
        
        // Summarize text
        const summaryResponse = await supabase.functions.invoke('summarize-conversation', {
          body: { transcription: text }
        });

        let summary = '';
        if (summaryResponse.error) {
          console.error('Summarization error:', summaryResponse.error);
          summary = text;
        } else {
          summary = summaryResponse.data.summary;
        }
        
        // Classify text
        const classifyResponse = await supabase.functions.invoke('classify-conversation', {
          body: { transcription: text }
        });

        if (classifyResponse.error) {
          throw new Error(classifyResponse.error.message);
        }

        if (!classifyResponse.data.success) {
          throw new Error(classifyResponse.data.error || 'Classification failed');
        }

        // Create text batch file
        const textFile: BatchFile = {
          id: `text-${Date.now()}`,
          name: `${t('textConversationFilename')}-${new Date().toISOString().split('T')[0]}.txt`,
          file: new File([text], `${t('conversationFile')}-${Date.now()}.txt`, { type: 'text/plain' }),
          status: 'completed',
          transcription: text,
          summary: summary,
          classification: {
            predicted: classifyResponse.data.classification,
            confidence: 1,
            aiClassification: classifyResponse.data.classification,
            classificationTimestamp: classifyResponse.data.timestamp
          }
        };

        batchFiles.push(textFile);

        // Data will only be saved to database if user is unsatisfied with results
      }

      // Process audio files if available
      if (hasAudio) {
        console.log('Processing audio files...');
        batchFiles.push(...uploadedFiles.map(f => ({ ...f, status: 'transcribing' as const })));
      }

      // Create batch data
      const batchData: BatchData = {
        id: batchId,
        files: batchFiles,
        createdAt: new Date(),
        status: hasAudio ? 'processing' : 'completed'
      };

      // Store batch data
      const serializedBatchData = await serializeBatchData(batchData);
      await setBatchData(batchId, serializedBatchData);

      toast({
        title: t("success"),
        description: "تم بدء معالجة جميع المدخلات بنجاح",
      });

      // Navigate based on whether there are audio files to process
      if (hasAudio) {
        navigate(`/processing?batch=${batchId}`);
      } else {
        // For text-only input, go to review page like audio does
        navigate(`/review?batch=${batchId}`);
      }

    } catch (error) {
      console.error('Unified processing error:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : "حدث خطأ أثناء المعالجة",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentAudioSource = audioBlob 
    ? URL.createObjectURL(audioBlob) 
    : uploadedFiles.length === 1 
      ? URL.createObjectURL(uploadedFiles[0].file) 
      : null;

  const hasAnyInput = uploadedFiles.length > 0 || audioBlob || text.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Audio Input Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Mic className="w-5 h-5 text-primary" />
            <span>{t("audioInput")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4 space-x-reverse">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-4 rounded-xl shadow-glow"
                >
                  <Mic className="w-6 h-6 ml-2" />
                  {t("startRecording")}
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="px-8 py-4 rounded-xl"
                >
                  <Square className="w-6 h-6 ml-2" />
                  {t("stopRecording")}
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="text-2xl font-mono text-destructive">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-muted-foreground">{t("recording")}...</div>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          {/* Drag and Drop Upload */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">{t("dragDropFiles")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("supportedFormats")} + DOCX
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              {t("uploadFiles")}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            className="hidden"
          />



          {/* Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                الملفات المرفوعة ({uploadedFiles.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-card-hover transition-colors"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                      <FileAudio className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        {file.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {file.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                  
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Preview */}
          {currentAudioSource && (
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">معاينة الصوت</h3>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button
                  onClick={playPauseAudio}
                  variant="outline"
                  size="sm"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <audio
                  ref={audioRef}
                  src={currentAudioSource}
                  onEnded={() => setIsPlaying(false)}
                  className="flex-1"
                  controls
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Input Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {t("textInput")}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {t("conversationText")}
              </label>
              <Button
                onClick={() => textFileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoadingTextFiles}
              >
                {isLoadingTextFiles ? (
                  <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 ml-1" />
                )}
                رفع ملفات نصية
              </Button>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("conversationPlaceholder")}
              className="min-h-[200px] resize-none"
              dir="rtl"
            />
            <div className="flex justify-start text-xs text-muted-foreground">
              <span>{text.length} {t("characters")}</span>
            </div>
          </div>

          {/* Uploaded Text Files List */}
          {uploadedTextFiles.length > 0 && (
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-foreground">
                الملفات النصية المرفوعة ({uploadedTextFiles.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadedTextFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border border-border/50 rounded bg-background"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse flex-1 min-w-0">
                      <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {file.status === 'loading' && (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      )}
                      {file.status === 'loaded' && (
                        <Badge variant="secondary" className="text-xs">محمل</Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="destructive" className="text-xs">خطأ</Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => removeTextFile(file.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={textFileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.rtf,.csv,.json,.xml,.yml,.yaml,.log,.ini,.cfg,.conf,.sql,.py,.js,.html,.css,.scss,.ts,.tsx,.jsx,.vue,.php,.rb,.go,.rs,.java,.cpp,.c,.h,.sh,.bat,.ps1,.docx,text/*,application/json,application/xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleTextFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Unified Process Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleProcess}
          disabled={!hasAnyInput || isProcessing}
          size="lg"
          className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground py-4 text-lg font-medium rounded-xl shadow-glow"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 ml-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 ml-2" />
              معالجة جميع المدخلات
            </>
          )}
        </Button>
        
        <Button
          onClick={clearAll}
          variant="outline"
          size="lg"
          disabled={!hasAnyInput || isProcessing}
          className="px-6"
        >
          <Trash2 className="w-5 h-5 ml-2" />
          {t("clearAll")}
        </Button>
      </div>
    </div>
  );
};

export default UnifiedProcessor;