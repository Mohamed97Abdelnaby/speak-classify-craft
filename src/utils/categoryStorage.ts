const STORAGE_KEY = 'userCategories';

const DEFAULT_CATEGORIES = [
  'شكوى من الخدمة',
  'طلب معلومات',
  'استفسار تقني',
  'مشكلة في الفاتورة',
  'طلب إلغاء',
  'مدح وثناء',
  'اقتراح تحسين'
];

export const getUserCategories = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const categories = JSON.parse(stored);
      return Array.isArray(categories) ? categories : [];
    }
  } catch (error) {
    console.error('Error loading user categories:', error);
  }
  return [];
};

export const saveUserCategories = (categories: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving user categories:', error);
  }
};

export const getDefaultCategories = (): string[] => {
  return [...DEFAULT_CATEGORIES];
};