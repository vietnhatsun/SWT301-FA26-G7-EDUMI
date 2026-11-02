import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { ExamRoomPage } from '../pages/ExamRoomPage';
import { readCsv } from '../utils/csv';

type ExamRoomCsvRow = {
  tcId: string;
  examId: string;
  targetQuestion: string;
  actionData: string;
  expectedResult: string;
  description: string;
  [key: string]: string;
};

describe('Module M7: Phòng thi trực tuyến & Tương tác làm bài trắc nghiệm', () => {
  const browser = useDriver();
  const testCases = readCsv<ExamRoomCsvRow>('e2e/data/m07_examroom_data.csv');

  it.each(testCases)('$tcId: $description', async (row) => {
    const page = new ExamRoomPage(browser.get());
    await page.openExamRoom(row.examId);

    switch (row.tcId) {
      case 'TC-M07-01': {
        // BR-M7-01: Đồng hồ đếm ngược hoạt động giảm dần từng giây
        const initialTimer = await page.getTimerText();
        expect(initialTimer).toMatch(/^\d{1,3}:\d{2}$/);
        break;
      }

      case 'TC-M07-02': {
        // BR-M7-02: Chọn đáp án trắc nghiệm A/B/C/D thành công
        await page.selectSingleChoiceOption(row.actionData as 'A' | 'B' | 'C' | 'D');
        const isSelected = await page.isSingleChoiceSelected(row.actionData as 'A' | 'B' | 'C' | 'D');
        expect(isSelected).toBe(true);
        break;
      }

      case 'TC-M07-03': {
        // BR-M7-03: Thay đổi đáp án đã chọn sang phương án khác
        // Bước 1: Chọn phương án A
        await page.selectSingleChoiceOption('A');
        expect(await page.isSingleChoiceSelected('A')).toBe(true);

        // Bước 2: Đổi sang phương án C
        await page.selectSingleChoiceOption(row.actionData as 'A' | 'B' | 'C' | 'D');
        expect(await page.isSingleChoiceSelected('C')).toBe(true);
        expect(await page.isSingleChoiceSelected('A')).toBe(false);
        break;
      }

      case 'TC-M07-04': {
        // BR-M7-04: Chọn Đúng hoặc Sai độc lập cho từng ý câu Phần II
        const qNum = parseInt(row.targetQuestion, 10);
        await page.clickQuestionPalette(qNum);

        // Chọn ý a là ĐÚNG, ý b là SAI
        await page.selectTrueFalseOption('a', true);
        await page.selectTrueFalseOption('b', false);

        expect(await page.isTrueFalseOptionSelected('a', true)).toBe(true);
        expect(await page.isTrueFalseOptionSelected('b', false)).toBe(true);
        break;
      }

      case 'TC-M07-05': {
        // BR-M7-05: Nhảy câu hỏi trực tiếp bằng thanh mục lục bên phải
        const targetNumber = parseInt(row.targetQuestion, 10);
        await page.clickQuestionPalette(targetNumber);

        const content = await page.getQuestionContent();
        expect(content.length).toBeGreaterThan(0);
        break;
      }

      case 'TC-M07-06': {
        // BR-M7-06: Điều hướng mượt mà giữa các câu hỏi bằng nút Câu tiếp theo và Câu trước
        const firstQuestionContent = await page.getQuestionContent();

        // Chuyển sang câu tiếp theo
        await page.clickNextQuestion();
        const secondQuestionContent = await page.getQuestionContent();
        expect(secondQuestionContent).not.toBe(firstQuestionContent);

        // Quay lại câu trước
        await page.clickPrevQuestion();
        const backToFirstContent = await page.getQuestionContent();
        expect(backToFirstContent).toBe(firstQuestionContent);
        break;
      }

      case 'TC-M07-07': {
        // BR-M7-07: Đánh dấu câu hỏi cần xem lại (Flag Question)
        const qNum = parseInt(row.targetQuestion, 10);
        await page.clickQuestionPalette(qNum);

        // Bấm đặt cờ xem lại
        await page.toggleFlag();
        const isFlagged = await page.isQuestionFlagged(qNum);
        expect(isFlagged).toBe(true);
        break;
      }

      case 'TC-M07-08': {
        // BR-M7-08: Thay đổi kích thước font chữ phòng thi
        const scaleOption = row.actionData as '75%' | '100%' | '125%' | '150%';
        await page.setTextScale(scaleOption);

        const isScaleActive = await page.isTextScaleActive(scaleOption);
        expect(isScaleActive).toBe(true);
        break;
      }

      case 'TC-M07-09': {
        // BR-M7-09: Công thức Toán học LaTeX hiển thị sắc nét qua KaTeX
        const hasKatex = await page.hasKaTeXFormula();
        expect(hasKatex).toBe(true);
        break;
      }

      case 'TC-M07-10': {
        // BR-M7-10: Bấm nút 'Nộp bài thi' hiển thị modal xác nhận nộp bài
        await page.clickSubmitExam();

        const isModalVisible = await page.isSubmitConfirmModalDisplayed();
        expect(isModalVisible).toBe(true);

        // Đóng modal để kiểm tra tính toàn vẹn của giao diện
        await page.closeModalAndReview();
        expect(await page.isSubmitConfirmModalDisplayed()).toBe(false);
        break;
      }

      default:
        throw new Error(`Chưa định nghĩa xử lý cho Test Case ${row.tcId}`);
    }
  });
});

