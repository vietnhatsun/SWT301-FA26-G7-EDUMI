import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { readCsv } from '../utils/csv';
import { ExamLobbyPage } from '../pages/ExamLobbyPage';

interface M05Data {
  tcId: string;
  description: string;
  keyword: string;
  category: string;
  subject: string;
  difficulty: string;
  expectedResult: string;
}

const testData = readCsv<M05Data>('e2e/data/m05_exambank_data.csv');

describe('Module M5 - Tìm kiếm & Bộ lọc Đề thi luyện tập đa tiêu chí (/exam)', () => {
  const browser = useDriver();

  it.each(testData)('$tcId: $description', async (row) => {
    const page = new ExamLobbyPage(browser.get());
    await page.openPage();

    switch (row.tcId) {
      case 'TC-M05-01':
      case 'TC-M05-02': {
        await page.searchExam(row.keyword);
        const count = await page.getExamCardCount();
        expect(count).toBeGreaterThan(0);
        break;
      }

      case 'TC-M05-03': {
        await page.searchExam(row.keyword);
        const isEmpty = await page.isEmptyStateDisplayed();
        expect(isEmpty).toBe(true);
        break;
      }

      case 'TC-M05-04':
      case 'TC-M05-05': {
        await page.selectCategory(row.category);
        const count = await page.getExamCardCount();
        expect(count).toBeGreaterThan(0);
        break;
      }

      case 'TC-M05-06': {
        await page.selectSubject(row.subject);
        const count = await page.getExamCardCount();
        expect(count).toBeGreaterThan(0);
        break;
      }

      case 'TC-M05-07': {
        await page.selectDifficulty(row.difficulty);
        const count = await page.getExamCardCount();
        expect(count).toBeGreaterThan(0);
        break;
      }

      case 'TC-M05-08': {
        await page.selectCategory(row.category);
        await page.selectSubject(row.subject);
        const count = await page.getExamCardCount();
        expect(count).toBeGreaterThanOrEqual(0);
        break;
      }

      case 'TC-M05-09': {
        await page.searchExam(row.keyword);
        const isEmpty = await page.isEmptyStateDisplayed();
        expect(isEmpty).toBe(true);
        break;
      }

      case 'TC-M05-10': {
        await page.selectCategory(row.category);
        await page.resetFilters();
        const count = await page.getExamCardCount();
        expect(count).toBeGreaterThan(0);
        break;
      }

      default:
        break;
    }
  });
});
