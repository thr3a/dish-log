import { PutObjectCommand } from '@aws-sdk/client-s3';
import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { getPhotoUrl, S3_BUCKET, s3 } from '@/lib/s3';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const key = `photos/${uuidv4()}.${ext}`;
  const thumbnailKey = `thumbnails/${uuidv4()}.jpg`;

  // オリジナル画像のメタデータ取得
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  // サムネイル生成（最大幅320px）
  const thumbnailBuffer = await sharp(buffer)
    .resize({ width: 320, withoutEnlargement: true })
    .jpeg({ quality: 60 })
    .toBuffer();

  const thumbnailMeta = await sharp(thumbnailBuffer).metadata();
  const thumbnailWidth = thumbnailMeta.width ?? 0;
  const thumbnailHeight = thumbnailMeta.height ?? 0;

  // S3へアップロード
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type
    })
  );

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg'
    })
  );

  const url = await getPhotoUrl(key);
  const thumbnailUrl = await getPhotoUrl(thumbnailKey);

  return NextResponse.json({ height, key, thumbnailHeight, thumbnailKey, thumbnailUrl, thumbnailWidth, url, width });
};
