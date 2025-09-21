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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-muted/20 rounded-lg border p-6 min-w-[300px] text-center">
        <div className="flex items-center justify-center gap-4">
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
          <Badge variant="outline" className="text-lg px-3 py-1">
            86%
          </Badge>
          <Badge variant="secondary" className="text-sm">
            غير مصنف
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Review;