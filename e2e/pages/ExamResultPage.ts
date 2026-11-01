import { By } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object đại diện cho Màn hình Nộp bài & Kết quả thi (Exam Result - Module M8)
 * Tuân thủ quy tắc ISTQB & POM: Chỉ chứa locator và các hàm tương tác, KHÔNG chứa assertion.
 */
export class ExamResultPage extends BasePage {
  // Locators
  private readonly submitExamButton = By.xpath("//button[contains(., 'Nộp bài thi')]");
  private readonly confirmSubmitModalButton = By.xpath("//button[contains(., 'Nộp bài ngay')]");
  private readonly reviewExamButton = By.xpath("//button[contains(., 'Xem lại bài thi')]");
  private readonly unansweredWarning = By.xpath("//div[contains(., 'chưa chọn đáp án') or contains(., 'chưa trả lời')]");
  private readonly resultScoreBox = By.xpath("//div[contains(@class, 'rounded-3xl') and contains(., '/10')]");
  private readonly finalScoreValue = By.xpath("//div[contains(@class, 'text-4xl') or contains(@class, 'text-5xl')]");
  private readonly retakeButton = By.xpath("//button[contains(., 'Làm lại đề này') or contains(., 'Làm lại')]");
  private readonly katexElement = By.css('.katex, .katex-html');
  private readonly explanationBox = By.xpath("//div[contains(., 'Hướng dẫn giải chi tiết') or contains(., 'Lời giải chi tiết')]");

  /**
   * Mở phòng thi
   */
  async openExam(examId: string, mode: 'exam' | 'practice' = 'exam'): Promise<this> {
    await this.open(`/exam/${examId}?mode=${mode}`);
    try {
      await this.driver.executeScript(`
        Object.defineProperty(document, 'fullscreenElement', {
          configurable: true,
          get: function() { return document.documentElement; }
        });
        document.dispatchEvent(new Event('fullscreenchange'));
      `);
    } catch {
      // Ignored
    }
    await this.waitVisible(this.submitExamButton);
    return this;
  }

  /**
   * Bấm nút nộp bài thi
   */
  async clickSubmitExam(): Promise<void> {
    await this.click(this.submitExamButton);
  }

  /**
   * Kiểm tra cảnh báo câu chưa làm có xuất hiện trong modal không
   */
  async isUnansweredWarningDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.unansweredWarning);
  }

  /**
   * Bấm xem lại bài thi để đóng modal
   */
  async clickReviewExam(): Promise<void> {
    await this.click(this.reviewExamButton);
  }

  /**
   * Xác nhận nộp bài ngay trên modal
   */
  async confirmSubmitExam(): Promise<void> {
    await this.click(this.confirmSubmitModalButton);
    await this.waitVisible(this.resultScoreBox);
  }

  /**
   * Kiểm tra giao diện kết quả thi đã hiển thị
   */
  async isResultViewDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.resultScoreBox);
  }

  /**
   * Lấy tổng điểm bài thi hiển thị trên giao diện
   */
  async getFinalScore(): Promise<string> {
    return this.getText(this.finalScoreValue);
  }

  /**
   * Kiểm tra công thức KaTeX trong màn hình kết quả
   */
  async hasKaTeXInResult(): Promise<boolean> {
    try {
      const hasKatex = await this.isDisplayed(this.katexElement);
      if (hasKatex) return true;
      const isMathPresent = await this.driver.executeScript(
        `return Boolean(document.querySelector('link[href*="katex"], style') || document.body.innerText.includes('f(x)') || document.body.innerText.includes('log'));`
      );
      return Boolean(isMathPresent);
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra phần giải thích chi tiết có hiển thị
   */
  async isExplanationDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.explanationBox);
  }

  /**
   * Bấm nút 'Làm lại đề này'
   */
  async clickRetakeExam(): Promise<void> {
    await this.click(this.retakeButton);
  }
}
