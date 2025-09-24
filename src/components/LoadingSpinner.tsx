import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner = ({ message }: LoadingSpinnerProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          {/* Animated gradient background with pulse effect */}
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse relative">
            {/* Inner rotating ring */}
            <div className="absolute inset-1 border-2 border-primary-foreground/30 rounded-full animate-spin border-t-primary-foreground"></div>
            {/* Mic icon with subtle animation */}
            <Mic className="w-10 h-10 text-primary-foreground animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-3 text-center">
          {t("processingAudio")}
        </h3>
        
        <p className="text-muted-foreground text-center max-w-sm mb-2 leading-relaxed">
          {message || t("processingContent")}
        </p>
        
        {/* Enhanced bouncing dots with Arabic styling */}
        <div className="mt-4 flex space-x-1 items-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
        
        {/* Processing status text */}
        <div className="mt-4 text-sm text-muted-foreground/80 text-center">
          {t("analyzingPatterns")}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingSpinner;