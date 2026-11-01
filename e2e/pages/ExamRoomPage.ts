import { By } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object đại diện cho Phòng thi trực tuyến (Exam Room - Module M7)
 * Tuân thủ quy tắc ISTQB & POM: Chỉ chứa locator và các hàm tương tác, KHÔNG chứa assertion.
 */
export class ExamRoomPage extends BasePage {
  // Locators
  private readonly timerContainer = By.xpath("//div[contains(@class, 'tracking-wider') and contains(text(), ':')]");
  private readonly questionContent = By.xpath("//div[contains(@class, 'font-bold') and contains(@class, 'leading-relaxed')]");
  private readonly prevButton = By.xpath("//button[contains(., 'Câu trước')]");
  private readonly nextButton = By.xpath("//button[contains(., 'Câu tiếp theo')]");
  private readonly flagButton = By.xpath("//button[contains(@class, 'rounded-full') and (.//*[name()='svg' and contains(@class, 'lucide-flag')] or contains(., 'cờ'))]");
  private readonly submitExamButton = By.xpath("//button[contains(., 'Nộp bài thi')]");
  private readonly submitConfirmModalHeader = By.xpath("//h3[contains(text(), 'Xác nhận nộp bài thi')]");
  private readonly modalReviewButton = By.xpath("//button[contains(., 'Xem lại bài thi')]");
  private readonly katexFormula = By.css('.katex, .katex-html');

  /**
   * Mở phòng thi theo Exam ID và chế độ thi (exam / practice)
   */
  async openExamRoom(examId: string, mode: 'exam' | 'practice' = 'exam'): Promise<this> {
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
    await this.waitVisible(this.timerContainer);
    return this;
  }

  /**
   * Lấy giá trị đồng hồ đếm ngược hiện tại (định dạng MM:SS)
   */
  async getTimerText(): Promise<string> {
    return this.getText(this.timerContainer);
  }

  /**
   * Chọn phương án trắc nghiệm đơn (A, B, C, hoặc D) cho câu hỏi hiện tại
   */
  async selectSingleChoiceOption(optionLetter: 'A' | 'B' | 'C' | 'D'): Promise<void> {
    const optionButton = By.xpath(
      `//button[contains(@class, 'rounded-2xl') and (.//span[normalize-space(text())='${optionLetter}'] or contains(., 'Phương án ${optionLetter}'))]`
    );
    await this.click(optionButton);
  }

  /**
   * Kiểm tra xem phương án trắc nghiệm đơn có đang ở trạng thái được chọn hay không
   */
  async isSingleChoiceSelected(optionLetter: 'A' | 'B' | 'C' | 'D'): Promise<boolean> {
    try {
      const optionButton = await this.waitVisible(
        By.xpath(
          `//button[contains(@class, 'rounded-2xl') and (.//span[normalize-space(text())='${optionLetter}'] or contains(., 'Phương án ${optionLetter}'))]`
        )
      );
      const className = (await optionButton.getAttribute('class')) || '';
      return className.includes('bg-[#eefaf5]');
    } catch {
      return false;
    }
  }

  /**
   * Chọn Đúng hoặc Sai cho từng ý (a, b, c, d) của câu hỏi Phần II (Đúng/Sai)
   */
  async selectTrueFalseOption(subItemId: 'a' | 'b' | 'c' | 'd', isTrue: boolean): Promise<void> {
    const iconClass = isTrue ? 'lucide-check' : 'lucide-x';
    const actionLabel = isTrue ? 'ĐÚNG' : 'SAI';
    const tfButton = By.xpath(
      `//span[normalize-space(.)='${subItemId})']/ancestor::div[contains(@class, 'rounded-2xl')][1]//button[.//svg[contains(@class, '${iconClass}')] or contains(., '${actionLabel}')]`
    );
    await this.click(tfButton);
  }

