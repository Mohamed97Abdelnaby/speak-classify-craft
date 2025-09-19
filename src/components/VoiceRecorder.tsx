import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const VoiceRecorder = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

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
        setUploadedFile(null);
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
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
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
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file);
        setAudioBlob(null);
        toast({
          title: "File Uploaded",
          description: `Successfully uploaded ${file.name}`,
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload an audio file.",
          variant: "destructive",
        });
      }
    }
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
    setUploadedFile(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleTranscribe = () => {
    navigate("/processing");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentAudioSource = audioBlob 
    ? URL.createObjectURL(audioBlob) 
    : uploadedFile 
      ? URL.createObjectURL(uploadedFile) 
      : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-primary" />
          <span>Voice Input</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-4 rounded-xl shadow-glow"
              >
                <Mic className="w-6 h-6 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="px-8 py-4 rounded-xl"
              >
                <Square className="w-6 h-6 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono text-destructive">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-muted-foreground">Recording...</div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
            className="px-8 py-4 rounded-xl border-dashed border-2 hover:bg-card-hover"
          >
            <Upload className="w-6 h-6 mr-2" />
            Upload Audio File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Audio Preview */}
        {(audioBlob || uploadedFile) && (
          <Card className="bg-accent border-accent-foreground/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={playPauseAudio}
                    size="sm"
                    variant="secondary"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div>
                    <p className="text-sm font-medium">
                      {uploadedFile ? uploadedFile.name : "Recorded Audio"}
                    </p>
                    <p className="text-xs text-muted-foreground">Ready to transcribe</p>
                  </div>
                </div>
                <Button
                  onClick={clearAudio}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {currentAudioSource && (
                <audio
                  ref={audioRef}
                  src={currentAudioSource}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Transcribe Button */}
        {(audioBlob || uploadedFile) && (
          <Button
            onClick={handleTranscribe}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground py-3 rounded-xl shadow-md"
            size="lg"
          >
            Transcribe & Classify
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;