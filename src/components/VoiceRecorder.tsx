import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause,
  Trash2,
  X,
  FileAudio
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BatchFile } from "@/types/batch";
import { useTranslation } from "react-i18next";

const VoiceRecorder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<BatchFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  // Categories in Arabic
  const categories = [
    t("businessMeeting"),
    t("interview"), 
    t("lecture"),
    t("phoneCall"),
    t("personalNote"),
    t("brainstorming"),
    t("projectDiscussion")
  ];

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
        
        // Convert recording to BatchFile
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
      
      // Start timer
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

  const clearAudio = () => {
    setAudioBlob(null);
    setUploadedFiles([]);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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

  const handleTranscribe = async () => {
    if (uploadedFiles.length === 0 && !audioBlob) return;
    
    try {
      // Create batch data
      const batchId = `batch-${Date.now()}`;
      const batchData = {
        id: batchId,
        files: uploadedFiles.map(f => ({ ...f, status: 'transcribing' as const })),
        createdAt: new Date(),
        status: 'processing' as const
      };
      
      // Import serialization utilities
      const { serializeBatchData } = await import('@/utils/fileSerializer');
      const { setBatchData } = await import('@/utils/indexedDbStorage');
      
      // Serialize batch data for storage
      const serializedBatchData = await serializeBatchData(batchData);
      
      // Store serialized data using IndexedDB (with localStorage fallback)
      await setBatchData(batchId, serializedBatchData);
      
      // Navigate to email option page
      navigate(`/email-option?batch=${batchId}`);
    } catch (error) {
      console.error('Failed to prepare batch data:', error);
      toast({
        title: t("error"),
        description: "Failed to prepare files for transcription",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentAudioSource = audioBlob 
    ? URL.createObjectURL(audioBlob) 
    : uploadedFiles.length === 1 
      ? URL.createObjectURL(uploadedFiles[0].file) 
      : null;

  return (
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

        {/* Category Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("selectCategory")}</label>
            {selectedCategory && uploadedFiles.length > 1 && (
              <Button
                onClick={assignCategoryToAll}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {t("selectForAll")}
              </Button>
            )}
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              الملفات المرفوعة ({uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
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
                  
                  <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
                    <Select
                      value={file.category || ""}
                      onValueChange={(category) => updateFileCategory(file.id, category)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="فئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-xs">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => removeFile(file.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
              <Button
                onClick={clearAudio}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                {t("clearAll")}
              </Button>
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

        {/* Transcribe Button */}
        <Button
          onClick={handleTranscribe}
          disabled={uploadedFiles.length === 0 && !audioBlob}
          size="lg"
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground py-4 text-lg font-medium rounded-xl shadow-glow"
        >
          <Mic className="w-6 h-6 ml-2" />
          {t("transcribeNow")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;