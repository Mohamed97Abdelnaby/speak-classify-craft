import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Copy, 
  Download,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const TranscriptionResults = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [satisfactionResponse, setSatisfactionResponse] = useState<'satisfied' | 'not-satisfied' | null>(null);
  const [verifiedCategory, setVerifiedCategory] = useState<string>("");

  // Mock data - this would come from the AI service
  const mockTranscription = "Hello, this is a sample transcription of the voice recording. The AI has processed the audio and converted it to text with high accuracy. This text will then be sent to the classification service to determine the appropriate category based on the user's predefined classes.";
  
  const mockClassification = {
    category: "Business Meeting",
    confidence: 0.92,
    alternativeCategories: [
      { name: "Project Discussion", confidence: 0.78 },
      { name: "Client Call", confidence: 0.65 }
    ]
  };

  const mockMetadata = {
    duration: "00:01:23",
    processingTime: "2.3s",
    tokenCount: 87,
    maxTokens: 500
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transcription text has been copied.",
    });
  };

  const downloadResults = () => {
    const data = {
      transcription: mockTranscription,
      classification: mockClassification,
      metadata: mockMetadata,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Results have been downloaded as JSON file.",
    });
  };

  const handleSatisfactionResponse = (response: 'satisfied' | 'not-satisfied') => {
    setSatisfactionResponse(response);
  };

  const categories = [
    "عميل متجاوب",
    "عميل واعد", 
    "عميل مماطل",
    "عميل يستخدم التلاعب العاطفي والهجوم",
    "عميل من رافض لمتجاوب",
    "عميل غاضب ويتلفظ مسيء",
    "عميل رافض",
    "عميل لا يستطيع"
  ];

  return (
    <div className="space-y-6">
      {/* Classification Results */}
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-success">
            <Zap className="w-5 h-5" />
            <span>Classification Result</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className="text-lg px-4 py-2 bg-success text-success-foreground"
            >
              {mockClassification.category}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-success">
                {Math.round(mockClassification.confidence * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Confidence</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Alternative Categories</h4>
            <div className="flex flex-wrap gap-2">
              {mockClassification.alternativeCategories.map((alt, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {alt.name} ({Math.round(alt.confidence * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Transcription</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => copyToClipboard(mockTranscription)}
                size="sm"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                onClick={downloadResults}
                size="sm"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{mockTranscription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>Processing Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium">{mockMetadata.duration}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Processing Time</div>
              <div className="font-medium">{mockMetadata.processingTime}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Token Count</div>
              <div className="font-medium">{mockMetadata.tokenCount}/{mockMetadata.maxTokens}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <Badge variant="secondary" className="bg-success text-success-foreground">
                Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Classification - Only show if not satisfied or no response yet */}
      {(satisfactionResponse === null || satisfactionResponse === 'not-satisfied') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تأكيد التصنيف</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={verifiedCategory}
              onValueChange={setVerifiedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Satisfaction Survey */}
      {!satisfactionResponse && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">{t('satisfactionQuestion')}</h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => handleSatisfactionResponse('satisfied')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  variant={satisfactionResponse === 'satisfied' ? 'default' : 'outline'}
                >
                  {t('yesSatisfied')}
                </Button>
                <Button
                  onClick={() => handleSatisfactionResponse('not-satisfied')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  variant={satisfactionResponse === 'not-satisfied' ? 'default' : 'outline'}
                >
                  {t('notSatisfied')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranscriptionResults;