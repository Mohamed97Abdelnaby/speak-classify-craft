import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const Processing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stage, setStage] = useState<"transcribing" | "classifying">("transcribing");
  
  useEffect(() => {
    // Simulate the processing flow
    const processAudio = async () => {
      // Stage 1: Transcription (3 seconds)
      setStage("transcribing");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stage 2: Classification (2 seconds)
      setStage("classifying");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to results
      navigate("/results");
    };
    
    processAudio();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner 
            stage={stage}
            message={
              stage === "transcribing" 
                ? "Processing your audio file and converting speech to text..."
                : "Analyzing content and applying your custom classification categories..."
            }
          />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              This usually takes a few seconds depending on the audio length
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Processing;