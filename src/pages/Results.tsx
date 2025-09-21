import Navigation from "@/components/Navigation";
import TranscriptionResults from "@/components/TranscriptionResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Results = () => {
  const navigate = useNavigate();

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
};

export default Results;