import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import TranscriptionResults from "@/components/TranscriptionResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Share2, RotateCcw, Mail, CheckCircle, Edit3, FileAudio, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Batch, BatchFile } from "@/types/batch";

const Results = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const { toast } = useToast();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

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

  useEffect(() => {
    // If no batchId, show single file results (legacy mode)
    if (!batchId) {
      return;
    }

    // Load batch results
    const batchData = localStorage.getItem(`batch_${batchId}`);
    if (batchData) {
      setBatch(JSON.parse(batchData));
    }
  }, [batchId]);

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

  const updateFileClassification = (fileId: string, verifiedCategory: string) => {
    if (!batch) return;

    setBatch(prevBatch => {
      if (!prevBatch) return null;
      
      const updatedFiles = prevBatch.files.map(file =>
        file.id === fileId && file.classification ? {
          ...file,
          classification: {
            ...file.classification,
            verified: verifiedCategory
          }
        } : file
      );
      
      const updated = { ...prevBatch, files: updatedFiles };
      localStorage.setItem(`batch_${batchId}`, JSON.stringify(updated));
      return updated;
    });

    toast({
      title: "Classification Updated",
      description: `Category updated to "${verifiedCategory}"`
    });
  };

  const verifyFileResults = (fileId: string) => {
    toast({
      title: "Results Verified",
      description: "Classification results have been verified and saved."
    });
  };

  const handleSendEmail = async () => {
    if (!emailAddress.trim() || !batch) return;

    setSendingEmail(true);
    
    // Simulate email sending
    setTimeout(() => {
      setSendingEmail(false);
      setEmailDialogOpen(false);
      setEmailAddress("");
      
      toast({
        title: "Email Sent Successfully",
        description: `Results have been sent to ${emailAddress}`
      });
    }, 2000);
  };

  // Legacy single file view
  if (!batchId) {
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

          {/* Results Section */}
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

  // Batch results view
  if (!batch) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Batch Not Found</h2>
              <p className="text-muted-foreground">The requested batch results could not be found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const completedFiles = batch.files.filter(f => f.status === 'completed' && f.classification);

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
                Batch Classification Results
              </h1>
              <p className="text-muted-foreground">
                Review and verify AI classifications for {completedFiles.length} files
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Results by Email</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Results by Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Send the complete batch results including summaries and classifications to an email address.
                  </p>
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEmailDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={!emailAddress.trim() || sendingEmail}
                    >
                      {sendingEmail ? "Sending..." : "Send Email"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={handleNewTranscription}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Batch</span>
            </Button>
          </div>
        </div>

        {/* Tabbed Results */}
        {completedFiles.length > 0 ? (
          <Tabs defaultValue={completedFiles[0]?.id} className="space-y-6">
            <TabsList className="grid w-full grid-cols-auto overflow-x-auto">
              {completedFiles.map(file => (
                <TabsTrigger 
                  key={file.id} 
                  value={file.id}
                  className="flex items-center space-x-2 min-w-fit px-4"
                >
                  <FileAudio className="w-4 h-4" />
                  <span className="truncate max-w-32">{file.name}</span>
                  {file.classification?.verified && (
                    <CheckCircle className="w-3 h-3 text-success" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {completedFiles.map(file => (
              <TabsContent key={file.id} value={file.id}>
                <div className="space-y-6">
                  {/* File Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <FileAudio className="w-6 h-6 text-primary" />
                        <span>{file.name}</span>
                        <Badge variant="outline">{file.category}</Badge>
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Overall Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">
                          {file.summary}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Classification Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Classification Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Predicted Category */}
                        <div>
                          <h4 className="font-medium text-foreground mb-3">Predicted Category</h4>
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-primary text-primary-foreground">
                              {file.classification?.predicted}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {file.classification?.confidence}% confidence
                            </span>
                          </div>
                        </div>

                        {/* Alternative Categories */}
                        {file.classification?.alternatives && (
                          <div>
                            <h4 className="font-medium text-foreground mb-3">Alternative Categories</h4>
                            <div className="space-y-2">
                              {file.classification.alternatives.map((alt, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <Badge variant="secondary">{alt.category}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {alt.confidence}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Human Verification */}
                        <div className="border-t pt-6">
                          <h4 className="font-medium text-foreground mb-3">Human Verification</h4>
                          <div className="space-y-4">
                            <Select
                              value={file.classification?.verified || file.classification?.predicted || ""}
                              onValueChange={(value) => updateFileClassification(file.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Verify or change category" />
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
                              onClick={() => verifyFileResults(file.id)}
                              className="w-full"
                              variant={file.classification?.verified ? "default" : "outline"}
                            >
                              {file.classification?.verified ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Results Verified
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Verify Results
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Results Available</h3>
              <p className="text-muted-foreground">
                No completed files found in this batch.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Results;