import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BatchFile } from "@/types/batch";

interface EmailResultsDialogProps {
  files: BatchFile[];
}

const EmailResultsDialog = ({ files }: EmailResultsDialogProps) => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Transcription and Classification Results");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const generateEmailContent = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    let content = `Transcription and Classification Results\n\n`;
    content += `Total files processed: ${completedFiles.length}\n`;
    content += `Processing date: ${new Date().toLocaleDateString()}\n\n`;
    
    completedFiles.forEach((file, index) => {
      content += `--- File ${index + 1}: ${file.name} ---\n`;
      content += `Summary: ${file.summary || 'No summary available'}\n`;
      content += `Category: ${file.classification?.verified || file.classification?.predicted || 'Unclassified'}\n`;
      if (file.classification?.confidence) {
        content += `Confidence: ${(file.classification.confidence * 100).toFixed(1)}%\n`;
      }
      content += `\n`;
    });
    
    return content;
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Mock email sending - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Results Sent",
        description: `Results have been sent to ${email}`,
      });
      
      setIsOpen(false);
      setEmail("");
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>Email Results</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email Results</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preview">Email Preview</Label>
            <Textarea
              id="preview"
              value={generateEmailContent()}
              readOnly
              className="min-h-[200px] text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailResultsDialog;