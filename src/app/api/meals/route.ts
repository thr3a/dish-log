import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/firebase';
import { getPhotoUrl } from '@/lib/s3';
import type { Meal, MealPhoto, StoredMeal, StoredMealPhoto } from '@/types/meal';
import { mealCategories } from '@/types/meal';

export const dynamic = 'force-dynamic';

// 写真オブジェクトのバリデーションスキーマ
const storedMealPhotoSchema = z.object({
  height: z.number(),
  key: z.string(),
  thumbnailHeight: z.number(),
  thumbnailKey: z.string(),
  thumbnailWidth: z.number(),
  width: z.number()
});

// POST リクエストボディのバリデーションスキーマ
const postBodySchema = z.object({
  category: z.enum(mealCategories),
  description: z.string().optional(),
  isHomeCooked: z.boolean().optional(),
  mealDate: z.string(),
  photos: z.array(storedMealPhotoSchema).optional(),
  title: z.string()
});

const enrichPhotos = async (storedPhotos: StoredMealPhoto[]): Promise<MealPhoto[]> =>
  Promise.all(
    storedPhotos.map(async (p) => ({
      ...p,
      thumbnailUrl: await getPhotoUrl(p.thumbnailKey),
      url: await getPhotoUrl(p.key)
    }))
  );

export const GET = async () => {
  const snapshot = await db.collection('meals').orderBy('mealDate', 'desc').get();

  const meals: Meal[] = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as StoredMeal;
      return {
        ...data,
        id: doc.id,
        photos: await enrichPhotos(data.photos ?? [])
      };
    })
  );

  return NextResponse.json(meals);
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const body = await request.json();
  const result = postBodySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const now = new Date().toISOString();
  const stored: StoredMeal = {
    category: result.data.category,
    createdAt: now,
    description: result.data.description ?? '',
    isHomeCooked: result.data.isHomeCooked ?? false,
    mealDate: result.data.mealDate,
    photos: (result.data.photos ?? []).map((p) => ({
      height: p.height,
      key: p.key,
      thumbnailHeight: p.thumbnailHeight,
      thumbnailKey: p.thumbnailKey,
      thumbnailWidth: p.thumbnailWidth,
      width: p.width
    })),
    title: result.data.title,
    updatedAt: now
  };

  const ref = await db.collection('meals').add(stored);

  const meal: Meal = {
    ...stored,
    id: ref.id,
    photos: await enrichPhotos(stored.photos)
  };

  return NextResponse.json(meal, { status: 201 });
};
