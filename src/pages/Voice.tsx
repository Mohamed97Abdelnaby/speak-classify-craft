import Navigation from "@/components/Navigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import CategoryManager from "@/components/CategoryManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Settings, Zap, FolderOpen, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Voice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Voice Transcription & Classification
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload or record audio files for automatic transcription and intelligent classification using advanced AI technology
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Record or Upload</h3>
              <p className="text-sm text-muted-foreground">
                Capture audio directly or upload existing files
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Advanced transcription and classification
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Custom Categories</h3>
              <p className="text-sm text-muted-foreground">
                Define your own classification categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Input Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Audio Input</h2>
            <VoiceRecorder />
          </div>

          {/* Category Management Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Classification Categories</h2>
            <CategoryManager />
          </div>
        </div>

        {/* Batch Processing Option */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <FolderOpen className="w-6 h-6 text-primary" />
                <span>Need to Process Multiple Files?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Upload and process multiple audio files simultaneously with our batch processing feature.
              </p>
              <Button 
                onClick={() => navigate("/batch-upload")}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                Try Batch Upload
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Voice;