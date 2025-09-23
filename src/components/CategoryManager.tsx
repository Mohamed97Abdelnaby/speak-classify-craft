import { useState, useEffect } from "react";
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
import { getUserCategories, saveUserCategories } from "@/utils/categoryStorage";

const CategoryManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    setCategories(getUserCategories());
  }, []);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      saveUserCategories(updatedCategories);
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
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    saveUserCategories(updatedCategories);
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
      saveUserCategories(newCategories);
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

  return null;
};

export default CategoryManager;