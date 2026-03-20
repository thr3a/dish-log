import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const isProduction = process.env.NODE_ENV === 'production';

export const s3 = new S3Client({
  region: 'ap-northeast-1'
});

export const S3_BUCKET = isProduction ? (process.env.AWS_S3_BUCKET ?? '') : (process.env.AWS_S3_DEV_BUCKET ?? '');

export const getPhotoUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
};
