import { Button } from "@/components/ui/button";
import { 
  Mic, 
  History, 
  Settings, 
  Home,
  Tags
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Navigation = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: t("dashboard"), icon: Home },
    { id: "categories", label: t("categories"), icon: Tags },
    { id: "history", label: t("history"), icon: History },
    { id: "settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("appName")}</h1>
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;