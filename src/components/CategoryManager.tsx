import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit2,
  Save,
  X,
  Tags
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const CategoryManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [categories, setCategories] = useState([t("businessMeeting")]);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      toast({
        title: t("success"),
        description: t("categoryAdded"),
      });
    } else if (categories.includes(newCategory.trim())) {
      toast({
        title: t("warning"),
        description: t("categoryExists"),
        variant: "destructive",
      });
    }
  };

  const deleteCategory = (index: number) => {
    const categoryName = categories[index];
    setCategories(categories.filter((_, i) => i !== index));
    toast({
      title: t("success"),
      description: t("categoryDeleted"),
    });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newCategories = [...categories];
      newCategories[editingIndex] = editingValue.trim();
      setCategories(newCategories);
      setEditingIndex(null);
      setEditingValue("");
      toast({
        title: t("success"),
        description: t("categoryUpdated"),
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Tags className="w-5 h-5 text-primary" />
          <span>{t("classificationCategories")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Category */}
        <div className="flex space-x-2 space-x-reverse">
          <Input
            placeholder={t("addNewCategory")}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            className="flex-1"
          />
          <Button 
            onClick={addCategory} 
            disabled={!newCategory.trim()}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 ml-1" />
            {t("addCategory")}
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            الفئات الحالية ({categories.length})
          </h3>
          <div className="grid gap-3">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-card-hover transition-colors"
              >
                {editingIndex === index ? (
                  <div className="flex items-center space-x-2 space-x-reverse flex-1">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      onClick={saveEdit}
                      size="sm"
                      variant="outline"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Badge variant="secondary" className="text-sm">
                        {category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Button
                        onClick={() => startEditing(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteCategory(index)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Tags className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("noCategories")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;