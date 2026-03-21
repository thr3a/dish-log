import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { testApiHandler } from 'next-test-api-route-handler';
import * as handler from '@/app/api/meals/[id]/route';
import { s3Mock } from '../helpers/s3Mock';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async (_c: unknown, cmd: { input: { Key: string } }) => `https://mock-s3/${cmd.input.Key}`),
}));

const { mockGetDb, resetFirestoreMock, seedFirestore } = vi.hoisted(() => {
  const store = new Map<string, Map<string, unknown>>();
  let idCounter = 0;

  const resetFirestoreMock = () => {
    store.clear();
    idCounter = 0;
  };

  const seedFirestore = (collection: string, docs: Array<{ id: string } & Record<string, unknown>>) => {
    const col = new Map<string, unknown>();
    for (const { id, ...data } of docs) {
      col.set(id, data);
    }
    store.set(collection, col);
  };

  const getCol = (name: string) => {
    if (!store.has(name)) store.set(name, new Map());
    return store.get(name)!;
  };

  const mockGetDb = () => ({
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => {
          const col = getCol(name);
          const data = col.get(id);
          return {
            exists: col.has(id),
            id,
            data: () => data,
          };
        },
        set: async (data: unknown) => {
          getCol(name).set(id, data);
        },
        delete: async () => {
          getCol(name).delete(id);
        },
      }),
    }),
  });

  return { mockGetDb, resetFirestoreMock, seedFirestore };
});

vi.mock('@/lib/firebase', () => ({ getDb: mockGetDb }));

const baseMeal = {
  title: 'テスト食事',
  category: '昼食',
  mealDate: '2024-01-01',
  description: 'メモ',
  isHomeCooked: false,
  photos: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  resetFirestoreMock();
  s3Mock.reset();
  s3Mock.on(DeleteObjectCommand).resolves({});
});

describe('GET /api/meals/[id]', () => {
  it('存在するIDで 200 を返す', async () => {
    seedFirestore('meals', [{ id: 'meal-abc', ...baseMeal }]);

    await testApiHandler({
      appHandler: handler,
      params: { id: 'meal-abc' },
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.id).toBe('meal-abc');
        expect(body.title).toBe('テスト食事');
      },
    });
  });

  it('存在しないIDで 404 を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      params: { id: 'not-exist' },
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(404);
      },
    });
  });
});

describe('PUT /api/meals/[id]', () => {
  it('更新に成功する', async () => {
    seedFirestore('meals', [{ id: 'meal-abc', ...baseMeal }]);

    await testApiHandler({
      appHandler: handler,
      params: { id: 'meal-abc' },
      async test({ fetch }) {
        const res = await fetch({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '更新後タイトル',
            category: '夕食',
            mealDate: '2024-02-01',
          }),
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.title).toBe('更新後タイトル');
        expect(body.category).toBe('夕食');
      },
    });
  });

  it('削除された写真の S3 Delete が呼ばれる', async () => {
    const mealWithPhoto = {
      ...baseMeal,
      photos: [
        {
          key: 'photos/original.jpg',
          thumbnailKey: 'thumbnails/thumb.jpg',
          width: 800,
          height: 600,
          thumbnailWidth: 320,
          thumbnailHeight: 240,
        },
      ],
    };
    seedFirestore('meals', [{ id: 'meal-abc', ...mealWithPhoto }]);

    await testApiHandler({
      appHandler: handler,
      params: { id: 'meal-abc' },
      async test({ fetch }) {
        // photos を空にして PUT → 既存の写真が削除される
        const res = await fetch({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'テスト食事',
            category: '昼食',
            mealDate: '2024-01-01',
            photos: [],
          }),
        });
        expect(res.status).toBe(200);

        // original と thumbnail の2回 DeleteObjectCommand が呼ばれる
        expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(2);
        const keys = s3Mock
          .commandCalls(DeleteObjectCommand)
          .map((c) => c.args[0].input.Key);
        expect(keys).toContain('photos/original.jpg');
        expect(keys).toContain('thumbnails/thumb.jpg');
      },
    });
  });
});

describe('DELETE /api/meals/[id]', () => {
  it('削除に成功する', async () => {
    seedFirestore('meals', [{ id: 'meal-abc', ...baseMeal }]);

    await testApiHandler({
      appHandler: handler,
      params: { id: 'meal-abc' },
      async test({ fetch }) {
        const res = await fetch({ method: 'DELETE' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
      },
    });
  });

  it('写真付き食事を削除すると S3 Delete が呼ばれる', async () => {
    const mealWithPhoto = {
      ...baseMeal,
      photos: [
        {
          key: 'photos/original.jpg',
          thumbnailKey: 'thumbnails/thumb.jpg',
          width: 800,
          height: 600,
          thumbnailWidth: 320,
          thumbnailHeight: 240,
        },
      ],
    };
    seedFirestore('meals', [{ id: 'meal-with-photo', ...mealWithPhoto }]);

    await testApiHandler({
      appHandler: handler,
      params: { id: 'meal-with-photo' },
      async test({ fetch }) {
        const res = await fetch({ method: 'DELETE' });
        expect(res.status).toBe(200);

        expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(2);
      },
    });
  });
});
