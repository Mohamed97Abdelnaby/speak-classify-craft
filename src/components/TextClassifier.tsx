import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BatchData, BatchFile } from "@/types/batch";
import { serializeBatchData } from "@/utils/fileSerializer";
import { setBatchData } from "@/utils/indexedDbStorage";
import { saveTranscriptionResult } from "@/services/transcriptionStorageService";

const TextClassifier = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<string | null>(null);
  const [classificationTimestamp, setClassificationTimestamp] = useState<string | null>(null);

  const handleClassify = async () => {
    if (!text.trim()) {
      toast({
        title: t("error"),
        description: t("textRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsClassifying(true);
    setClassification(null);

    try {
      console.log('Starting text classification:', text.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('classify-conversation', {
        body: { transcription: text }
      });

      if (error) {
        console.error('Classification error:', error);
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Classification failed');
      }

      setClassification(data.classification);
      setClassificationTimestamp(data.timestamp);
      
      // Create batch data for results page
      const textFile: BatchFile = {
        id: `text-${Date.now()}`,
        name: `${t('textConversationFilename')}-${new Date().toISOString().split('T')[0]}.txt`,
        file: new File([text], `${t('conversationFile')}-${Date.now()}.txt`, { type: 'text/plain' }),
        status: 'completed',
        transcription: text,
        classification: {
          predicted: data.classification,
          confidence: 1,
          aiClassification: data.classification,
          classificationTimestamp: data.timestamp
        }
      };

      const batchData: BatchData = {
        id: `batch-text-${Date.now()}`,
        files: [textFile],
        createdAt: new Date(),
        status: 'completed'
      };

      // Save to IndexedDB and navigate to results
      const serializedData = await serializeBatchData(batchData);
      await setBatchData(batchData.id, serializedData);
      
      // Save transcription result to database
      try {
        await saveTranscriptionResult({
          file_name: textFile.name,
          file_size: textFile.file.size,
          transcription_text: text,
          ai_classification: data.classification,
          ai_confidence: 1,
          batch_id: batchData.id,
          file_id: textFile.id
        });
        console.log('Text classification saved to database:', textFile.id);
      } catch (dbError) {
        console.error('Failed to save text classification to database:', dbError);
        // Continue with navigation even if database save fails - user can still see results
      }
      
      toast({
        title: t("success"),
        description: t("classificationCompleted"),
      });

      // Navigate to results page with batch ID
      navigate(`/results?batch=${batchData.id}`);

    } catch (error) {
      console.error('Text classification error:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("classificationError"),
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleClear = () => {
    setText("");
    setClassification(null);
    setClassificationTimestamp(null);
  };

  const getClassificationColor = (classification: string) => {
    if (classification.includes("متجاوب")) return "bg-green-500/10 text-green-700 border-green-200";
    if (classification.includes("واعد")) return "bg-blue-500/10 text-blue-700 border-blue-200";
    if (classification.includes("مماطل")) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    if (classification.includes("رافض")) return "bg-red-500/10 text-red-700 border-red-200";
    if (classification.includes("غاضب") || classification.includes("مسيء")) return "bg-red-600/10 text-red-800 border-red-300";
    if (classification.includes("لا يستطيع")) return "bg-orange-500/10 text-orange-700 border-orange-200";
    if (classification.includes("التلاعب") || classification.includes("الهجوم")) return "bg-purple-500/10 text-purple-700 border-purple-200";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          {t("textClassifier")}
        </CardTitle>
        <CardDescription>
          {t("textClassifierDesc")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("conversationText")}
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("conversationPlaceholder")}
            className="min-h-[200px] resize-none"
            dir="rtl"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{text.length} {t("characters")}</span>
            <span>{t("maxCharacters")}: 10,000</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleClassify}
            disabled={!text.trim() || isClassifying}
            className="flex-1"
          >
            {isClassifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("classifying")}
              </>
            ) : (
              t("classifyText")
            )}
          </Button>
          
          <Button 
            onClick={handleClear}
            variant="outline"
            disabled={!text && !classification}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {classification && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t("classificationResult")}:
              </span>
              {classificationTimestamp && (
                <span className="text-xs text-muted-foreground">
                  {new Date(classificationTimestamp).toLocaleString('ar-SA')}
                </span>
              )}
            </div>
            <Badge 
              variant="outline" 
              className={`${getClassificationColor(classification)} text-right`}
            >
              {classification}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextClassifier;