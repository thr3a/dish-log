import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { testApiHandler } from 'next-test-api-route-handler';
import * as handler from '@/app/api/meals/route';
import { s3Mock } from '../helpers/s3Mock';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async (_c: unknown, cmd: { input: { Key: string } }) => `https://mock-s3/${cmd.input.Key}`)
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
    const col = store.get(name);
    if (!col) throw new Error(`Collection "${name}" not found`);
    return col;
  };

  const mockGetDb = () => ({
    collection: (name: string) => ({
      add: async (data: unknown) => {
        const id = `doc-${++idCounter}`;
        getCol(name).set(id, data);
        return { id };
      },
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
        get: async () => {
          const entries = Array.from(getCol(name).entries());
          entries.sort(([, a], [, b]) => {
            const av = String((a as Record<string, unknown>)[field]);
            const bv = String((b as Record<string, unknown>)[field]);
            if (av === bv) return 0;
            const cmp = av < bv ? -1 : 1;
            return direction === 'desc' ? -cmp : cmp;
          });
          return {
            docs: entries.map(([docId, data]) => ({
              id: docId,
              data: () => data
            }))
          };
        }
      })
    })
  });

  return { mockGetDb, resetFirestoreMock, seedFirestore };
});

vi.mock('@/lib/firebase', () => ({ getDb: mockGetDb }));

beforeEach(() => {
  resetFirestoreMock();
  s3Mock.reset();
  s3Mock.on(DeleteObjectCommand).resolves({});
});

describe('GET /api/meals', () => {
  it('0件のとき空配列を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual([]);
      }
    });
  });

  it('複数件を mealDate 降順で返す', async () => {
    seedFirestore('meals', [
      {
        id: 'meal-1',
        title: '朝食',
        category: '朝食',
        mealDate: '2024-01-01',
        description: '',
        isHomeCooked: false,
        photos: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'meal-2',
        title: '昼食',
        category: '昼食',
        mealDate: '2024-01-03',
        description: '',
        isHomeCooked: true,
        photos: [],
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z'
      },
      {
        id: 'meal-3',
        title: '夕食',
        category: '夕食',
        mealDate: '2024-01-02',
        description: '',
        isHomeCooked: false,
        photos: [],
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      }
    ]);

    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(3);
        expect(body[0].mealDate).toBe('2024-01-03');
        expect(body[1].mealDate).toBe('2024-01-02');
        expect(body[2].mealDate).toBe('2024-01-01');
      }
    });
  });
});

describe('POST /api/meals', () => {
  it('正常なデータで 201 を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'テスト朝食',
            category: '朝食',
            mealDate: '2024-01-01',
            isHomeCooked: true
          })
        });
        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.title).toBe('テスト朝食');
        expect(body.id).toBeDefined();
        expect(body.photos).toEqual([]);
      }
    });
  });

  it('title なしで 400 を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: '朝食',
            mealDate: '2024-01-01'
          })
        });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.errors).toBeDefined();
      }
    });
  });
});
