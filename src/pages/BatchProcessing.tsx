import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileAudio, 
  Clock, 
  CheckCircle, 
  Loader, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Batch, BatchFile } from "@/types/batch";

const BatchProcessing = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!batchId) return;

    // Load batch from localStorage (demo)
    const batchData = localStorage.getItem(`batch_${batchId}`);
    if (batchData) {
      setBatch(JSON.parse(batchData));
    }

    // Simulate processing
    let currentStep = 0;
    const steps = ['transcribing', 'summarizing', 'ready_for_review'] as const;
    
    const processFiles = () => {
      const interval = setInterval(() => {
        setBatch(prevBatch => {
          if (!prevBatch) return null;

          const updatedFiles = prevBatch.files.map(file => {
            if (file.status === 'completed' || file.status === 'ready_for_review') {
              return file;
            }

            // Progress each file through steps
            if (file.status === 'transcribing' && Math.random() > 0.7) {
              return {
                ...file,
                status: 'summarizing' as const,
                transcription: `This is a mock transcription for ${file.name}. The audio contains discussion about ${file.category?.toLowerCase() || 'general topics'}.`,
                progress: Math.floor(Math.random() * 40) + 30
              };
            }
            
            if (file.status === 'summarizing' && Math.random() > 0.6) {
              return {
                ...file,
                status: 'ready_for_review' as const,
                summary: `Key points from ${file.name}: Discussion focused on ${file.category?.toLowerCase() || 'various topics'} with actionable insights and important decisions made.`,
                progress: 100
              };
            }

            return {
              ...file,
              progress: Math.min((file.progress || 0) + Math.floor(Math.random() * 15), 95)
            };
          });

          // Update overall progress
          const completedFiles = updatedFiles.filter(f => f.status === 'ready_for_review').length;
          const newProgress = (completedFiles / updatedFiles.length) * 100;
          setOverallProgress(newProgress);

          // Check if all files are ready for review
          if (completedFiles === updatedFiles.length) {
            clearInterval(interval);
            const finalBatch = {
              ...prevBatch,
              files: updatedFiles,
              status: 'reviewing' as const
            };
            localStorage.setItem(`batch_${batchId}`, JSON.stringify(finalBatch));
            return finalBatch;
          }

          const updated = {
            ...prevBatch,
            files: updatedFiles
          };
          localStorage.setItem(`batch_${batchId}`, JSON.stringify(updated));
          return updated;
        });
      }, 2000);

      return interval;
    };

    const interval = processFiles();
    return () => clearInterval(interval);
  }, [batchId]);

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'transcribing':
        return <Loader className="w-4 h-4 animate-spin text-primary" />;
      case 'summarizing':
        return <Loader className="w-4 h-4 animate-spin text-primary" />;
      case 'ready_for_review':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: BatchFile['status']) => {
    const variants = {
      transcribing: { label: 'Transcribing', variant: 'default' as const },
      summarizing: { label: 'Summarizing', variant: 'secondary' as const },
      ready_for_review: { label: 'Ready for Review', variant: 'default' as const },
      uploading: { label: 'Uploading', variant: 'secondary' as const },
      classifying: { label: 'Classifying', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'default' as const }
    };

    const config = variants[status];
    return (
      <Badge 
        variant={config.variant}
        className={status === 'ready_for_review' ? 'bg-success text-success-foreground' : ''}
      >
        {config.label}
      </Badge>
    );
  };

  const handleProceedToReview = () => {
    if (batch) {
      navigate(`/batch-review/${batch.id}`);
    }
  };

  if (!batch) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Batch Not Found</h2>
              <p className="text-muted-foreground">The requested batch could not be found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const readyForReviewCount = batch.files.filter(f => f.status === 'ready_for_review').length;
  const allReady = readyForReviewCount === batch.files.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Processing Batch</h1>
          <p className="text-muted-foreground">
            Processing {batch.files.length} files • {readyForReviewCount} ready for review
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={overallProgress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{readyForReviewCount} of {batch.files.length} files processed</span>
                <span>{Math.round(overallProgress)}% complete</span>
              </div>
              {allReady && (
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleProceedToReview}
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                  >
                    Proceed to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Processing Status */}
        <Card>
          <CardHeader>
            <CardTitle>File Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batch.files.map(file => (
                <div key={file.id} className="border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileAudio className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Category: <Badge variant="outline" className="ml-1">{file.category}</Badge>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      {getStatusBadge(file.status)}
                    </div>
                  </div>
                  
                  {file.status !== 'ready_for_review' && (
                    <Progress value={file.progress || 0} className="h-2" />
                  )}
                  
                  {file.status === 'ready_for_review' && file.summary && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Summary Preview:</p>
                      <p className="text-sm mt-1">{file.summary.substring(0, 120)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BatchProcessing;