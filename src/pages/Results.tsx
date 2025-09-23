import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import TranscriptionResults from "@/components/TranscriptionResults";
import EmailResultsDialog from "@/components/EmailResultsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle, FileText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BatchFile } from "@/types/batch";
import { getBatchData } from "@/utils/indexedDbStorage";
import { deserializeBatchData } from "@/utils/fileSerializer";
import { useTranslation } from "react-i18next";
import { getUserCategories } from "@/utils/categoryStorage";
import { updateSatisfactionResponse, updateVerifiedClassification, updateFinalClassification, saveTranscriptionResult } from "@/services/transcriptionStorageService";

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [satisfactionAnswers, setSatisfactionAnswers] = useState<Record<string, 'satisfied' | 'not-satisfied' | null>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const batchId = searchParams.get('batch');

  useEffect(() => {
    const loadedCategories = getUserCategories();
    console.log('Loading categories in Results page:', loadedCategories);
    setCategories(loadedCategories);
  }, []);

  useEffect(() => {
    // Load batch data
    const loadBatchData = async () => {
      if (batchId) {
        try {
          const serializedBatchData = await getBatchData(batchId);
          if (serializedBatchData) {
            const batchData = await deserializeBatchData(serializedBatchData);
            const completedFiles = batchData.files || [];
            setFiles(completedFiles);
            if (completedFiles.length > 0) {
              setActiveTab(completedFiles[0].id);
            }
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error('Error loading batch data:', error);
          navigate("/");
        }
      }
    };
    
    loadBatchData();
  }, [batchId, navigate]);

  const updateFileVerification = async (fileId: string, verifiedCategory: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? {
            ...file,
            classification: {
              ...file.classification!,
              verified: verifiedCategory
            }
          }
        : file
    ));
    
    // Update localStorage
    if (batchId) {
      const batchData = {
        id: batchId,
        files: files.map(file => 
          file.id === fileId 
            ? {
                ...file,
                classification: {
                  ...file.classification!,
                  verified: verifiedCategory
                }
              }
            : file
        ),
        createdAt: new Date(),
        status: 'completed' as const
      };
      
      localStorage.setItem(`batchData_${batchId}`, JSON.stringify(batchData));
    }

    // Save complete transcription data to database for unsatisfied users
    const fileToSave = files.find(f => f.id === fileId);
    if (fileToSave) {
      try {
        // First save the basic transcription data
        const saveResult = await saveTranscriptionResult({
          file_name: fileToSave.name,
          file_size: fileToSave.file?.size || 0,
          transcription_text: fileToSave.transcription || '',
          summary: fileToSave.summary || '',
          ai_classification: fileToSave.classification?.aiClassification || fileToSave.classification?.predicted || '',
          ai_confidence: fileToSave.classification?.confidence || 0,
          batch_id: batchId || '',
          file_id: fileId
        });
        
        if (saveResult.success) {
          // Then update with satisfaction and verification data
          const finalResult = await updateFinalClassification(fileId, verifiedCategory, 'not-satisfied');
          
          if (finalResult.success) {
            console.log('Complete transcription data saved for unsatisfied user:', fileId);
            toast({
              title: t("success"),
              description: `${t("categoryVerifiedAs")} "${verifiedCategory}"`,
            });
          } else {
            console.error('Error updating final classification:', finalResult.error);
            toast({
              title: "خطأ",
              description: "فشل في حفظ التصنيف النهائي",
              variant: "destructive"
            });
          }
        } else {
          console.error('Error saving transcription data:', saveResult.error);
          toast({
            title: "خطأ",
            description: "فشل في حفظ البيانات",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error saving transcription data:', error);
        toast({
          title: "خطأ",
          description: "فشل في حفظ البيانات",
          variant: "destructive"
        });
      }
    }
  };

  const handleNewTranscription = () => {
    navigate("/");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export results");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share results");
  };

  const handleSatisfactionResponse = async (fileId: string, response: 'satisfied' | 'not-satisfied') => {
    const file = files.find(f => f.id === fileId);
    if (!file || !file.classification) return;

    setSatisfactionAnswers(prev => ({
      ...prev,
      [fileId]: response
    }));

    // Determine final classification based on satisfaction response
    let finalClassification: string;
    
    if (response === 'satisfied') {
      // User is satisfied with AI classification - only show UI feedback, don't save to database
      toast({
        title: t("success"),
        description: "شكرًا لك! تم تأكيد التصنيف",
      });
    }
    // If not satisfied, don't save yet - wait for user to select category
  };
  
  // If no batch data, show single file results (legacy)
  if (!batchId || files.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("backToVoiceInput")}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {t("transcriptionResults")}
                </h1>
                <p className="text-muted-foreground">
                  {t("reviewTranscriptionContent")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Share2 className="w-4 h-4" />
                <span>{t("share")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Download className="w-4 h-4" />
                <span>{t("export")}</span>
              </Button>
              <Button
                onClick={handleNewTranscription}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2 space-x-reverse"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t("newTranscription")}</span>
              </Button>
            </div>
          </div>

          {/* Single Results Section */}
          <div className="grid grid-cols-1 gap-8">
            <TranscriptionResults />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleExport}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
                  <Download className="w-5 h-5 text-primary" />
                  <span>{t("exportResults")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("downloadTranscriptionResults")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleShare}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
                  <Share2 className="w-5 h-5 text-primary" />
                  <span>{t("shareResults")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("shareWithColleagues")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleNewTranscription}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span>{t("processNewAudio")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("startNewSession")}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToVoiceInput")}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("batchResults")} ({files.length} {files.length === 1 ? t("file") : t("files")})
              </h1>
              <p className="text-muted-foreground">
                {t("reviewAndVerifyResults")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <EmailResultsDialog files={files} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>{t("export")}</span>
            </Button>
            <Button
              onClick={handleNewTranscription}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2 space-x-reverse"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("newBatch")}</span>
            </Button>
          </div>
        </div>

        {/* Batch Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-auto overflow-x-auto">
            {files.map((file, index) => (
              <TabsTrigger 
                key={file.id} 
                value={file.id}
                className="min-w-[150px] text-left"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">{t("file")} {index + 1}</span>
                  {file.classification?.verified && (
                    <CheckCircle className="w-3 h-3 text-success" />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {files.map((file) => (
            <TabsContent key={file.id} value={file.id} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات الملف</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">اسم الملف</p>
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">الحالة</p>
                      <Badge variant="default">مكتمل</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">التصنيف الأصلي</p>
                      <Badge variant="outline">{file.category || 'غير محدد'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Transcription */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ملخص المحادثة</CardTitle>
                  </CardHeader>
                  <CardContent>
        <div className="p-4 bg-muted/50 rounded-md max-h-40 overflow-y-auto">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="rtl">
            {file.summary || file.transcription || 'لا يوجد نص مستخرج'}
          </p>
        </div>
                  </CardContent>
                </Card>

                {/* Classification & Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">التصنيف</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Always show AI Classification */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t('aiClassification')}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          {file.classification?.aiClassification || file.classification?.predicted || 'لم يتم التصنيف بعد'}
                        </Badge>
                        {file.classification?.confidence && (
                          <span className="text-xs text-muted-foreground">
                            الثقة: {Math.round(file.classification.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Satisfaction Survey */}
                    {!satisfactionAnswers[file.id] && (
                      <Card className="border-2 border-dashed border-primary/30">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-4">
                            <h3 className="text-lg font-medium">{t('satisfactionQuestion')}</h3>
                            <div className="flex justify-center gap-4">
                              <Button
                                onClick={() => handleSatisfactionResponse(file.id, 'satisfied')}
                                variant="outline"
                                className="hover:bg-success/10 hover:border-success hover:text-success"
                              >
                                {t('yesSatisfied')}
                              </Button>
                              <Button
                                onClick={() => handleSatisfactionResponse(file.id, 'not-satisfied')}
                                variant="outline"
                                className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                              >
                                {t('notSatisfied')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Show satisfaction result */}
                    {satisfactionAnswers[file.id] === 'satisfied' && (
                      <div className="mt-2 p-2 bg-success/10 rounded-md">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-success" />
                          <span className="text-xs text-success">
                            تم الموافقة على تصنيف الذكاء الاصطناعي
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Classification - Only show when user is not satisfied */}
                    {satisfactionAnswers[file.id] === 'not-satisfied' && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">{t('confirmationClassification')}</p>
                          {categories.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              <p className="mb-2">لا توجد فئات متاحة</p>
                              <p className="text-sm">يرجى إضافة فئات في إعدادات التصنيف أولاً</p>
                            </div>
                          ) : (
                            <Select
                              value={file.classification?.verified || ""}
                              onValueChange={(value) => updateFileVerification(file.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر التصنيف الصحيح" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        
                        {file.classification?.verified && (
                          <div className="mt-2 p-2 bg-success/10 rounded-md">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-success" />
                              <span className="text-xs text-success">
                                تم تأكيد التصنيف المصحح: {file.classification.verified}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Results;