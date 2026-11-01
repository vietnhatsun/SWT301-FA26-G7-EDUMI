import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { readCsv } from '../utils/csv';
import { ExamLobbyPage } from '../pages/ExamLobbyPage';

interface M06Data {
  tcId: string;
  description: string;
  actionType: string;
  inputParam: string;
  expectedResult: string;
}

const testData = readCsv<M06Data>('e2e/data/m06_examroom_data.csv');

describe('Module M6 - Sảnh chờ thi & Modal xác nhận bắt đầu làm bài (/exam)', () => {
  const browser = useDriver();

  it.each(testData)('$tcId: $description', async (row) => {
    const page = new ExamLobbyPage(browser.get());
    await page.openPage();

    switch (row.actionType) {
      case 'open_modal': {
        await page.openFirstExamModal();
        const isDisplayed = await page.isModalDisplayed();
        expect(isDisplayed).toBe(true);
        break;
      }

      case 'check_duration': {
        await page.openFirstExamModal();
        const durationText = await page.getModalDurationText();
        expect(durationText).toContain(row.inputParam);
        break;
      }

      case 'check_questions': {
        await page.openFirstExamModal();
        const questionText = await page.getModalQuestionCountText();
        expect(questionText).toContain(row.inputParam);
        break;
      }

      case 'check_info': {
        await page.openFirstExamModal();
        const title = await page.getModalExamTitle();
        expect(title.length).toBeGreaterThan(0);
        break;
      }

      case 'close_back_btn': {
        await page.openFirstExamModal();
        await page.closeModalByBackBtn();
        const isDisplayed = await page.isModalDisplayed();
        expect(isDisplayed).toBe(false);
        break;
      }

      case 'close_esc': {
        await page.openFirstExamModal();
        await page.closeModalByEsc();
        const isDisplayed = await page.isModalDisplayed();
        expect(isDisplayed).toBe(false);
        break;
      }

      case 'copy_code': {
        await page.copyExamCode();
        const isCopied = await page.isCopySuccessDisplayed();
        expect(isCopied).toBe(true);
        break;
      }

      case 'search_pin': {
        await page.searchExam(row.inputParam);
        const hasPinBanner = await page.isPinBannerDisplayed();
        expect(hasPinBanner).toBe(true);
        break;
      }

      case 'start_exam': {
        await page.openFirstExamModal();
        await page.startExam();
        const currentUrl = await page.getCurrentUrl();
        expect(currentUrl).toContain('/exam/');
        break;
      }

      case 'invalid_url': {
        await page.open(row.inputParam);
        const currentUrl = await page.getCurrentUrl();
        expect(currentUrl).toBeDefined();
        break;
      }

      default:
        break;
    }
  });
});

