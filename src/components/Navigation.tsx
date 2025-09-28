import { Button } from "@/components/ui/button";
import { Mic, History, Settings, Home, Tags } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
const Navigation = () => {
  const {
    t
  } = useTranslation();
  const [activeTab, setActiveTab] = useState("home");
  const navItems = [{
    id: "home",
    label: t("dashboard"),
    icon: Home
  }, {
    id: "categories",
    label: t("categories"),
    icon: Tags
  }, {
    id: "history",
    label: t("history"),
    icon: History
  }, {
    id: "settings",
    label: t("settings"),
    icon: Settings
  }];
  return <nav className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <img src="/lovable-uploads/70f33e12-6580-4eee-a10c-9640e2924352.png" alt="RAYA Information Technology" className="h-12 w-auto" />
          
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          {navItems.map(item => {
          const Icon = item.icon;
          return <Button key={item.id} variant={activeTab === item.id ? "default" : "ghost"} size="sm" onClick={() => setActiveTab(item.id)} className="flex items-center space-x-2 space-x-reverse">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>;
        })}
        </div>
      </div>
    </nav>;
};
export default Navigation;