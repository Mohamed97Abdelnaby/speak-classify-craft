import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Mail, Clock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const EmailOption = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const batchId = searchParams.get("batch");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendByEmail = async () => {
    if (!email.trim()) {
      toast({
        title: t("error"),
        description: t("invalidEmail"),
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: t("error"),
        description: t("invalidEmail"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get batch data from localStorage
      const batchData = localStorage.getItem(`batch-${batchId}`);
      if (!batchData) {
        throw new Error("Batch data not found");
      }

      const batch = JSON.parse(batchData);
      
      // Call send-email API endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          batchId,
          files: batch.files,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: t("success"),
        description: t("emailSent"),
      });

      // Show success message and option to return home
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: t("error"),
        description: t("error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutEmail = () => {
    navigate(`/processing?batch=${batchId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("processingOptions")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {t("processingDesc")}
            </p>
          </div>

          {/* Email Option Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gap-x-reverse">
                <Mail className="h-5 w-5" />
                {t("sendByEmail")}
              </CardTitle>
              <CardDescription>
                {t("enterEmail")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("enterEmail")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSendByEmail}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  {t("sendByEmail")}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleContinueWithoutEmail}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t("continueWithoutEmail")}
                </Button>
              </div>
              
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default EmailOption;