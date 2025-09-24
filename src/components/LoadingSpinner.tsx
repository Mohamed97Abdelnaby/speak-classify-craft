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
          {/* Animated gradient background */}
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center relative">
            {/* Mic icon */}
            <Mic className="w-10 h-10 text-primary-foreground" />
            {/* Spinning loader inside the mic icon */}
            <Loader2 className="absolute w-12 h-12 text-primary-foreground/60 animate-spin" />
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