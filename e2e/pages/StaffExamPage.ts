import { By, until, type WebDriver, type WebElement, Key } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object Model cho Module M09: Staff Quản lý Ngân hàng câu hỏi & Tạo đề thi
 * Tương tác với giao diện /profile (Staff Dashboard) và StaffExamManagementPanel.tsx
 * Tuân thủ chuẩn ISTQB: Chỉ chứa locator và phương thức thao tác, KHÔNG chứa assertion (expect).
 */
export class StaffExamPage extends BasePage {
  // --- Locators: Trang Đăng nhập ---
  private readonly emailInput = By.css("input[type='email']");
  private readonly passwordInput = By.css("input[type='password'], input[placeholder='••••••••']");
  private readonly loginSubmitBtn = By.css("button[type='submit']");

  // --- Locators: Sidebar & Điều hướng Staff ---
  private readonly examPostsTabBtn = By.xpath("//button[.//span[contains(text(), 'Đăng bài thi')] or contains(., 'Đăng bài thi')]");

  // --- Locators: SubTabs (Danh sách đề vs Đăng bài thi mới) ---
  private readonly manageSubTabBtn = By.xpath("//button[contains(., 'Danh sách đề thi') or contains(., 'Danh sách bài thi')]");
  private readonly createSubTabBtn = By.xpath("//button[contains(., 'Đăng bài thi mới') or contains(., 'Tạo bài thi đầu tiên')]");

  // --- Locators: Form Thông tin cơ bản đề thi ---
  private readonly examTitleInput = By.css("input[placeholder*='Đề thi thử THPT Quốc Gia']");
  private readonly generateCodeBtn = By.xpath("//button[contains(text(), 'Tự sinh mã')]");

  // --- Locators: Ngân hàng câu hỏi ---
  // Sử dụng contains(., 'câu') thay vì contains(text(), 'câu') để bao gồm cả text node con của React
  private readonly questionsCountBadge = By.xpath("//span[contains(., 'câu') and contains(@class, 'rounded-full')]");
  private readonly totalScoreBadge = By.xpath("//span[contains(., '/ 10.0đ') or contains(., '10.0đ')]");
  private readonly addSingleChoiceBtn = By.xpath("//button[contains(., '+ Trắc nghiệm')]");
  private readonly addTrueFalseBtn = By.xpath("//button[contains(., '+ Đúng / Sai')]");
  private readonly deleteQuestionBtn = By.css("button[title='Xóa câu hỏi này']");
  private readonly questionTextarea = By.css("textarea[placeholder*='Nội dung đề bài câu số']");
  private readonly katexPreviewContainer = By.xpath("//*[contains(@class, 'katex') or contains(text(), 'Xem trước công thức')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Đăng nhập vào hệ thống EduMi bằng email và mật khẩu
   */
  async login(email: string, pass: string): Promise<void> {
    await this.open('/login');
    await this.waitVisible(this.emailInput);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, pass);
    await this.click(this.loginSubmitBtn);
    // Chờ điều hướng sau khi login thành công
    await this.driver.wait(until.urlContains('/profile'), 15000);
    await this.driver.sleep(1000);
  }

  /**
   * Mở trực tiếp trang hồ sơ người dùng
   */
  async openProfilePage(): Promise<this> {
    await this.open('/profile');
    await this.driver.sleep(1000);
    return this;
  }

  /**
   * Chuyển đến tab "Đăng bài thi" trên thanh menu Staff
   */
  async navigateToExamManagement(): Promise<void> {
    await this.waitVisible(this.examPostsTabBtn);
    await this.click(this.examPostsTabBtn);
    await this.driver.sleep(1000);
  }

