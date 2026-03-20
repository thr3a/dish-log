import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/lib/firebase';
import { getPhotoUrl, S3_BUCKET, s3 } from '@/lib/s3';
import type { Meal, MealPhoto, StoredMeal, StoredMealPhoto } from '@/types/meal';
import { mealCategories } from '@/types/meal';

type RouteParams = { params: Promise<{ id: string }> };

// 写真オブジェクトのバリデーションスキーマ
const storedMealPhotoSchema = z.object({
  height: z.number(),
  key: z.string(),
  thumbnailHeight: z.number(),
  thumbnailKey: z.string(),
  thumbnailWidth: z.number(),
  width: z.number()
});

// PUT リクエストボディのバリデーションスキーマ
const putBodySchema = z.object({
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

export const GET = async (_req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
  const { id } = await params;
  const doc = await getDb().collection('meals').doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: '食事が見つかりません' }, { status: 404 });
  }

  const data = doc.data() as StoredMeal;
  const meal: Meal = {
    ...data,
    id: doc.id,
    photos: await enrichPhotos(data.photos ?? [])
  };

  return NextResponse.json(meal);
};

export const PUT = async (request: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
  const { id } = await params;
  const doc = await getDb().collection('meals').doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: '食事が見つかりません' }, { status: 404 });
  }

  const body = await request.json();
  const result = putBodySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const existing = doc.data() as StoredMeal;
  const newPhotoKeys = new Set((result.data.photos ?? []).map((p) => p.key));

  // 削除された写真をS3から削除
  const removedPhotos = existing.photos.filter((p) => !newPhotoKeys.has(p.key));
  await Promise.all(
    removedPhotos.flatMap((p) => [
      s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: p.key })),
      s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: p.thumbnailKey }))
    ])
  );

  const now = new Date().toISOString();
  const updated: StoredMeal = {
    category: result.data.category,
    createdAt: existing.createdAt,
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

  await getDb().collection('meals').doc(id).set(updated);

  const meal: Meal = {
    ...updated,
    id,
    photos: await enrichPhotos(updated.photos)
  };

  return NextResponse.json(meal);
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
  const { id } = await params;
  const doc = await getDb().collection('meals').doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: '食事が見つかりません' }, { status: 404 });
  }

  const data = doc.data() as StoredMeal;

  // S3から写真を削除
  await Promise.all(
    data.photos.flatMap((p) => [
      s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: p.key })),
      s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: p.thumbnailKey }))
    ])
  );

  await getDb().collection('meals').doc(id).delete();

  return NextResponse.json({ success: true });
};
