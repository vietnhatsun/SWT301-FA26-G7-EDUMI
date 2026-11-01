import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { readCsv } from '../utils/csv';
import { AIAssistantPage } from '../pages/AIAssistantPage';

interface BonusData extends Record<string, string> {
  tcId: string;
  description: string;
  action: string;
  modelName: string;
  promptText: string;
  expectedResult: string;
}

const testData = readCsv<BonusData>('e2e/data/bonus_assistant_data.csv');

describe('Bonus Feature - AI Study Assistant & Lộ trình học thông minh (/assistant)', () => {
  const browser = useDriver();

  it.each(testData)('$tcId: $description', async (row) => {
    const page = new AIAssistantPage(browser.get());
    await page.openPage();

    switch (row.tcId) {
      case 'TC-BONUS-01': {
        // Kiểm tra hiển thị Mascot Capy và lời chào
        const isMascotVisible = await page.isMascotDisplayed();
        const headingText = await page.getWelcomeHeadingText();
        expect(isMascotVisible).toBe(true);
        expect(headingText.length).toBeGreaterThan(0);
        break;
      }

      case 'TC-BONUS-02': {
        // Chuyển đổi mô hình AI sang Deep Reasoning 9+
        await page.selectModel(row.modelName);
        const currentModel = await page.getSelectedModelName();
        expect(currentModel).toContain('Deep Reasoning');
        break;
      }

      case 'TC-BONUS-03': {
        // Bấm vào thẻ gợi ý nhanh Quick Prompt
        await page.clickQuickPromptByText('Bóc tách');
        const hasMsg = await page.hasUserMessage('câu hỏi trắc nghiệm');
        expect(hasMsg).toBe(true);
        break;
      }

      case 'TC-BONUS-04': {
        // Nhập yêu cầu lộ trình học vào ô chat và gửi
        await page.sendChatMessage(row.promptText);
        const hasMsg = await page.hasUserMessage('Lập lộ trình');
        expect(hasMsg).toBe(true);
        break;
      }

      case 'TC-BONUS-05': {
        // Bấm nút Trò chuyện mới reset về màn hình chào mừng
        await page.clickQuickPromptByText('Bóc tách');
        await page.clickNewChat();
        const isWelcomeActive = await page.isWelcomeScreenActive();
        expect(isWelcomeActive).toBe(true);
        break;
      }

      default:
        break;
    }
  });
});

