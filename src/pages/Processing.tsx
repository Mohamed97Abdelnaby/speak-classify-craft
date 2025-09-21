import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { BatchFile, BatchData } from "@/types/batch";
import { transcribeAudio } from "@/services/transcriptionService";
import { useToast } from "@/hooks/use-toast";

const Processing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const batchId = searchParams.get('batch');
  const { toast } = useToast();
  
  const statusMessages = [
    t("listeningToCalls"),
    t("takingDecision"),
    t("analyzingPatterns"),
    t("processingContent"),
    t("applyingClassification")
  ];

  const processAudioFiles = async (batchData: BatchData) => {
    const updatedFiles = [...batchData.files];
    let completedCount = 0;

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      console.log(`Processing file ${i + 1}/${updatedFiles.length}: ${file.name}`);
      
      // Update status to transcribing
      updatedFiles[i] = { ...file, status: 'transcribing' };
      
      // Update localStorage with current progress
      const progressBatch = { ...batchData, files: updatedFiles };
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(progressBatch));
      
      try {
        // Transcribe the audio file
        const result = await transcribeAudio(file.file);
        
        if (result.success && result.text) {
          // Update file with transcription and mark as completed
          updatedFiles[i] = { 
            ...file, 
            status: 'completed',
            transcription: result.text,
            // Add mock classification for now
            classification: {
              predicted: file.category || 'غير مصنف',
              confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7-1.0
            }
          };
          completedCount++;
          setProcessedCount(completedCount);
        } else {
          // Mark as completed but with no transcription (so it won't show in results)
          updatedFiles[i] = { ...file, status: 'completed' };
          console.error(`Transcription failed for ${file.name}:`, result.error);
        }
      } catch (error) {
        // Mark as completed but with no transcription (so it won't show in results)
        updatedFiles[i] = { ...file, status: 'completed' };
        console.error(`Error processing ${file.name}:`, error);
      }
      
      // Update localStorage after each file
      const finalBatch = { ...batchData, files: updatedFiles };
      localStorage.setItem(`batch-${batchId}`, JSON.stringify(finalBatch));
    }

    // Navigate to review page when all files are processed
    navigate(`/review?batch=${batchId}`);
  };
  
  useEffect(() => {
    // Check if batch exists and start processing
    if (batchId) {
      const batchDataString = localStorage.getItem(`batch-${batchId}`);
      if (!batchDataString) {
        navigate("/");
        return;
      }

      const batchData: BatchData = JSON.parse(batchDataString);
      setTotalFiles(batchData.files.length);
      
      // Start processing audio files
      processAudioFiles(batchData);
    }

    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % statusMessages.length);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [navigate, batchId]);


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message={statusMessages[currentMessage]} />
          {totalFiles > 0 && (
            <div className="mt-6 text-center">
              <div className="text-lg font-medium text-foreground mb-2">
                {processedCount} / {totalFiles} ملف تم معالجته
              </div>
              <div className="w-64 bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(processedCount / totalFiles) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Processing;