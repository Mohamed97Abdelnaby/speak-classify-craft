import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { BatchFile } from "@/types/batch";
import { useToast } from "@/hooks/use-toast";

const Review = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const { toast } = useToast();
  const batchId = searchParams.get('batch');

  useEffect(() => {
    // Load batch data from localStorage
    const batchData = localStorage.getItem(`batch-${batchId}`);
    if (batchData) {
      const batch = JSON.parse(batchData);
      setFiles(batch.files || []);
    } else {
      // Redirect if no batch data found
      navigate("/");
    }
  }, [batchId, navigate]);

  const downloadCSV = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.classification);
    
    if (completedFiles.length === 0) {
      toast({
        title: "No Results",
        description: "No completed classifications available for download.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Call ID', 'File Name', 'Summary', 'Classification', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...completedFiles.map(file => {
        const row = [
          file.id,
          `"${file.name}"`,
          `"${(file.summary || '').replace(/"/g, '""')}"`,
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
      title: "Export Successful",
      description: "Classification results downloaded successfully.",
    });
  };

  const completedFiles = files.filter(f => f.status === 'completed' && f.classification);

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
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Classification Results
              </h1>
              <p className="text-muted-foreground">
                Review and download your AI-powered call classifications
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="flex items-center space-x-2"
              disabled={completedFiles.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Download Results</span>
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over</span>
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
                  <TableHead>Call ID</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      {file.name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={file.summary}>
                        {file.summary || 'No summary available'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          {file.classification?.predicted || 'Unknown'}
                        </Badge>
                        {file.classification?.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(file.classification.confidence * 100)}%
                          </Badge>
                        )}
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
      </main>
    </div>
  );
};

export default Review;