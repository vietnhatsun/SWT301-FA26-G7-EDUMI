import { Builder, type WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { mkdirSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach } from 'vitest';
import { env } from '../config/env';

/**
 * Quản lý vòng đời WebDriver cho mỗi kịch bản kiểm thử:
 * - Khởi tạo trình duyệt Chrome độc lập trước mỗi bài test
 * - Tự động chụp ảnh màn hình lưu vào e2e-reports/screenshots khi test FAILED làm Defect Report
 * - Đóng trình duyệt sạch sẽ sau mỗi test
 */
export function useDriver(): { get: () => WebDriver } {
  let driver: WebDriver | undefined;

  beforeEach(async ({ task, onTestFailed }) => {
    const options = new chrome.Options();
    if (env.headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--window-size=1366,768');

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    onTestFailed(async () => {
      if (!driver) return;
      try {
        const png = await driver.takeScreenshot();
        mkdirSync('e2e-reports/screenshots', { recursive: true });
        const name = task.name.replace(/[^a-zA-Z0-9-_]/g, '_');
        writeFileSync(`e2e-reports/screenshots/${name}.png`, png, 'base64');
      } catch (err) {
        console.error('Không thể chụp ảnh lỗi:', err);
      }
    });
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
      driver = undefined;
    }
  });

  return {
    get: () => {
      if (!driver) throw new Error('Driver chưa được khởi tạo. Hãy gọi get() bên trong it/test block.');
      return driver;
    },
  };
}

