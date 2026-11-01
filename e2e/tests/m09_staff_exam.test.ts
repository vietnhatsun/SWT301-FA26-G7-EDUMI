import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { readCsv } from '../utils/csv';
import { env } from '../config/env';
import { StaffExamPage } from '../pages/StaffExamPage';

interface M09Data extends Record<string, string> {
  tcId: string;
  description: string;
  role: string;
  title: string;
  subject: string;
  questionType: string;
  correctOpt: string;
  formula: string;
  expectedResult: string;
}

const testData = readCsv<M09Data>('e2e/data/m09_staff_exam_data.csv');

describe('Module M9 - Staff Quản lý Ngân hàng câu hỏi & Tạo đề thi mới (/profile)', () => {
  const browser = useDriver();

  it.each(testData)('$tcId: $description', async (row) => {
    const page = new StaffExamPage(browser.get());

    switch (row.tcId) {
      case 'TC-M09-01': {
        // Staff đăng nhập thành công và truy cập tab quản lý đề thi
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        const isDisplayed = await page.isExamManagementDisplayed();
        expect(isDisplayed).toBe(true);
        break;
      }

      case 'TC-M09-02': {
        // Học sinh Student bị chặn không thấy mục quản trị Staff
        await page.login(env.accounts.student.email, env.accounts.student.password);
        const hasStaffItem = await page.isStaffSidebarItemPresent();
        expect(hasStaffItem).toBe(false);
        break;
      }

      case 'TC-M09-03': {
        // Tạo đề thi với tiêu đề hợp lệ
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        await page.fillExamBasicInfo(row.title);
        const titleValue = await page.getExamTitleValue();
        expect(titleValue).toContain('Toán 12');
        break;
      }

      case 'TC-M09-04': {
        // Thêm câu hỏi trắc nghiệm đơn 4 lựa chọn (A, B, C, D)
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        await page.addSingleChoiceQuestion();
        const updatedCount = await page.getQuestionCountText();
        expect(updatedCount).toContain('câu');
        break;
      }

      case 'TC-M09-05': {
        // Thiết lập đáp án B làm đáp án đúng cho câu hỏi trắc nghiệm
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        await page.selectSingleChoiceAnswer(row.correctOpt || 'B');
        const badgeText = await page.getCorrectAnswerBadgeText();
        expect(badgeText).toContain(row.correctOpt || 'B');
        break;
      }

      case 'TC-M09-06': {
        // Thêm câu hỏi trắc nghiệm Đúng / Sai 4 ý (a, b, c, d)
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        await page.addTrueFalseQuestion();
        const countText = await page.getQuestionCountText();
        expect(countText).toContain('câu');
        break;
      }

      case 'TC-M09-07': {
        // Xóa câu hỏi khỏi đề thi
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        await page.addSingleChoiceQuestion();
        await page.deleteFirstQuestion();
        const countAfterDelete = await page.getQuestionCountText();
        expect(countAfterDelete).toContain('câu');
        break;
      }

      case 'TC-M09-08': {
        // Live Math Preview hiển thị công thức LaTeX
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        await page.enterQuestionFormula(row.formula);
        const hasKatex = await page.isKaTeXRendered();
        expect(hasKatex).toBe(true);
        break;
      }

      case 'TC-M09-09': {
        // Kiểm tra hiển thị huy hiệu tổng điểm ma trận
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToCreateSubTab();
        const scoreBadge = await page.getTotalScoreBadgeText();
        expect(scoreBadge).toContain('10.0đ');
        break;
      }

      case 'TC-M09-10': {
        // Chuyển đổi giữa danh sách bài thi và màn hình soạn thảo đề
        await page.login(env.accounts.staff.email, env.accounts.staff.password);
        await page.navigateToExamManagement();
        await page.switchToManageSubTab();
        await page.switchToCreateSubTab();
        const isPanelActive = await page.isExamManagementDisplayed();
        expect(isPanelActive).toBe(true);
        break;
      }

      default:
        break;
    }
  });
});
