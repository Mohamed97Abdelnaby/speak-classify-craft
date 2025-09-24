const STORAGE_KEY = 'userCategories';

const DEFAULT_CATEGORIES = [
  'عميل متجاوب',
  'عميل واعد',
  'عميل مماطل',
  'عميل يستخدم التلاعب العاطفي والهجوم',
  'عميل من رافض لمتجاوب',
  'عميل غاضب ويتلفظ بشكل مسيء',
  'عميل رافض',
  'عميل لا يستطيع'
];

export const getUserCategories = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Stored categories in localStorage:', stored);
    if (stored) {
      const categories = JSON.parse(stored);
      console.log('Parsed categories:', categories);
      const result = Array.isArray(categories) ? categories : getDefaultCategories();
      console.log('Returning categories:', result);
      return result;
    }
  } catch (error) {
    console.error('Error loading user categories:', error);
  }
  const defaultCats = getDefaultCategories();
  console.log('Returning default categories:', defaultCats);
  return defaultCats;
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

export const resetToDefaultCategories = (): string[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Categories reset to default');
    return getDefaultCategories();
  } catch (error) {
    console.error('Error resetting categories:', error);
    return getDefaultCategories();
  }
};