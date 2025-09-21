import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import TranscriptionResults from "@/components/TranscriptionResults";
import EmailResultsDialog from "@/components/EmailResultsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle, FileText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BatchFile } from "@/types/batch";

const Results = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const { toast } = useToast();
  const batchId = searchParams.get('batch');

  useEffect(() => {
    // Load batch data
    if (batchId) {
      const batchData = localStorage.getItem(`batch-${batchId}`);
      if (batchData) {
        const batch = JSON.parse(batchData);
        const completedFiles = batch.files || [];
        setFiles(completedFiles);
        if (completedFiles.length > 0) {
          setActiveTab(completedFiles[0].id);
        }
      } else {
        navigate("/");
      }
    }
  }, [batchId, navigate]);

  const updateFileVerification = (fileId: string, verifiedCategory: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? {
            ...file,
            classification: {
              ...file.classification!,
              verified: verifiedCategory
            }
          }
        : file
    ));
    
    // Update localStorage
    if (batchId) {
      const batchData = {
        id: batchId,
        files: files.map(file => 
          file.id === fileId 
            ? {
                ...file,
                classification: {
                  ...file.classification!,
                  verified: verifiedCategory
                }
              }
            : file
        ),
        status: 'completed'
      };
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(batchData));
    }
    
    toast({
      title: "Verification Updated",
      description: `Category verified as "${verifiedCategory}"`,
    });
  };

  const handleNewTranscription = () => {
    navigate("/");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export results");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share results");
  };
  
  // Mock categories for verification
  const categories = ["Meeting", "Interview", "Lecture", "Phone Call", "Presentation", "Other"];
  
  // If no batch data, show single file results (legacy)
  if (!batchId || files.length === 0) {
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
                <span>Back to Voice Input</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Transcription Results
                </h1>
                <p className="text-muted-foreground">
                  Review your transcribed content and AI classification
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button
                onClick={handleNewTranscription}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Transcription</span>
              </Button>
            </div>
          </div>

          {/* Single Results Section */}
          <div className="grid grid-cols-1 gap-8">
            <TranscriptionResults />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleExport}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Download className="w-5 h-5 text-primary" />
                  <span>Export Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Download your transcription and classification results as text or CSV
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleShare}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Share2 className="w-5 h-5 text-primary" />
                  <span>Share Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share your results with colleagues or save to cloud storage
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleNewTranscription}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span>Process New Audio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start a new transcription and classification session
                </p>
              </CardContent>
            </Card>
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
              <span>Back to Voice Input</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Batch Results ({files.length} files)
              </h1>
              <p className="text-muted-foreground">
                Review and verify your transcription and classification results
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <EmailResultsDialog files={files} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={handleNewTranscription}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Batch</span>
            </Button>
          </div>
        </div>

        {/* Batch Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-auto overflow-x-auto">
            {files.map((file, index) => (
              <TabsTrigger 
                key={file.id} 
                value={file.id}
                className="min-w-[150px] text-left"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">File {index + 1}</span>
                  {file.classification?.verified && (
                    <CheckCircle className="w-3 h-3 text-success" />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {files.map((file) => (
            <TabsContent key={file.id} value={file.id} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">File Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">File Name</p>
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Original Category</p>
                      <Badge variant="outline">{file.category || 'Not assigned'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {file.summary || 'No summary available'}
                    </p>
                  </CardContent>
                </Card>

                {/* Classification & Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Classification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">AI Prediction</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {file.classification?.predicted || 'Unknown'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {file.classification?.confidence 
                            ? `${(file.classification.confidence * 100).toFixed(1)}%`
                            : ''
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Verify Category</p>
                      <Select
                        value={file.classification?.verified || file.classification?.predicted || ""}
                        onValueChange={(value) => updateFileVerification(file.id, value)}
                      >
                        <SelectTrigger>
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
                    </div>
                    
                    {file.classification?.verified && (
                      <div className="p-3 bg-success/10 rounded-md">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium text-success">
                            Verified as "{file.classification.verified}"
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Results;