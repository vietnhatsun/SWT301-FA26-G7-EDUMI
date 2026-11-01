import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { readCsv } from '../utils/csv';
import { env } from '../config/env';
import { ExamScannerModal } from '../pages/ExamScannerModal';

interface M10Data extends Record<string, string> {
  tcId: string;
  description: string;
  action: string;
  tab: string;
  inputText: string;
  fileName: string;
  expectedResult: string;
}

const testData = readCsv<M10Data>('e2e/data/m10_exam_scanner_data.csv');

describe('Module M10 - AI Exam Scanner: Quét bóc tách đề thi & Preview LaTeX', () => {
  const browser = useDriver();

  it.each(testData)('$tcId: $description', async (row) => {
    const page = new ExamScannerModal(browser.get());
    await page.setupStaffExamForm(env.accounts.staff.email, env.accounts.staff.password);

    switch (row.tcId) {
      case 'TC-M10-01': {
        // Mở Modal AI Exam Scanner
        await page.openScannerModal();
        const isDisplayed = await page.isModalDisplayed();
        expect(isDisplayed).toBe(true);
        break;
      }

      case 'TC-M10-02': {
        // Chuyển đổi sang Tab Dán nội dung thô (Paste Text)
        await page.openScannerModal();
        await page.switchToPasteTab();
        const isTextareaVisible = await page.isTextareaDisplayed();
        expect(isTextareaVisible).toBe(true);
        break;
      }

      case 'TC-M10-03': {
        // Bấm nút "Thử dán đề mẫu"
        await page.openScannerModal();
        await page.switchToPasteTab();
        await page.clickSampleExamText();
        const content = await page.getTextareaContent();
        expect(content.length).toBeGreaterThan(50);
        expect(content).toContain('PHẦN');
        break;
      }

      case 'TC-M10-04': {
        // Nhập văn bản đề thi thủ công có chứa công thức
        await page.openScannerModal();
        await page.switchToPasteTab();
        await page.enterRawText(row.inputText);
        const content = await page.getTextareaContent();
        expect(content).toContain(row.inputText);
        break;
      }

      case 'TC-M10-05': {
        // Kích hoạt quét đề AI hiển thị trạng thái xử lý
        await page.openScannerModal();
        await page.switchToPasteTab();
        await page.enterRawText('Câu 1: Cho hàm số y = f(x). Phương trình f(x) = 0 có nghiệm.');
        await page.clickStartScan();
        const isScanning = await page.isScanningStateActive();
        expect(isScanning).toBe(true);
        break;
      }

      case 'TC-M10-06': {
        // Bấm nút Dừng quét ngắt tiến trình
        await page.openScannerModal();
        await page.switchToPasteTab();
        await page.enterRawText('Câu 1: Khảo sát sự biến thiên của hàm số bậc 3.');
        await page.clickStartScan();
        await page.clickStopScan();
        const isStopped = await page.isStopScanMessageDisplayed();
        expect(isStopped).toBe(true);
        break;
      }

      case 'TC-M10-07': {
        // Chuyển sang Tab Tải tệp và kiểm tra vùng kéo thả
        await page.openScannerModal();
        await page.switchToPasteTab();
        await page.switchToUploadTab();
        const isDropzoneVisible = await page.isDropzoneDisplayed();
        expect(isDropzoneVisible).toBe(true);
        break;
      }

      case 'TC-M10-08': {
        // Nút Bắt đầu Quét bị vô hiệu hóa khi chưa có tệp
        await page.openScannerModal();
        await page.switchToUploadTab();
        const isDisabled = await page.isStartScanDisabled();
        expect(isDisabled).toBe(true);
        break;
      }

      case 'TC-M10-09': {
        // Đóng Modal bằng nút X
        await page.openScannerModal();
        await page.closeModalViaX();
        const isDisplayed = await page.isModalDisplayed();
        expect(isDisplayed).toBe(false);
        break;
      }

      case 'TC-M10-10': {
        // Đóng Modal bằng nút Hủy bỏ và kiểm tra form ngoài vẫn bảo toàn
        await page.openScannerModal();
        await page.closeModalViaCancel();
        const isModalGone = await page.isModalDisplayed();
        const isFormPresent = await page.isExamTitleFieldPresent();
        expect(isModalGone).toBe(false);
        expect(isFormPresent).toBe(true);
        break;
      }

      default:
        break;
    }
  });
});

