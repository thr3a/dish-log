import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase';
import { getPhotoUrl } from '@/lib/s3';
import type { Meal, MealPhoto, StoredMeal, StoredMealPhoto } from '@/types/meal';

export const dynamic = 'force-dynamic';

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

export const POST = async (request: Request) => {
  const body = await request.json();
  const now = new Date().toISOString();

  const stored: StoredMeal = {
    category: body.category,
    createdAt: now,
    description: body.description ?? '',
    isHomeCooked: body.isHomeCooked ?? false,
    mealDate: body.mealDate,
    photos: (body.photos ?? []).map((p: MealPhoto) => ({
      height: p.height,
      key: p.key,
      thumbnailHeight: p.thumbnailHeight,
      thumbnailKey: p.thumbnailKey,
      thumbnailWidth: p.thumbnailWidth,
      width: p.width
    })),
    title: body.title,
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
