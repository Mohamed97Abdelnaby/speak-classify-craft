import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { BatchFile } from "@/types/batch";

interface EmailResultsDialogProps {
  files: BatchFile[];
}

const EmailResultsDialog = ({ files }: EmailResultsDialogProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(t("defaultEmailSubject"));
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const generateEmailContent = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    let content = `${t("transcriptionClassificationResults")}\n\n`;
    content += `${t("totalFilesProcessed")} ${completedFiles.length}\n`;
    content += `${t("processingDate")} ${new Date().toLocaleDateString()}\n\n`;
    
    completedFiles.forEach((file, index) => {
      content += `--- ${t("fileNumber")} ${index + 1}: ${file.name} ---\n`;
      content += `${t("summaryLabel")} ${file.summary || t("noSummaryAvailable")}\n`;
      content += `${t("categoryLabel")} ${file.classification?.verified || file.classification?.predicted || t("unclassified")}\n`;
      if (file.classification?.confidence) {
        content += `${t("confidenceLabel")} ${(file.classification.confidence * 100).toFixed(1)}%\n`;
      }
      content += `\n`;
    });
    
    return content;
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: t("emailRequired"),
        description: t("pleaseEnterEmail"),
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Mock email sending - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t("resultsSent"),
        description: `${t("resultsSentTo")} ${email}`,
      });
      
      setIsOpen(false);
      setEmail("");
    } catch (error) {
      toast({
        title: t("sendFailed"),
        description: t("failedToSendEmail"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2 space-x-reverse">
          <Mail className="w-4 h-4" />
          <span>{t("emailResults")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("emailResults")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("emailAddress")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("enterEmailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">{t("subject")}</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preview">{t("emailPreview")}</Label>
            <Textarea
              id="preview"
              value={generateEmailContent()}
              readOnly
              className="min-h-[200px] text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? (
              <>{t("sending")}</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t("sendEmail")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailResultsDialog;