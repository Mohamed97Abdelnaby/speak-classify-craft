import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BatchFile } from "@/types/batch";

const Processing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stage, setStage] = useState<"transcribing" | "summarizing" | "classifying">("transcribing");
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [progress, setProgress] = useState(0);
  const batchId = searchParams.get('batch');
  const initialStage = searchParams.get('stage') as "classifying" | null;
  
  useEffect(() => {
    // Load batch data
    if (batchId) {
      const batchData = localStorage.getItem(`batch-${batchId}`);
      if (batchData) {
        const batch = JSON.parse(batchData);
        setFiles(batch.files || []);
        
        // Start processing based on initial stage
        if (initialStage === 'classifying') {
          setStage('classifying');
          processClassification(batch.files);
        } else {
          processBatch(batch.files);
        }
      } else {
        navigate("/");
      }
    } else {
      // Single file processing (legacy)
      processAudio();
    }
  }, [navigate, batchId, initialStage]);

  const processBatch = async (batchFiles: BatchFile[]) => {
    // Stage 1: Transcription
    setStage("transcribing");
    await simulateFileProcessing(batchFiles, 'transcribing', 3000);
    
    // Stage 2: Summarizing
    setStage("summarizing");
    await simulateFileProcessing(batchFiles, 'summarizing', 2000);
    
    // Update batch data with summaries
    const updatedFiles = batchFiles.map(file => ({
      ...file,
      status: 'ready_for_review' as const,
      summary: `AI-generated summary for ${file.name}: This is a comprehensive summary of the audio content that highlights key topics, speakers, and important information discussed.`
    }));
    
    const batchData = {
      id: batchId,
      files: updatedFiles,
      status: 'reviewing'
    };
    localStorage.setItem(`batch-${batchId}`, JSON.stringify(batchData));
    
    // Navigate to review page
    navigate(`/review?batch=${batchId}`);
  };

  const processClassification = async (batchFiles: BatchFile[]) => {
    // Classification stage
    setStage("classifying");
    await simulateFileProcessing(batchFiles, 'classifying', 2500);
    
    // Complete processing with mock classifications
    const completedFiles = batchFiles.map(file => ({
      ...file,
      status: 'completed' as const,
      classification: {
        predicted: file.category || 'Meeting',
        confidence: 0.85 + Math.random() * 0.15,
        verified: undefined
      }
    }));
    
    const batchData = {
      id: batchId,
      files: completedFiles,
      status: 'completed'
    };
    localStorage.setItem(`batch-${batchId}`, JSON.stringify(batchData));
    
    // Navigate to results
    navigate(`/results?batch=${batchId}`);
  };

  const simulateFileProcessing = async (batchFiles: BatchFile[], status: BatchFile['status'], duration: number) => {
    const increment = 100 / batchFiles.length;
    
    for (let i = 0; i < batchFiles.length; i++) {
      // Update file status
      const updatedFiles = [...batchFiles];
      updatedFiles[i] = { ...updatedFiles[i], status };
      setFiles(updatedFiles);
      
      // Update progress
      setProgress((i + 1) * increment);
      
      // Wait for processing duration
      await new Promise(resolve => setTimeout(resolve, duration / batchFiles.length));
    }
  };

  // Legacy single file processing
  const processAudio = async () => {
    setStage("transcribing");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStage("classifying");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    navigate("/results");
  };

  const getStageMessage = () => {
    switch (stage) {
      case "transcribing":
        return "Converting speech to text for all audio files...";
      case "summarizing":
        return "Generating AI summaries for each transcription...";
      case "classifying":
        return "Analyzing content and applying classification categories...";
      default:
        return "Processing your audio files...";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Main Loading Spinner */}
          <LoadingSpinner 
            stage={stage}
            message={getStageMessage()}
          />
          
          {/* Batch Progress */}
          {files.length > 0 && (
            <Card className="w-full max-w-md mt-8">
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  Batch Progress ({files.length} files)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="mb-4" />
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={file.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{file.name}</span>
                      <Badge 
                        variant={
                          file.status === 'completed' ? 'default' :
                          file.status === stage ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {file.status === 'ready_for_review' ? 'Ready' : file.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {files.length > 0 
                ? `Processing ${files.length} audio files. This may take a few minutes.`
                : "This usually takes a few seconds depending on the audio length"
              }
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Processing;