import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mic, Brain, FileText } from "lucide-react";

interface LoadingSpinnerProps {
  stage: "transcribing" | "summarizing" | "classifying";
  message?: string;
}

const LoadingSpinner = ({ stage, message }: LoadingSpinnerProps) => {
  const getIcon = () => {
    switch (stage) {
      case "transcribing":
        return <Mic className="w-8 h-8 text-primary-foreground" />;
      case "summarizing":
        return <FileText className="w-8 h-8 text-primary-foreground" />;
      case "classifying":
        return <Brain className="w-8 h-8 text-primary-foreground" />;
      default:
        return <Mic className="w-8 h-8 text-primary-foreground" />;
    }
  };

  const getTitle = () => {
    switch (stage) {
      case "transcribing":
        return "Transcribing Audio...";
      case "summarizing":
        return "Summarizing Content...";
      case "classifying":
        return "Classifying Content...";
      default:
        return "Processing...";
    }
  };

  const getDefaultMessage = () => {
    switch (stage) {
      case "transcribing":
        return "Converting your audio to text using advanced AI technology";
      case "summarizing":
        return "Generating intelligent summaries of your transcribed content";
      case "classifying":
        return "Analyzing and categorizing your transcribed content";
      default:
        return "Processing your content...";
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            {getIcon()}
          </div>
          <Loader2 className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-spin" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {getTitle()}
        </h3>
        
        <p className="text-muted-foreground text-center max-w-sm">
          {message || getDefaultMessage()}
        </p>
        
        <div className="mt-6 flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingSpinner;