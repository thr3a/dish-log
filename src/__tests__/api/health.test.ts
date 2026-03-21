import { testApiHandler } from 'next-test-api-route-handler';
import * as handler from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('200 と { status: "ok" } を返す', async () => {
    await testApiHandler({
      appHandler: handler,
      async test({ fetch }) {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({ status: 'ok' });
      }
    });
  });
});
