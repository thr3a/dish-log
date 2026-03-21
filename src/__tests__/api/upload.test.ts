import { PutObjectCommand } from '@aws-sdk/client-s3';
import { testApiHandler } from 'next-test-api-route-handler';
import * as handler from '@/app/api/upload/route';
import { s3Mock } from '../helpers/s3Mock';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async (_c: unknown, cmd: { input: { Key: string } }) => `https://mock-s3/${cmd.input.Key}`)
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    metadata: vi.fn(async () => ({ width: 800, height: 600 })),
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn(async () => Buffer.from('thumbnail-data'))
  }))
}));

beforeEach(() => {
  s3Mock.reset();
  s3Mock.on(PutObjectCommand).resolves({});
});

describe('POST /api/upload', () => {
  it('ファイルなしで 400 を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const formData = new FormData();
        const res = await fetch({
          method: 'POST',
          body: formData
        });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBeDefined();
      }
    });
  });

  it('有効なファイルで 200 を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const formData = new FormData();
        const file = new File([Buffer.from('fake-image-data')], 'test.jpg', { type: 'image/jpeg' });
        formData.append('file', file);

        const res = await fetch({
          method: 'POST',
          body: formData
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.key).toMatch(/^photos\//);
        expect(body.thumbnailKey).toMatch(/^thumbnails\//);
        expect(body.url).toMatch(/^https:\/\/mock-s3\//);
        expect(body.thumbnailUrl).toMatch(/^https:\/\/mock-s3\//);
        expect(body.width).toBe(800);
        expect(body.height).toBe(600);
      }
    });
  });

  it('S3 PutObjectCommand が 2 回呼ばれる', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const formData = new FormData();
        const file = new File([Buffer.from('fake-image-data')], 'photo.jpg', { type: 'image/jpeg' });
        formData.append('file', file);

        await fetch({ method: 'POST', body: formData });

        expect(s3Mock.commandCalls(PutObjectCommand)).toHaveLength(2);
      }
    });
  });
});
