import { Button } from "@/components/ui/button";
import { 
  Mic, 
  History, 
  Settings, 
  Home,
  Tags,
  FolderOpen
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home, path: "/" },
    { id: "batch", label: "Batch Upload", icon: FolderOpen, path: "/batch-upload" },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">VoiceAI</h1>
            <p className="text-sm text-muted-foreground">Transcribe & Classify</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavClick(item)}
                className="flex items-center space-x-2"
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