import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  FileAudio, 
  ArrowRight, 
  CheckCircle, 
  Edit3,
  Save,
  X,
  AlertCircle
} from "lucide-react";
import { Batch, BatchFile } from "@/types/batch";

const BatchReview = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const { toast } = useToast();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [approvedFiles, setApprovedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!batchId) return;

    const batchData = localStorage.getItem(`batch_${batchId}`);
    if (batchData) {
      setBatch(JSON.parse(batchData));
    }
  }, [batchId]);

  const startEditingSummary = (fileId: string, currentSummary: string) => {
    setEditingSummary(fileId);
    setEditedText(currentSummary);
  };

  const saveSummaryEdit = (fileId: string) => {
    if (!batch) return;

    setBatch(prevBatch => {
      if (!prevBatch) return null;
      
      const updatedFiles = prevBatch.files.map(file =>
        file.id === fileId ? { ...file, summary: editedText } : file
      );
      
      const updated = { ...prevBatch, files: updatedFiles };
      localStorage.setItem(`batch_${batchId}`, JSON.stringify(updated));
      return updated;
    });

    setEditingSummary(null);
    setEditedText("");
    
    toast({
      title: "Summary Updated",
      description: "The summary has been successfully updated."
    });
  };

  const cancelEdit = () => {
    setEditingSummary(null);
    setEditedText("");
  };

  const approveSummary = (fileId: string) => {
    setApprovedFiles(prev => new Set([...prev, fileId]));
    toast({
      title: "Summary Approved",
      description: "Summary has been approved and is ready for classification."
    });
  };

  const startClassification = (fileId: string) => {
    if (!batch) return;

    // Update file status to classifying
    setBatch(prevBatch => {
      if (!prevBatch) return null;
      
      const updatedFiles = prevBatch.files.map(file =>
        file.id === fileId ? { ...file, status: 'classifying' as const } : file
      );
      
      const updated = { ...prevBatch, files: updatedFiles };
      localStorage.setItem(`batch_${batchId}`, JSON.stringify(updated));
      return updated;
    });

    // Simulate classification process
    setTimeout(() => {
      setBatch(prevBatch => {
        if (!prevBatch) return null;
        
        const updatedFiles = prevBatch.files.map(file =>
          file.id === fileId ? {
            ...file,
            status: 'completed' as const,
            classification: {
              predicted: file.category || 'Business Meeting',
              confidence: Math.floor(Math.random() * 30) + 70,
              alternatives: [
                { category: 'Project Discussion', confidence: Math.floor(Math.random() * 20) + 60 },
                { category: 'Brainstorming', confidence: Math.floor(Math.random() * 20) + 50 }
              ]
            }
          } : file
        );
        
        const updated = { ...prevBatch, files: updatedFiles };
        localStorage.setItem(`batch_${batchId}`, JSON.stringify(updated));
        return updated;
      });
    }, 3000);

    toast({
      title: "Classification Started",
      description: "AI classification is now processing this file..."
    });
  };

  const proceedToResults = () => {
    if (batch) {
      navigate(`/batch-results/${batch.id}`);
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

  const readyFiles = batch.files.filter(f => f.status === 'ready_for_review');
  const classifyingFiles = batch.files.filter(f => f.status === 'classifying');
  const completedFiles = batch.files.filter(f => f.status === 'completed');
  const canProceed = completedFiles.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Review & Approve Summaries</h1>
            <p className="text-muted-foreground">
              Review the AI-generated summaries before starting classification
            </p>
          </div>
          
          {canProceed && (
            <Button 
              onClick={proceedToResults}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              View Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready for Review</p>
                  <p className="text-2xl font-bold text-foreground">{readyFiles.length}</p>
                </div>
                <Edit3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classifying</p>
                  <p className="text-2xl font-bold text-warning">{classifyingFiles.length}</p>
                </div>
                <div className="w-8 h-8 border-2 border-warning border-t-transparent rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{completedFiles.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files for Review */}
        <div className="space-y-6">
          {batch.files.map(file => (
            <Card key={file.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <FileAudio className="w-5 h-5 text-primary" />
                    <span>{file.name}</span>
                    <Badge variant="outline">{file.category}</Badge>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'ready_for_review' && (
                      <>
                        {approvedFiles.has(file.id) ? (
                          <Button
                            onClick={() => startClassification(file.id)}
                            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                          >
                            Start Classification
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => approveSummary(file.id)}
                            variant="outline"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Summary
                          </Button>
                        )}
                      </>
                    )}
                    
                    {file.status === 'classifying' && (
                      <Badge className="bg-warning text-warning-foreground">
                        <div className="w-3 h-3 border border-warning-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Classifying...
                      </Badge>
                    )}
                    
                    {file.status === 'completed' && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {file.summary && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">AI Generated Summary</h4>
                        {file.status === 'ready_for_review' && !approvedFiles.has(file.id) && (
                          <Button
                            onClick={() => startEditingSummary(file.id, file.summary!)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {editingSummary === file.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="min-h-32"
                            placeholder="Edit the summary..."
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={cancelEdit}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              onClick={() => saveSummaryEdit(file.id)}
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-md border ${
                          approvedFiles.has(file.id) 
                            ? 'border-success bg-success/5' 
                            : 'border-border bg-muted/50'
                        }`}>
                          <p className="text-foreground leading-relaxed">{file.summary}</p>
                          {approvedFiles.has(file.id) && (
                            <div className="flex items-center mt-3 text-success">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Summary Approved</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BatchReview;