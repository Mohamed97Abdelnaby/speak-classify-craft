import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Play } from "lucide-react";
import { BatchFile } from "@/types/batch";

const Review = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const batchId = searchParams.get('batch');

  useEffect(() => {
    // Load batch data from localStorage
    const batchData = localStorage.getItem(`batch-${batchId}`);
    if (batchData) {
      const batch = JSON.parse(batchData);
      setFiles(batch.files || []);
    } else {
      // Redirect if no batch data found
      navigate("/");
    }
  }, [batchId, navigate]);

  const handleStartClassification = () => {
    // Update files status to ready for classification
    const updatedFiles = files.map(file => ({
      ...file,
      status: 'classifying' as const
    }));
    
    // Save updated batch data
    const batchData = {
      id: batchId,
      files: updatedFiles,
      status: 'processing'
    };
    localStorage.setItem(`batch-${batchId}`, JSON.stringify(batchData));
    
    // Navigate to processing with classification stage
    navigate(`/processing?batch=${batchId}&stage=classifying`);
  };

  const readyFiles = files.filter(f => f.status === 'ready_for_review');

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <p className="text-muted-foreground">No files found for review.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Review Summaries
              </h1>
              <p className="text-muted-foreground">
                Review AI-generated summaries before classification
              </p>
            </div>
          </div>
          
          {readyFiles.length > 0 && (
            <Button
              onClick={handleStartClassification}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Classification</span>
            </Button>
          )}
        </div>

        {/* Progress Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Batch Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{files.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{readyFiles.length}</div>
                <div className="text-sm text-muted-foreground">Ready for Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Review */}
        <div className="grid gap-6">
          {files.map((file) => (
            <Card key={file.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>{file.name}</span>
                  </CardTitle>
                  <Badge 
                    variant={file.status === 'ready_for_review' ? 'default' : 'secondary'}
                  >
                    {file.status === 'ready_for_review' ? 'Ready' : 'Processing'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {file.summary ? (
                  <div>
                    <h4 className="font-medium mb-2">AI Summary:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {file.summary}
                    </p>
                    {file.category && (
                      <div className="mt-4">
                        <span className="text-sm font-medium">Assigned Category: </span>
                        <Badge variant="outline">{file.category}</Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Summary is being generated...
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {readyFiles.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Waiting for summaries to be generated...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Review;