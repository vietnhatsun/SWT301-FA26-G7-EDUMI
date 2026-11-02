import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { env } from '../config/env';

describe('Smoke Test - Môi trường E2E EduMi', () => {
  const browser = useDriver();

  it('SMOKE-001: Mở được trang chủ EduMi và tiêu đề hợp lệ', async () => {
    await browser.get().get(env.baseUrl);
    const title = await browser.get().getTitle();
    expect(title).not.toBe('');
  });
});
