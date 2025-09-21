import { useState } from "react";
import Navigation from "@/components/Navigation";
import BatchUploader from "@/components/BatchUploader";
import CategoryManager from "@/components/CategoryManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Settings, 
  FolderOpen,
  Mic,
  Brain,
  Target
} from "lucide-react";

const BatchUpload = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Batch Audio Processing</h1>
          <p className="text-muted-foreground">
            Upload multiple audio files for automated transcription and classification
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Upload className="w-5 h-5 text-primary" />
                <span>Batch Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload multiple audio files simultaneously with drag-and-drop support
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Brain className="w-5 h-5 text-primary" />
                <span>AI Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated transcription, summarization, and intelligent classification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                <span>Human Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review, verify, and refine AI classifications with human oversight
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <BatchUploader />
          </div>

          {/* Category Management */}
          <div className="lg:col-span-1">
            <CategoryManager />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchUpload;