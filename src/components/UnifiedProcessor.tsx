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
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('audio/'));
    const invalidFiles = files.length - validFiles.length;
    
    if (invalidFiles > 0) {
      toast({
        title: t("error"),
        description: `${invalidFiles} ملف غير صوتي تم تجاهله.`,
        variant: "destructive",
      });
    }
    
    const newBatchFiles: BatchFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      file,
      status: 'uploading',
      category: selectedCategory || undefined
    }));
    
    setUploadedFiles(prev => [...prev, ...newBatchFiles]);
    setAudioBlob(null);
    
    if (validFiles.length > 0) {
      toast({
        title: t("success"),
        description: `تم إضافة ${validFiles.length} ملف صوتي بنجاح`,
      });
    }
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
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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

        // Save text classification to database
        try {
          await saveTranscriptionResult({
            file_name: textFile.name,
            file_size: textFile.file.size,
            transcription_text: text,
            summary: summary,
            ai_classification: classifyResponse.data.classification,
            ai_confidence: 1,
            batch_id: batchId,
            file_id: textFile.id
          });
        } catch (dbError) {
          console.error('Failed to save text classification to database:', dbError);
        }
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
        navigate(`/email-option?batch=${batchId}`);
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
              {t("supportedFormats")}
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
            accept="audio/*"
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
            <label className="text-sm font-medium text-foreground">
              {t("conversationText")}
            </label>
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