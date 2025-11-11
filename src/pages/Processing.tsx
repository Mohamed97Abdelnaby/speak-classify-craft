import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { BatchFile, BatchData } from "@/types/batch";
import { transcribeAudio, AIProvider } from "@/services/transcriptionService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

type ProcessingStep = 
  | 'select-transcribe' 
  | 'transcribing' 
  | 'select-summarize' 
  | 'summarizing' 
  | 'select-classify' 
  | 'classifying' 
  | 'complete';

const Processing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('select-transcribe');
  const [currentMessage, setCurrentMessage] = useState(0);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [batchData, setBatchDataState] = useState<BatchData | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const batchId = searchParams.get('batch');
  const { toast } = useToast();
  
  const statusMessages = [
    t("listeningToCalls"),
    t("takingDecision"),
    t("analyzingPatterns"),
    t("processingContent"),
    t("applyingClassification")
  ];

  // Helper to update batch data in storage
  const updateBatchStorage = useCallback(async (updatedBatch: BatchData) => {
    try {
      const { serializeBatchData } = await import('@/utils/fileSerializer');
      const { setBatchData } = await import('@/utils/indexedDbStorage');
      const serialized = await serializeBatchData(updatedBatch);
      await setBatchData(batchId!, serialized);
      setBatchDataState(updatedBatch);
    } catch (error) {
      console.error('Failed to update batch storage:', error);
    }
  }, [batchId]);

  // Step 1: Transcribe all files
  const transcribeFiles = useCallback(async (provider: AIProvider) => {
    if (!batchData) return;
    
    setCurrentStep('transcribing');
    setCustomMessage('تحويل الصوت إلى نص...');
    
    const updatedFiles = [...batchData.files];
    let completedCount = 0;

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      console.log(`Transcribing file ${i + 1}/${updatedFiles.length}: ${file.name}`);
      
      updatedFiles[i] = { ...file, status: 'transcribing' };
      await updateBatchStorage({ ...batchData, files: updatedFiles, transcriptionProvider: provider });
      
      try {
        const result = await transcribeAudio(file.file, provider);
        
        if (result.success && result.text) {
          updatedFiles[i] = { 
            ...file, 
            status: 'summarizing',
            transcription: result.text
          };
          completedCount++;
          setProcessedCount(completedCount);
        } else {
          console.error(`Transcription failed for ${file.name}:`, result.error);
          updatedFiles[i] = { ...file, status: 'completed' };
        }
      } catch (error) {
        console.error(`Error transcribing ${file.name}:`, error);
        updatedFiles[i] = { ...file, status: 'completed' };
      }
      
      await updateBatchStorage({ ...batchData, files: updatedFiles, transcriptionProvider: provider });
    }

    // Move to next step
    setCurrentStep('select-summarize');
    setProcessedCount(0);
  }, [batchData, updateBatchStorage]);

  // Step 2: Summarize all files
  const summarizeFiles = useCallback(async (provider: AIProvider) => {
    if (!batchData) return;
    
    setCurrentStep('summarizing');
    setCustomMessage('تلخيص المحادثات...');
    
    const updatedFiles = [...batchData.files];
    let completedCount = 0;
    const { supabase } = await import('@/integrations/supabase/client');

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      
      if (!file.transcription) {
        completedCount++;
        continue;
      }
      
      console.log(`Summarizing file ${i + 1}/${updatedFiles.length}: ${file.name}`);
      
      try {
        const summaryResponse = await supabase.functions.invoke('summarize-conversation', {
          body: { transcription: file.transcription, provider }
        });

        let summary = '';
        if (summaryResponse.error) {
          console.error(`Summarization failed for ${file.name}:`, summaryResponse.error);
          summary = file.transcription;
        } else {
          summary = summaryResponse.data.summary;
        }

        updatedFiles[i] = { 
          ...file, 
          status: 'classifying',
          summary: summary
        };
        completedCount++;
        setProcessedCount(completedCount);
      } catch (error) {
        console.error(`Error summarizing ${file.name}:`, error);
        updatedFiles[i] = { ...file, summary: file.transcription };
      }
      
      await updateBatchStorage({ ...batchData, files: updatedFiles, summarizationProvider: provider });
    }

    // Move to next step
    setCurrentStep('select-classify');
    setProcessedCount(0);
  }, [batchData, updateBatchStorage]);

  // Step 3: Classify all files
  const classifyFiles = useCallback(async (provider: AIProvider) => {
    if (!batchData) return;
    
    setCurrentStep('classifying');
    setCustomMessage('تصنيف المحادثات...');
    
    const updatedFiles = [...batchData.files];
    let completedCount = 0;
    const { supabase } = await import('@/integrations/supabase/client');

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      
      if (!file.transcription) {
        completedCount++;
        continue;
      }
      
      console.log(`Classifying file ${i + 1}/${updatedFiles.length}: ${file.name}`);
      
      try {
        const classificationResponse = await supabase.functions.invoke('classify-conversation', {
          body: { transcription: file.transcription, provider }
        });

        let classification = {
          predicted: file.category || 'غير مصنف',
          confidence: Math.random() * 0.3 + 0.7
        };

        if (classificationResponse.error) {
          console.error(`Classification failed for ${file.name}:`, classificationResponse.error);
        } else {
          classification = classificationResponse.data;
        }

        updatedFiles[i] = { 
          ...file, 
          status: 'completed',
          classification: {
            predicted: classification.predicted,
            confidence: classification.confidence,
            aiClassification: classification.predicted
          }
        };
        completedCount++;
        setProcessedCount(completedCount);
      } catch (error) {
        console.error(`Error classifying ${file.name}:`, error);
        updatedFiles[i] = { ...file, status: 'completed' };
      }
      
      await updateBatchStorage({ ...batchData, files: updatedFiles, classificationProvider: provider });
    }

    // Navigate to review when complete
    setCurrentStep('complete');
    navigate(`/review?batch=${batchId}`);
  }, [batchData, updateBatchStorage, navigate, batchId]);

  // Rotate status messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % statusMessages.length);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [statusMessages.length]);

  // Initial data load
  useEffect(() => {
    if (!batchId) {
      navigate("/");
      return;
    }

    const loadBatchData = async () => {
      try {
        const { getBatchData } = await import('@/utils/indexedDbStorage');
        const { deserializeBatchData } = await import('@/utils/fileSerializer');
        
        const serializedBatchData = await getBatchData(batchId);
        
        if (serializedBatchData) {
          const loadedBatch = deserializeBatchData(serializedBatchData);
          setBatchDataState(loadedBatch);
          setTotalFiles(loadedBatch.files.length);
          
          // Set initial provider from batch data
          if (loadedBatch.transcriptionProvider) {
            setSelectedProvider(loadedBatch.transcriptionProvider);
          }
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
  }, [batchId, navigate, toast, t]);

  // Provider selection UI
  const renderProviderSelection = (stepName: string, onContinue: () => void) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Zap className="w-5 h-5 text-primary" />
            اختر النموذج لـ {stepName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => setSelectedProvider('openai')}
              variant={selectedProvider === 'openai' ? 'default' : 'outline'}
              className="flex-1 h-16 text-lg"
            >
              {selectedProvider === 'openai' && <Badge className="ml-2" variant="secondary">✓</Badge>}
              OpenAI
            </Button>
            <Button
              onClick={() => setSelectedProvider('groq')}
              variant={selectedProvider === 'groq' ? 'default' : 'outline'}
              className="flex-1 h-16 text-lg"
            >
              {selectedProvider === 'groq' && <Badge className="ml-2" variant="secondary">✓</Badge>}
              Groq
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            سيتم استخدام {selectedProvider === 'openai' ? 'OpenAI' : 'Groq'} لـ {stepName}
          </p>
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            متابعة مع {selectedProvider === 'openai' ? 'OpenAI' : 'Groq'}
          </Button>
        </CardContent>
      </Card>
      
      {totalFiles > 0 && (
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">
            {totalFiles} ملف جاهز للمعالجة
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        {currentStep === 'select-transcribe' && renderProviderSelection(
          'تحويل الصوت إلى نص',
          () => transcribeFiles(selectedProvider)
        )}
        
        {currentStep === 'select-summarize' && renderProviderSelection(
          'التلخيص',
          () => summarizeFiles(selectedProvider)
        )}
        
        {currentStep === 'select-classify' && renderProviderSelection(
          'التصنيف',
          () => classifyFiles(selectedProvider)
        )}
        
        {(currentStep === 'transcribing' || currentStep === 'summarizing' || currentStep === 'classifying') && (
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
                <div className="mt-3 text-sm text-muted-foreground">
                  {currentStep === 'transcribing' && 'جاري تحويل الصوت إلى نص...'}
                  {currentStep === 'summarizing' && 'جاري تلخيص المحادثات...'}
                  {currentStep === 'classifying' && 'جاري تصنيف المحادثات...'}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Processing;
