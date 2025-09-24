import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import TranscriptionResults from "@/components/TranscriptionResults";
import EmailResultsDialog from "@/components/EmailResultsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle, FileText, Clock, Target, MessageSquare, TrendingUp, Copy, ThumbsUp, ThumbsDown, AlertCircle, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BatchFile } from "@/types/batch";
import { getBatchData } from "@/utils/indexedDbStorage";
import { deserializeBatchData } from "@/utils/fileSerializer";
import { useTranslation } from "react-i18next";
import { getUserCategories } from "@/utils/categoryStorage";
import { updateSatisfactionResponse, updateVerifiedClassification, updateFinalClassification, saveTranscriptionResult } from "@/services/transcriptionStorageService";
const Results = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [satisfactionAnswers, setSatisfactionAnswers] = useState<Record<string, 'satisfied' | 'not-satisfied' | null>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const {
    toast
  } = useToast();
  const batchId = searchParams.get('batch');

  // Get current active file
  const currentFile = files[activeFileIndex];

  // Helper functions
  const getStatusColor = (fileId: string) => {
    const satisfaction = satisfactionAnswers[fileId];
    const file = files.find(f => f.id === fileId);
    if (satisfaction === 'satisfied') return 'status-satisfied';
    if (satisfaction === 'not-satisfied' && file?.classification?.verified) return 'status-verified';
    if (satisfaction === 'not-satisfied') return 'status-pending';
    return 'bg-muted';
  };
  const getStatusIcon = (fileId: string) => {
    const satisfaction = satisfactionAnswers[fileId];
    const file = files.find(f => f.id === fileId);
    if (satisfaction === 'satisfied') return CheckCircle;
    if (satisfaction === 'not-satisfied' && file?.classification?.verified) return Target;
    if (satisfaction === 'not-satisfied') return AlertCircle;
    return Clock;
  };
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ ✨",
        description: `تم نسخ ${label} إلى الحافظة`
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ النص",
        variant: "destructive"
      });
    }
  };
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
    setFiles(prev => prev.map(file => file.id === fileId ? {
      ...file,
      classification: {
        ...file.classification!,
        verified: verifiedCategory
      }
    } : file));

    // Update localStorage
    if (batchId) {
      const batchData = {
        id: batchId,
        files: files.map(file => file.id === fileId ? {
          ...file,
          classification: {
            ...file.classification!,
            verified: verifiedCategory
          }
        } : file),
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
              description: `${t("categoryVerifiedAs")} "${verifiedCategory}"`
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
    if (files.length > 0) {
      // Import and use beautiful download service for batch export
      import("@/services/beautifulDownloadService").then(({
        downloadBeautifulResults
      }) => {
        downloadBeautifulResults(files, `voice-ai-batch-${Date.now()}.html`, true);
      });
      toast({
        title: "🎨 تم بدء التحميل",
        description: "تم تحميل تقرير الدفعة بتصميم جميل وملون!"
      });
    }
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
    if (response === 'satisfied') {
      // User is satisfied with AI classification - only show UI feedback, don't save to database
      toast({
        title: t("success"),
        description: "شكرًا لك! تم تأكيد التصنيف"
      });
    }
    // If not satisfied, don't save yet - wait for user to select category
  };

  // If no batch data, show single file results (legacy)
  if (!batchId || files.length === 0) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="flex items-center space-x-2 space-x-reverse">
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
              <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center space-x-2 space-x-reverse">
                <Share2 className="w-4 h-4" />
                <span>{t("share")}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center space-x-2 space-x-reverse">
                <Download className="w-4 h-4" />
                <span>{t("export")}</span>
              </Button>
              <Button onClick={handleNewTranscription} className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2 space-x-reverse">
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
      </div>;
  }
  return <div className="min-h-screen bg-gradient-secondary">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="flex items-center space-x-2 space-x-reverse hover:shadow-md transition-all">
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToVoiceInput")}</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t("batchResults")} ({files.length} {files.length === 1 ? t("file") : t("files")})
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("reviewAndVerifyResults")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <EmailResultsDialog files={files} />
            <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center space-x-2 space-x-reverse hover:shadow-md transition-all">
              <Download className="w-4 h-4" />
              <span>{t("export")}</span>
            </Button>
            <Button onClick={handleNewTranscription} className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2 space-x-reverse shadow-glow">
              <RotateCcw className="w-4 h-4" />
              <span>{t("newBatch")}</span>
            </Button>
          </div>
        </div>

        {/* Enhanced File Navigation with Tabs */}
        <div className="mb-8">
          <Tabs value={activeFileIndex.toString()} onValueChange={value => setActiveFileIndex(parseInt(value))}>
            <TabsList className="w-full h-auto p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-md">
              <div className="flex overflow-x-auto gap-2 w-full py-[30px]">
                {files.map((file, index) => {
                const StatusIcon = getStatusIcon(file.id);
                const statusColor = getStatusColor(file.id);
                return <TabsTrigger key={file.id} value={index.toString()} className="flex-shrink-0 min-w-[200px] h-16 p-4 flex flex-col items-start gap-1 text-left data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-primary/20 transition-all hover:scale-105 py-[3px]">
                      <div className="flex items-center gap-2 w-full">
                        <div className={`w-3 h-3 rounded-full ${statusColor} flex items-center justify-center`}>
                          <StatusIcon className="w-2 h-2 text-white" />
                        </div>
                        <span className="font-medium text-sm truncate flex-1">
                          ملف {index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate w-full">
                        {file.name}
                      </p>
                    </TabsTrigger>;
              })}
              </div>
            </TabsList>

            {/* File Content */}
            {files.map((file, index) => <TabsContent key={file.id} value={index.toString()} className="mt-6 fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column - File Info & Classification */}
                  <div className="space-y-6">
                    
                    {/* File Information Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 bg-gradient-accent">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl arabic-text flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          معلومات الملف
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">اسم الملف</p>
                            <p className="text-base font-semibold truncate">{file.name}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(file.name, "اسم الملف")} className="hover:bg-primary/10">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(file.id)}`} />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                              <Badge variant="default" className="bg-success/10 text-success border-success/20">
                                مكتمل
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {file.category && <div className="p-3 bg-background/60 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-1">التصنيف الأصلي</p>
                            <Badge variant="outline" className="bg-muted/50">
                              {file.category}
                            </Badge>
                          </div>}
                      </CardContent>
                    </Card>

                    {/* AI Classification Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 bg-gradient-primary text-primary-foreground">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl arabic-text flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          التصنيف الذكي
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm opacity-90">التصنيف المقترح</span>
                            {file.classification?.confidence}
                          </div>
                          <p className="text-xl font-bold">
                            {file.classification?.aiClassification || file.classification?.predicted || 'لم يتم التصنيف بعد'}
                          </p>
                          {file.classification?.confidence && <div className="mt-3">
                              
                              <Progress value={file.classification.confidence * 100} className="h-2 bg-white/20" />
                            </div>}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Satisfaction Survey */}
                    {!satisfactionAnswers[file.id] && <Card className="shadow-lg border-2 border-dashed border-primary/30 bg-gradient-accent">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                              <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold arabic-text">
                              {t('satisfactionQuestion')}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              هل توافق على تصنيف الذكاء الاصطناعي لهذا الملف؟
                            </p>
                            <div className="flex gap-3 justify-center">
                              <Button onClick={() => handleSatisfactionResponse(file.id, 'satisfied')} className="bg-success hover:bg-success/90 text-success-foreground shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4" />
                                موافق
                              </Button>
                              <Button onClick={() => handleSatisfactionResponse(file.id, 'not-satisfied')} variant="outline" className="border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 transition-all flex items-center gap-2">
                                <ThumbsDown className="w-4 h-4" />
                                غير موافق
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>}

                    {/* Satisfaction Response Display */}
                    {satisfactionAnswers[file.id] === 'satisfied' && <Card className="shadow-lg border border-success/20 bg-success/5">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 mx-auto bg-success rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-success arabic-text">
                              تم تأكيد التصنيف
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              شكرًا لك! تم قبول تصنيف الذكاء الاصطناعي
                            </p>
                          </div>
                        </CardContent>
                      </Card>}

                    {/* Category Selection for Not Satisfied */}
                    {satisfactionAnswers[file.id] === 'not-satisfied' && !file.classification?.verified && <Card className="shadow-lg border border-warning/20 bg-warning/5">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto bg-warning rounded-full flex items-center justify-center mb-3">
                                <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold arabic-text">
                                اختر التصنيف الصحيح
                              </h3>
                              <p className="text-muted-foreground text-sm mt-1">
                                يرجى اختيار التصنيف المناسب لهذا الملف
                              </p>
                            </div>
                            <Select onValueChange={value => updateFileVerification(file.id, value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر التصنيف الصحيح" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(category => <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>}

                    {/* Verification Confirmation */}
                    {satisfactionAnswers[file.id] === 'not-satisfied' && file.classification?.verified && <Card className="shadow-lg border border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary arabic-text">
                              تم التحقق من التصنيف
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              التصنيف الصحيح: <span className="font-semibold text-primary">{file.classification.verified}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>}
                  </div>

                  {/* Right Column - Transcription */}
                  <div className="space-y-6">
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 bg-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl arabic-text flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            ملخص المحادثة
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(file.summary || file.transcription || '', "النص")} className="hover:bg-primary/10">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-6 bg-gradient-secondary rounded-xl max-h-[600px] overflow-y-auto border border-border/20">
                          <div className="prose prose-sm max-w-none" dir="rtl">
                            <p className="text-base leading-relaxed whitespace-pre-wrap arabic-text">
                              {file.summary || file.transcription || 'لا يوجد نص مستخرج'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>)}
          </Tabs>
        </div>
      </main>
    </div>;
};
export default Results;