  /**
   * Kiểm tra giao diện Quản lý đề thi của Staff có hiển thị không
   */
  async isExamManagementDisplayed(): Promise<boolean> {
    try {
      const el = await this.driver.findElements(By.xpath("//*[contains(text(), 'Ngân hàng câu hỏi') or contains(text(), 'Danh sách đề thi') or contains(text(), 'Đăng bài thi mới') or contains(text(), 'Quản lý bài thi')]"));
      return el.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra menu Staff có bị ẩn đối với vai trò học sinh không
   */
  async isStaffSidebarItemPresent(): Promise<boolean> {
    try {
      const items = await this.driver.findElements(this.examPostsTabBtn);
      return items.length > 0 && await items[0].isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Chuyển sang SubTab "Đăng bài thi mới" (Form tạo đề thi)
   */
  async switchToCreateSubTab(): Promise<void> {
    if (await this.isDisplayed(this.examTitleInput)) {
      return;
    }
    const btn = await this.waitVisible(this.createSubTabBtn);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
    await btn.click();
    await this.waitVisible(this.examTitleInput);
    await this.driver.sleep(600);
  }

  /**
   * Chuyển sang SubTab "Danh sách đề thi" (Quản lý bài thi)
   */
  async switchToManageSubTab(): Promise<void> {
    const btn = await this.waitVisible(this.manageSubTabBtn);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
    await btn.click();
    await this.driver.sleep(600);
  }

  /**
   * Điền tiêu đề bài thi và tự sinh mã phòng thi
   */
  async fillExamBasicInfo(title: string): Promise<void> {
    const titleEl = await this.waitVisible(this.examTitleInput);
    await this.typeWithReactSetter(titleEl, title);

    try {
      if (await this.isDisplayed(this.generateCodeBtn)) {
        await this.click(this.generateCodeBtn);
      }
    } catch {
      // bỏ qua nếu đã có mã
    }
    await this.driver.sleep(500);
  }

  /**
   * Lấy giá trị tiêu đề bài thi hiện tại trong ô input
   */
  async getExamTitleValue(): Promise<string> {
    const el = await this.waitVisible(this.examTitleInput);
    return (await el.getAttribute('value')) ?? '';
  }

  /**
   * Thêm 1 câu hỏi trắc nghiệm đơn 4 lựa chọn (A, B, C, D)
   */
  async addSingleChoiceQuestion(): Promise<void> {
    const btn = await this.waitVisible(this.addSingleChoiceBtn);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
    await btn.click();
    await this.driver.sleep(600);
  }

  /**
   * Thêm 1 câu hỏi trắc nghiệm Đúng / Sai 4 ý (a, b, c, d)
   */
  async addTrueFalseQuestion(): Promise<void> {
    const btn = await this.waitVisible(this.addTrueFalseBtn);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
    await btn.click();
    await this.driver.sleep(600);
  }

  /**
   * Lấy số lượng câu hỏi hiện tại từ badge đếm câu
   */
  async getQuestionCountText(): Promise<string> {
    try {
      const badges = await this.driver.findElements(this.questionsCountBadge);
      if (badges.length > 0) {
        await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', badges[0]);
        return await badges[0].getText();
      }
      const allSpans = await this.driver.findElements(By.xpath("//h2[contains(., 'Ngân hàng câu hỏi')]/following-sibling::span"));
      if (allSpans.length > 0) {
        return await allSpans[0].getText();
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Chọn đáp án đúng cho câu hỏi trắc nghiệm (ví dụ chọn B)
   */
  async selectSingleChoiceAnswer(option: string): Promise<void> {
    const optBtnLocator = By.xpath(`//button[@title='Click để chọn ${option} làm đáp án đúng']`);
    const btn = await this.waitVisible(optBtnLocator);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
    await btn.click();
    await this.driver.sleep(500);
  }

  /**
   * Lấy chữ hiển thị trên badge đáp án đúng (VD: "Đáp án đúng: B")
   */
  async getCorrectAnswerBadgeText(): Promise<string> {
    const badgeLocator = By.xpath("//*[contains(text(), 'Đáp án đúng:')]");
    const badge = await this.waitVisible(badgeLocator);
    return await badge.getText();
  }

  /**
   * Xóa một câu hỏi khỏi ngân hàng đề thi
   */
  async deleteFirstQuestion(): Promise<void> {
    const delBtns = await this.driver.findElements(this.deleteQuestionBtn);
    if (delBtns.length > 0) {
      await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', delBtns[0]);
      await delBtns[0].click();
      await this.driver.sleep(600);
    }
  }

  /**
   * Nhập công thức Toán học vào textarea nội dung câu hỏi
   */
  async enterQuestionFormula(formulaText: string): Promise<void> {
    const ta = await this.waitVisible(this.questionTextarea);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', ta);
    await this.typeWithReactSetter(ta, `Nội dung kiểm tra công thức: $${formulaText}$`);
    await this.driver.sleep(800);
  }

  /**
   * Kiểm tra khung xem trước KaTeX có được render không
   */
  async isKaTeXRendered(): Promise<boolean> {
    try {
      const katexElements = await this.driver.findElements(this.katexPreviewContainer);
      return katexElements.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Lấy text hiển thị trên huy hiệu tổng điểm ma trận (VD: "10 / 10.0đ")
   */
  async getTotalScoreBadgeText(): Promise<string> {
    try {
      const badge = await this.waitVisible(this.totalScoreBadge);
      return await badge.getText();
    } catch {
      return '';
    }
  }

  /**
   * Helper kích hoạt sự kiện input cho React 19 State update
   */
  private async typeWithReactSetter(element: WebElement, text: string): Promise<void> {
    await this.driver.executeScript(
      `
      const el = arguments[0];
      const val = arguments[1] ?? '';
      const proto = el.tagName.toLowerCase() === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      `,
      element,
      text
    );
  }
}
