import Navigation from "@/components/Navigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptionResults from "@/components/TranscriptionResults";
import CategoryManager from "@/components/CategoryManager";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp,
  Clock,
  Mic,
  Zap
} from "lucide-react";

const Index = () => {
  const [hasResults, setHasResults] = useState(true); // Set to true to show mock results

  // Mock stats data
  const stats = [
    {
      title: "Total Transcriptions",
      value: "127",
      change: "+12%",
      icon: Mic,
      color: "text-primary"
    },
    {
      title: "Processing Time",
      value: "2.3s",
      change: "avg",
      icon: Clock,
      color: "text-success"
    },
    {
      title: "Accuracy Rate",
      value: "94.2%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-warning"
    },
    {
      title: "Classifications",
      value: "118",
      change: "+8%",
      icon: Zap,
      color: "text-accent-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Voice Transcription Dashboard
          </h1>
          <p className="text-muted-foreground">
            Upload or record audio files for automatic transcription and intelligent classification
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-secondary ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Voice Input Section */}
          <div className="lg:col-span-1">
            <VoiceRecorder />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {hasResults ? (
              <TranscriptionResults />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready to Transcribe
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Upload an audio file or record your voice to get started with transcription and classification.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Category Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CategoryManager />
          </div>
          <div className="lg:col-span-2">
            {/* Placeholder for future features */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;