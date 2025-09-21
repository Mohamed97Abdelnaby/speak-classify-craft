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
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary-foreground" />
          </div>
          <Loader2 className="absolute -top-2 -left-2 w-6 h-6 text-primary animate-spin" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("processingAudio")}
        </h3>
        
        <p className="text-muted-foreground text-center max-w-sm">
          {message}
        </p>
        
        <div className="mt-6 flex space-x-1 space-x-reverse">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingSpinner;