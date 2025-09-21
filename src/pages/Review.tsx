import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { BatchFile } from "@/types/batch";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Review = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const { toast } = useToast();
  const batchId = searchParams.get('batch');

  useEffect(() => {
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
          setFiles(batchData.files || []);
        } else {
          console.error('No batch data found for:', batchId);
          navigate("/");
        }
      } catch (error) {
        console.error('Failed to load batch data:', error);
        navigate("/");
      }
    };
    
    loadBatchData();
  }, [batchId, navigate]);

  const downloadCSV = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.transcription);
    
    if (completedFiles.length === 0) {
      toast({
        title: t("noResultsFound"),
        description: t("noResultsToDownload"),
        variant: "destructive",
      });
      return;
    }

    const headers = [t("callId"), t("fileName"), t("transcribedText"), t("classification"), 'الثقة'];
    const csvContent = [
      headers.join(','),
      ...completedFiles.map(file => {
        const row = [
          file.id,
          `"${file.name}"`,
          `"${(file.transcription || '').replace(/"/g, '""')}"`,
          file.classification?.predicted || '',
          file.classification?.confidence || ''
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `classification-results-${batchId}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t("success"),
      description: t("resultsDownloaded"),
    });
  };

  const completedFiles = files.filter(f => f.status === 'completed' && f.transcription);

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <p className="text-muted-foreground">No classification results found.</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
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
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToHome")}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("classificationResults")}
              </h1>
              <p className="text-muted-foreground">
                {t("resultsDesc")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="flex items-center space-x-2 space-x-reverse"
              disabled={completedFiles.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>{t("downloadResults")}</span>
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2 space-x-reverse"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("startOver")}</span>
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8 p-4 bg-muted/20 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Classification Complete</p>
              <p className="text-2xl font-bold text-primary">{completedFiles.length}</p>
              <p className="text-sm text-muted-foreground">
                {completedFiles.length === 1 ? 'Call classified' : 'Calls classified'}
              </p>
            </div>
            {completedFiles.length > 0 && (
              <Badge variant="default" className="text-sm">
                Ready for Export
              </Badge>
            )}
          </div>
        </div>

        {/* Results Table */}
        {completedFiles.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الملف</TableHead>
                  <TableHead className="text-right">النص المكتوب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium text-right">
                      {file.name}
                    </TableCell>
                    <TableCell className="text-right max-w-2xl">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed p-2">
                        {file.transcription || 'لا يوجد نص متاح'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No completed classifications found. Processing may still be in progress.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Results
            </Button>
          </div>
        )}
        
        {/* Classification Actions */}
        {completedFiles.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-muted/20 rounded-lg border p-6 min-w-[300px] text-center">
              <Button
                size="lg"
                onClick={() => {
                  toast({
                    title: "التصنيف",
                    description: "سيتم إضافة وظيفة التصنيف قريباً",
                  });
                }}
                className="text-lg px-8"
              >
                صنف
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Review;