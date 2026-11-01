import { By, Key, until, type WebElement } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object Model cho Sảnh Đề Thi & Bộ Lọc EduMi (/exam)
 * Phục vụ kiểm thử Module M5 (Bộ lọc đề) & Module M6 (Sảnh chờ thi)
 * Tuân thủ chuẩn ISTQB: Chỉ chứa locator và hành động tương tác, KHÔNG chứa assertion.
 */
export class ExamLobbyPage extends BasePage {
  // --- Locators: Bộ lọc & Tìm kiếm (Module M5) ---
  private readonly searchInput = By.css("input[placeholder*='Tìm tên đề thi']");
  private readonly clearSearchBtn = By.css("button[title='Xóa tìm kiếm']");
  private readonly categoryDropdownBtn = By.xpath("//button[.//span[contains(text(), 'Kỳ thi') or contains(text(), 'THPT') or contains(text(), 'ĐGNL') or contains(text(), 'ĐGTD') or contains(text(), 'Kiểm tra')]]");
  private readonly subjectDropdownBtn = By.xpath("//button[.//span[contains(text(), 'Môn học') or contains(text(), 'Toán') or contains(text(), 'Vật lý') or contains(text(), 'Hóa học') or contains(text(), 'Ngữ văn')]]");
  private readonly difficultyDropdownBtn = By.xpath("//button[.//span[contains(text(), 'Độ khó') or contains(text(), 'Cơ bản') or contains(text(), 'Vận dụng')]]");
  private readonly resetFilterBtn = By.xpath("//button[contains(., 'Xóa lọc') or contains(., 'Xóa tất cả bộ lọc')]");
  private readonly emptyStateHeading = By.xpath("//h3[contains(text(), 'Không tìm thấy đề thi phù hợp')]");
  private readonly examCards = By.css("article");
  private readonly pinBanner = By.xpath("//div[contains(text(), 'Đã tìm thấy phòng thi theo Mã PIN')]");

  // --- Locators: Modal Sảnh Chờ Thi (Module M6) ---
  private readonly modalContainer = By.css("div.max-w-xl");
  private readonly modalTitle = By.css("div.max-w-xl h2");
  private readonly modalDuration = By.xpath("//div[text()='Thời gian']/following-sibling::div");
  private readonly modalQuestionCount = By.xpath("//div[text()='Số lượng câu']/following-sibling::div");
  private readonly modalStartBtn = By.xpath("//button[contains(., 'Bắt đầu làm bài ngay')]");
  private readonly modalBackBtn = By.xpath("//div[contains(@class, 'max-w-xl')]//button[contains(., 'Quay lại')]");
  private readonly modalCloseIcon = By.xpath("//div[contains(@class, 'max-w-xl')]//button[./*[name()='svg'] and not(contains(., 'Quay lại'))]");
  private readonly firstCardCopyBtn = By.xpath("(//article//button[contains(., 'MÃ:') or contains(., 'Đã chép!')])[1]");

  async openPage(): Promise<this> {
    await this.open('/exam');
    await this.waitVisible(this.searchInput);
    return this;
  }

  // --- Thao tác Module M5: Tìm kiếm & Lọc ---

  async searchExam(keyword: string): Promise<void> {
    await this.type(this.searchInput, keyword);
    // Chờ 350ms để debounce tìm kiếm phía UI kích hoạt
    await this.driver.sleep(400);
  }

  async clearSearch(): Promise<void> {
    try {
      if (await this.isDisplayed(this.clearSearchBtn)) {
        await this.click(this.clearSearchBtn);
      } else {
        const input = await this.waitVisible(this.searchInput);
        await input.clear();
      }
    } catch {
      const input = await this.waitVisible(this.searchInput);
      await input.clear();
    }
    await this.driver.sleep(400);
  }

  async selectCategory(categoryName: string): Promise<void> {
    await this.click(this.categoryDropdownBtn);
    const itemLocator = By.xpath(`//div[contains(@class, 'animate-in')]//button[contains(., '${categoryName}')]`);
    await this.click(itemLocator);
    await this.driver.sleep(300);
  }

  async selectSubject(subjectName: string): Promise<void> {
    await this.click(this.subjectDropdownBtn);
    const itemLocator = By.xpath(`//div[contains(@class, 'animate-in')]//button[contains(., '${subjectName}')]`);
    await this.click(itemLocator);
    await this.driver.sleep(300);
  }

  async selectDifficulty(difficultyName: string): Promise<void> {
    await this.click(this.difficultyDropdownBtn);
    const itemLocator = By.xpath(`//div[contains(@class, 'animate-in')]//button[contains(., '${difficultyName}')]`);
    await this.click(itemLocator);
    await this.driver.sleep(300);
  }

  async resetFilters(): Promise<void> {
    await this.click(this.resetFilterBtn);
    await this.driver.sleep(400);
  }

  async getExamCardCount(): Promise<number> {
    try {
      const cards = await this.driver.findElements(this.examCards);
      return cards.length;
    } catch {
      return 0;
    }
  }

  async getAllCardTitles(): Promise<string[]> {
    const titles: string[] = [];
    const elements = await this.driver.findElements(By.css('article h3'));
    for (const el of elements) {
      titles.push(await el.getText());
    }
    return titles;
  }

  async isEmptyStateDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.emptyStateHeading);
  }

  async isPinBannerDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.pinBanner);
  }

  // --- Thao tác Module M6: Sảnh Chờ & Modal Xác Nhận ---

  async openFirstExamModal(): Promise<void> {
    const firstJoinBtn = By.xpath("(//article//button[contains(., 'Vào thi')])[1]");
    await this.click(firstJoinBtn);
    await this.waitVisible(this.modalContainer);
  }

  async isModalDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.modalContainer);
  }

  async getModalExamTitle(): Promise<string> {
    return this.getText(this.modalTitle);
  }

  async getModalDurationText(): Promise<string> {
    return this.getText(this.modalDuration);
  }

  async getModalQuestionCountText(): Promise<string> {
    return this.getText(this.modalQuestionCount);
  }

  async closeModalByBackBtn(): Promise<void> {
    await this.click(this.modalBackBtn);
    await this.driver.sleep(300);
  }

  async closeModalByEsc(): Promise<void> {
    const body = await this.driver.findElement(By.css('body'));
    await body.sendKeys(Key.ESCAPE);
    await this.driver.sleep(300);
  }

  async startExam(): Promise<void> {
    await this.click(this.modalStartBtn);
  }

  async copyExamCode(): Promise<void> {
    await this.click(this.firstCardCopyBtn);
    await this.driver.sleep(200);
  }

  async isCopySuccessDisplayed(): Promise<boolean> {
    try {
      const btnText = await this.getText(this.firstCardCopyBtn);
      return btnText.includes('Đã chép!');
    } catch {
      return false;
    }
  }
}