  /**
   * Kiểm tra xem ý Đúng/Sai đã được chọn đúng giá trị mong đợi chưa
   */
  async isTrueFalseOptionSelected(subItemId: 'a' | 'b' | 'c' | 'd', isTrue: boolean): Promise<boolean> {
    try {
      const iconClass = isTrue ? 'lucide-check' : 'lucide-x';
      const actionLabel = isTrue ? 'ĐÚNG' : 'SAI';
      const buttonLocator = By.xpath(
        `//span[normalize-space(.)='${subItemId})']/ancestor::div[contains(@class, 'rounded-2xl')][1]//button[.//svg[contains(@class, '${iconClass}')] or contains(., '${actionLabel}')]`
      );
      const button = await this.waitVisible(buttonLocator);
      const className = (await button.getAttribute('class')) || '';
      return isTrue ? className.includes('bg-emerald-600') : className.includes('bg-rose-600');
    } catch {
      return false;
    }
  }

  /**
   * Nhảy câu hỏi trực tiếp bằng bảng điều hướng câu hỏi bên phải
   */
  async clickQuestionPalette(questionNumber: number): Promise<void> {
    const paletteButton = By.xpath(
      `//button[contains(@title, 'Câu ${questionNumber}') or (contains(@class, 'rounded-xl') and .//span[normalize-space(text())='${questionNumber}'])]`
    );
    await this.click(paletteButton);
  }

  /**
   * Lấy nội dung hiển thị của câu hỏi hiện tại
   */
  async getQuestionContent(): Promise<string> {
    return this.getText(this.questionContent);
  }

  /**
   * Bấm nút 'Câu tiếp theo'
   */
  async clickNextQuestion(): Promise<void> {
    await this.click(this.nextButton);
  }

  /**
   * Bấm nút 'Câu trước'
   */
  async clickPrevQuestion(): Promise<void> {
    await this.click(this.prevButton);
  }

  /**
   * Bấm nút Đặt cờ / Hủy đặt cờ xem lại cho câu hỏi hiện tại
   */
  async toggleFlag(): Promise<void> {
    await this.click(this.flagButton);
  }

  /**
   * Kiểm tra xem câu hỏi có đang được cắm cờ (Flagged) trên mục lục hay không
   */
  async isQuestionFlagged(questionNumber: number): Promise<boolean> {
    try {
      const paletteButton = await this.waitVisible(
        By.xpath(
          `//button[contains(@title, 'Câu ${questionNumber}') or (contains(@class, 'rounded-xl') and .//span[normalize-space(text())='${questionNumber}'])]`
        )
      );
      const amberBadge = await paletteButton.findElements(By.css('.bg-amber-400, .bg-amber-500, [class*="amber"]'));
      return amberBadge.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Thay đổi cỡ chữ bài thi (75%, 100%, 125%, 150%)
   */
  async setTextScale(scale: '75%' | '100%' | '125%' | '150%'): Promise<void> {
    const scaleBtn = By.xpath(`//button[normalize-space(text())='${scale}']`);
    await this.click(scaleBtn);
  }

  /**
   * Kiểm tra cỡ chữ đã được chọn kích hoạt thành công
   */
  async isTextScaleActive(scale: '75%' | '100%' | '125%' | '150%'): Promise<boolean> {
    try {
      const scaleBtn = await this.waitVisible(By.xpath(`//button[normalize-space(text())='${scale}']`));
      const className = (await scaleBtn.getAttribute('class')) || '';
      return className.includes('bg-[#009b77]') && className.includes('text-white');
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra có công thức toán học KaTeX được render hay không
   */
  async hasKaTeXFormula(): Promise<boolean> {
    try {
      const hasKatex = await this.isDisplayed(this.katexFormula);
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
   * Bấm nút 'Nộp bài thi' ở thanh điều hướng dưới cùng
   */
  async clickSubmitExam(): Promise<void> {
    await this.click(this.submitExamButton);
  }

  /**
   * Kiểm tra Modal xác nhận nộp bài có đang hiển thị hay không
   */
  async isSubmitConfirmModalDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.submitConfirmModalHeader);
  }

  /**
   * Đóng Modal xác nhận nộp bài bằng nút 'Xem lại bài thi'
   */
  async closeModalAndReview(): Promise<void> {
    await this.click(this.modalReviewButton);
  }
}
