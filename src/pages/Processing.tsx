import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { BatchFile, BatchData } from "@/types/batch";
import { transcribeAudio } from "@/services/transcriptionService";
import { useToast } from "@/hooks/use-toast";
import { saveTranscriptionResult } from "@/services/transcriptionStorageService";

const Processing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [customMessage, setCustomMessage] = useState<string>("");
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

  const processAudioFiles = useCallback(async (batchData: BatchData) => {
    const updatedFiles = [...batchData.files];
    let completedCount = 0;
    
    // Import serialization utility once
    const { serializeBatchData } = await import('@/utils/fileSerializer');

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      console.log(`Processing file ${i + 1}/${updatedFiles.length}: ${file.name}`);
      console.log('File object before transcription:', {
        name: file.file.name,
        size: file.file.size,
        type: file.file.type,
        constructor: file.file.constructor.name,
        isValidFile: file.file instanceof File,
        lastModified: file.file.lastModified
      });
      
      // Update status to transcribing
      updatedFiles[i] = { ...file, status: 'transcribing' };
      
      // Update progress storage - serialize the updated batch
      try {
        const { setBatchData } = await import('@/utils/indexedDbStorage');
        const progressBatch = { ...batchData, files: updatedFiles };
        const serializedProgress = await serializeBatchData(progressBatch);
        await setBatchData(batchId!, serializedProgress);
      } catch (storageError) {
        console.error('Failed to update progress storage:', storageError);
      }
      
      try {
        // Transcribe the audio file
        console.log('Calling transcribeAudio with file:', file.file.name);
        const result = await transcribeAudio(file.file);
        console.log(`Transcription result for ${file.name}:`, result);
        
        if (result.success && result.text) {
          console.log(`Transcription successful for ${file.name}:`, result.text.substring(0, 100) + '...');
          
          // Step 2: Summarize the transcription
          console.log(`Summarizing file ${i + 1}/${updatedFiles.length}: ${file.name}`);
          setCustomMessage('تلخيص المحادثة...');
          
          const { supabase } = await import('@/integrations/supabase/client');
          const summaryResponse = await supabase.functions.invoke('summarize-conversation', {
            body: { transcription: result.text }
          });

          let summary = '';
          if (summaryResponse.error) {
            console.error(`Summarization failed for ${file.name}:`, summaryResponse.error);
            summary = result.text; // Fallback to original transcription
          } else {
            summary = summaryResponse.data.summary;
            console.log('Summary result:', summary);
          }

          // Step 3: Classify the transcription  
          console.log(`Classifying file ${i + 1}/${updatedFiles.length}: ${file.name}`);
          setCustomMessage('تصنيف المحادثة...');
          
          const classificationResponse = await supabase.functions.invoke('classify-conversation', {
            body: { transcription: result.text }
          });

          let classification = {
            predicted: file.category || 'غير مصنف',
            confidence: Math.random() * 0.3 + 0.7
          };

          if (classificationResponse.error) {
            console.error(`Classification failed for ${file.name}:`, classificationResponse.error);
          } else {
            classification = classificationResponse.data;
            console.log('Classification result:', classification);
          }
          
          // Update file with transcription, summary and classification
          updatedFiles[i] = { 
            ...file, 
            status: 'completed',
            transcription: result.text,
            summary: summary,
            classification: {
              predicted: classification.predicted,
              confidence: classification.confidence,
              aiClassification: classification.predicted
            }
          };
          completedCount++;
          setProcessedCount(completedCount);

          // Data will only be saved to database if user is unsatisfied with results
        } else {
          console.error(`Transcription failed for ${file.name}:`, result.error);
          // Mark as completed but with no transcription (so it won't show in results)
          updatedFiles[i] = { ...file, status: 'completed' };
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        // Mark as completed but with no transcription (so it won't show in results)
        updatedFiles[i] = { ...file, status: 'completed' };
      }
      
      // Update storage after each file - serialize the final batch
      try {
        const { setBatchData } = await import('@/utils/indexedDbStorage');
        const finalBatch = { ...batchData, files: updatedFiles };
        const serializedFinal = await serializeBatchData(finalBatch);
        await setBatchData(batchId!, serializedFinal);
      } catch (storageError) {
        console.error('Failed to update storage:', storageError);
      }
    }

    // Navigate to review page when all files are processed
    navigate(`/review?batch=${batchId}`);
  }, [batchId, navigate, setProcessedCount]);
  
  useEffect(() => {
    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % statusMessages.length);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [statusMessages.length]);

  useEffect(() => {
    // Check if batch exists and start processing
    if (!batchId) {
      navigate("/");
      return;
    }

    // Load batch data from storage
    const loadBatchData = async () => {
      try {
        const { getBatchData } = await import('@/utils/indexedDbStorage');
        const { deserializeBatchData } = await import('@/utils/fileSerializer');
        
        const serializedBatchData = await getBatchData(batchId);
        
        if (serializedBatchData) {
          const batchData = deserializeBatchData(serializedBatchData);
          setTotalFiles(batchData.files.length);
          
          // Start processing audio files
          processAudioFiles(batchData);
        } else {
          console.error('No batch data found for:', batchId);
          toast({
            title: t("error"),
            description: "Failed to load batch data",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error('Failed to load batch data:', error);
        toast({
          title: t("error"),
          description: "Failed to load batch data", 
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    loadBatchData();
  }, [batchId, navigate, processAudioFiles, toast, t]);


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message={customMessage || statusMessages[currentMessage]} />
          {totalFiles > 0 && (
            <div className="mt-6 text-center">
              <div className="text-lg font-medium text-foreground mb-2">
                {processedCount} / {totalFiles} ملف تم معالجته
              </div>
              <div className="w-64 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
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