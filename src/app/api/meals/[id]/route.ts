import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase';
import { getPhotoUrl, S3_BUCKET, s3 } from '@/lib/s3';
import type { Meal, MealPhoto, StoredMeal, StoredMealPhoto } from '@/types/meal';

type RouteParams = { params: Promise<{ id: string }> };

const enrichPhotos = async (storedPhotos: StoredMealPhoto[]): Promise<MealPhoto[]> =>
  Promise.all(
    storedPhotos.map(async (p) => ({
      ...p,
      thumbnailUrl: await getPhotoUrl(p.thumbnailKey),
      url: await getPhotoUrl(p.key)
    }))
  );

export const GET = async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const doc = await db.collection('meals').doc(id).get();

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

export const PUT = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const doc = await db.collection('meals').doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: '食事が見つかりません' }, { status: 404 });
  }

  const body = await request.json();
  const existing = doc.data() as StoredMeal;
  const newPhotoKeys = new Set((body.photos ?? []).map((p: MealPhoto) => p.key));

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
    category: body.category,
    createdAt: existing.createdAt,
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

  await db.collection('meals').doc(id).set(updated);

  const meal: Meal = {
    ...updated,
    id,
    photos: await enrichPhotos(updated.photos)
  };

  return NextResponse.json(meal);
};

export const DELETE = async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const doc = await db.collection('meals').doc(id).get();

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

  await db.collection('meals').doc(id).delete();

  return NextResponse.json({ success: true });
};
