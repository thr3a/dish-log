/**
 * Firestoreインメモリモックのファクトリ
 *
 * 使い方（各テストファイルで vi.hoisted() を使って定義する）:
 *
 * ```ts
 * const { mockGetDb, resetFirestoreMock, seedFirestore } = vi.hoisted(() => {
 *   const store = new Map<string, Map<string, unknown>>();
 *   let idCounter = 0;
 *   // ... (以下の実装をコピー)
 *   return { mockGetDb, resetFirestoreMock, seedFirestore };
 * });
 * vi.mock('@/lib/firebase', () => ({ getDb: mockGetDb }));
 * ```
 */
export type SeedDoc = { id: string } & Record<string, unknown>;

export const buildFirestoreMock = (store: Map<string, Map<string, unknown>>, getNextId: () => string) => {
  const getCol = (name: string) => {
    if (!store.has(name)) store.set(name, new Map());
    return store.get(name)!;
  };

  return () => ({
    collection: (name: string) => ({
      add: async (data: unknown) => {
        const id = getNextId();
        getCol(name).set(id, data);
        return { id };
      },
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
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
        get: async () => {
          const entries = Array.from(getCol(name).entries());
          entries.sort(([, a], [, b]) => {
            const av = (a as Record<string, unknown>)[field];
            const bv = (b as Record<string, unknown>)[field];
            if (av === bv) return 0;
            const cmp = av < bv ? -1 : 1;
            return direction === 'desc' ? -cmp : cmp;
          });
          return {
            docs: entries.map(([docId, data]) => ({
              id: docId,
              data: () => data,
            })),
          };
        },
      }),
    }),
  });
};
