import Navigation from "@/components/Navigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import CategoryManager from "@/components/CategoryManager";
import TextClassifier from "@/components/TextClassifier";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Settings, Zap, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const Voice = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("recordOrUpload")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("recordUploadDesc")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("aiProcessing")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("aiProcessingDesc")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("customCategories")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("customCategoriesDesc")}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("textInput")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("textClassifierDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Voice Input Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("audioInput")}</h2>
            <VoiceRecorder />
          </div>

          {/* Text Input Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("textInput")}</h2>
            <TextClassifier />
          </div>

          {/* Category Management Section */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("classificationCategories")}</h2>
            <CategoryManager />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Voice;