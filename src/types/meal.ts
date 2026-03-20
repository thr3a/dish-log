export const mealCategories = ['朝食', '昼食', '夕食', 'その他'] as const;

export type MealCategory = (typeof mealCategories)[number];

export type StoredMealPhoto = {
  height: number;
  key: string;
  thumbnailHeight: number;
  thumbnailKey: string;
  thumbnailWidth: number;
  width: number;
};

export type MealPhoto = StoredMealPhoto & {
  thumbnailUrl: string;
  url: string;
};

export type Meal = {
  category: MealCategory;
  createdAt: string;
  description: string;
  id: string;
  isHomeCooked: boolean;
  mealDate: string;
  photos: MealPhoto[];
  title: string;
  updatedAt: string;
};

export type StoredMeal = Omit<Meal, 'id' | 'photos'> & {
  photos: StoredMealPhoto[];
};

export type MealFormValues = {
  category: MealCategory;
  description: string;
  isHomeCooked: boolean;
  mealDate: string;
  title: string;
};
