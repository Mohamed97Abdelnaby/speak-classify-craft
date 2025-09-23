const STORAGE_KEY = 'userCategories';

const DEFAULT_CATEGORIES = [
  'عميل متجاوب',
  'عميل واعد',
  'عميل مماطل',
  'عميل يستخدم التلاعب العاطفي والهجوم',
  'عميل من رافض لمتجاوب',
  'عميل غاضب ويتلفظ مسيء',
  'عميل رافض',
  'عميل لا يستطيع'
];

export const getUserCategories = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const categories = JSON.parse(stored);
      return Array.isArray(categories) ? categories : getDefaultCategories();
    }
  } catch (error) {
    console.error('Error loading user categories:', error);
  }
  return getDefaultCategories();
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