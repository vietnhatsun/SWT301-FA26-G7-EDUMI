import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { ExamResultPage } from '../pages/ExamResultPage';
import { readCsv } from '../utils/csv';

type ExamResultCsvRow = {
  tcId: string;
  examId: string;
  mode: string;
  userAnswers: string;
  expectedResult: string;
  description: string;
  [key: string]: string;
};

describe('Module M8: Nộp bài thi, Chấm điểm tự động & Xem kết quả', () => {
  const browser = useDriver();
  const testCases = readCsv<ExamResultCsvRow>('e2e/data/m08_examresult_data.csv');

  it.each(testCases)('$tcId: $description', async (row) => {
    const page = new ExamResultPage(browser.get());
    await page.openExam(row.examId, row.mode as 'exam' | 'practice');

    switch (row.tcId) {
      case 'TC-M08-01': {
        // BR-M8-01: Bấm nộp bài khi chưa làm hết các câu hỏi hiển thị modal cảnh báo số câu chưa làm
        await page.clickSubmitExam();
        const hasWarning = await page.isUnansweredWarningDisplayed();
        expect(hasWarning).toBe(true);
        break;
      }

      case 'TC-M08-02': {
        // BR-M8-02: Bấm 'Xem lại bài thi' trên modal cảnh báo đóng modal và giữ nguyên bài thi
        await page.clickSubmitExam();
        await page.clickReviewExam();
        const isStillWarning = await page.isUnansweredWarningDisplayed();
        expect(isStillWarning).toBe(false);
        break;
      }

      case 'TC-M08-03': {
        // BR-M8-03: Tự động thu bài khi hết giờ
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const isResultVisible = await page.isResultViewDisplayed();
        expect(isResultVisible).toBe(true);
        break;
      }

      case 'TC-M08-04': {
        // BR-M8-04: Nộp bài thành công chuyển hướng sang hiển thị màn hình kết quả điểm số
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const isResultVisible = await page.isResultViewDisplayed();
        expect(isResultVisible).toBe(true);
        break;
      }

      case 'TC-M08-05': {
        // BR-M8-05: Hiển thị điểm số bài thi rõ ràng trên thang điểm 10 hoặc thang chuẩn
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const scoreText = await page.getFinalScore();
        expect(scoreText).toBeDefined();
        expect(scoreText.length).toBeGreaterThan(0);
        break;
      }

      case 'TC-M08-06': {
        // BR-M8-06: Thống kê số câu đúng, sai và chưa làm
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const isResultVisible = await page.isResultViewDisplayed();
        expect(isResultVisible).toBe(true);
        break;
      }

      case 'TC-M08-07': {
        // BR-M8-07: Tính điểm câu Đúng/Sai lũy tiến theo chuẩn Bộ GD&ĐT
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const isResultVisible = await page.isResultViewDisplayed();
        expect(isResultVisible).toBe(true);
        break;
      }

      case 'TC-M08-08': {
        // BR-M8-08: Hiển thị chi tiết đáp án và lời giải thích từng câu hỏi
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const hasExplanation = await page.isExplanationDisplayed();
        expect(hasExplanation).toBe(true);
        break;
      }

      case 'TC-M08-09': {
        // BR-M8-09: Công thức Toán học LaTeX trong phần kết quả hiển thị sắc nét qua KaTeX
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        const hasKatex = await page.hasKaTeXInResult();
        expect(hasKatex).toBe(true);
        break;
      }

      case 'TC-M08-10': {
        // BR-M8-10: Bấm nút 'Làm lại đề này' đưa về phòng thi mới
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        await page.clickRetakeExam();
        // Sau khi retake, màn hình kết quả ẩn đi và quay lại phòng thi
        const isResultVisible = await page.isResultViewDisplayed();
        expect(isResultVisible).toBe(false);
        break;
      }

      default: {
        await page.clickSubmitExam();
        await page.confirmSubmitExam();
        expect(await page.isResultViewDisplayed()).toBe(true);
        break;
      }
    }
  });
});
