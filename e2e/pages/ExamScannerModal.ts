import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object Model cho Module M10: AI Exam Scanner & LaTeX Preview
 * Tương tác với ExamScannerModal.tsx trong giao diện Quản lý đề thi của Staff.
 * Tuân thủ chuẩn ISTQB: Chỉ chứa locator và các hàm tương tác, KHÔNG chứa assertion.
 */
export class ExamScannerModal extends BasePage {
  // --- Locators: Trang Đăng nhập & Sidebar Staff ---
  private readonly emailInput = By.css("input[type='email']");
  private readonly passwordInput = By.css("input[type='password'], input[placeholder='••••••••']");
  private readonly loginSubmitBtn = By.css("button[type='submit']");
  private readonly examPostsTabBtn = By.xpath("//button[.//span[contains(text(), 'Đăng bài thi')] or contains(., 'Đăng bài thi')]");
  private readonly createSubTabBtn = By.xpath("//button[contains(., 'Đăng bài thi mới') or contains(., 'Tạo bài thi đầu tiên')]");
  private readonly examTitleInput = By.css("input[placeholder*='Đề thi thử THPT Quốc Gia']");

  // --- Locators: Nút mở Modal Scanner trên trang tạo đề ---
  private readonly openScannerBtn = By.xpath("//button[contains(., 'Scan đề') or contains(., 'Scan đề & Điền đáp án AI')]");

  // --- Locators: Bên trong Modal AI Scanner ---
  private readonly modalContainer = By.xpath("//h3[contains(text(), 'AI Exam Scanner')]/ancestor::div[contains(@class, 'rounded-3xl')]");
  private readonly modalHeaderTitle = By.xpath("//h3[contains(text(), 'AI Exam Scanner')]");
  private readonly closeModalXBtn = By.css("button[title='Đóng cửa sổ']");
  private readonly cancelModalBtn = By.xpath("//button[contains(text(), 'Hủy bỏ')]");

  // --- Locators: Tabs bên trong Modal ---
  private readonly uploadTabBtn = By.xpath("//button[contains(., 'Tải tệp đề thi')]");
  private readonly pasteTabBtn = By.xpath("//button[contains(., 'Dán nội dung thô')]");

  // --- Locators: Tab Dán văn bản thô ---
  private readonly rawTextarea = By.css("textarea[placeholder*='Dán toàn bộ văn bản đề thi']");
  private readonly sampleTextBtn = By.xpath("//button[contains(., 'Thử dán đề mẫu')]");

  // --- Locators: Tab Tải tệp ---
  private readonly dropzoneArea = By.xpath("//*[contains(text(), 'Kéo thả các trang đề thi')]");
  private readonly hiddenFileInput = By.css("input[type='file']");

  // --- Locators: Tiến trình quét & Điều khiển ---
  private readonly startScanBtn = By.xpath("//button[contains(., 'Bắt đầu Quét')]");
  private readonly stopScanBtn = By.xpath("//button[contains(., 'Dừng quét')]");
  private readonly scanningIndicator = By.xpath("//span[contains(text(), 'Đang phân tích') or contains(text(), 'Đang xử lý')]");
  private readonly stoppedMessage = By.xpath("//*[contains(text(), 'Đã dừng quá trình quét')]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Đăng nhập tài khoản Staff và điều hướng vào trang tạo đề thi
   */
  async setupStaffExamForm(email: string, pass: string): Promise<void> {
    await this.open('/login');
    await this.waitVisible(this.emailInput);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, pass);
    await this.click(this.loginSubmitBtn);
    await this.driver.wait(until.urlContains('/profile'), 15000);
    await this.driver.sleep(800);

    // Bấm vào tab "Đăng bài thi" trên Sidebar
    await this.waitVisible(this.examPostsTabBtn);
    await this.click(this.examPostsTabBtn);
    await this.driver.sleep(800);

    // Chuyển sang form tạo đề nếu chưa ở đó
    if (!(await this.isDisplayed(this.examTitleInput))) {
      const btn = await this.waitVisible(this.createSubTabBtn);
      await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
      await btn.click();
      await this.waitVisible(this.examTitleInput);
      await this.driver.sleep(600);
    }
  }

  /**
   * Bấm nút mở Modal AI Exam Scanner
   */
  async openScannerModal(): Promise<void> {
    const btn = await this.waitVisible(this.openScannerBtn);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', btn);
    await btn.click();
    await this.waitVisible(this.modalHeaderTitle);
    await this.driver.sleep(500);
  }

  /**
   * Kiểm tra Modal Scanner có đang hiển thị không
   */
  async isModalDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.modalHeaderTitle);
  }

  /**
   * Chuyển sang Tab "Dán nội dung thô (Paste Text)"
   */
  async switchToPasteTab(): Promise<void> {
    const btn = await this.waitVisible(this.pasteTabBtn);
    await btn.click();
    await this.waitVisible(this.rawTextarea);
    await this.driver.sleep(400);
  }

  /**
   * Chuyển sang Tab "Tải tệp đề thi & Bảng đáp án"
   */
  async switchToUploadTab(): Promise<void> {
    const btn = await this.waitVisible(this.uploadTabBtn);
    await btn.click();
    await this.waitVisible(this.dropzoneArea);
    await this.driver.sleep(400);
  }

  /**
   * Kiểm tra ô Textarea dán nội dung thô có hiển thị không
   */
  async isTextareaDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.rawTextarea);
  }

  /**
   * Kiểm tra vùng kéo thả file tệp có hiển thị không
   */
  async isDropzoneDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.dropzoneArea);
  }

  /**
   * Bấm nút "Thử dán đề mẫu môn ..."
   */
  async clickSampleExamText(): Promise<void> {
    const btn = await this.waitVisible(this.sampleTextBtn);
    await btn.click();
    await this.driver.sleep(500);
  }

  /**
   * Lấy giá trị văn bản hiện tại trong ô textarea
   */
  async getTextareaContent(): Promise<string> {
    const ta = await this.waitVisible(this.rawTextarea);
    return (await ta.getAttribute('value')) ?? '';
  }

  /**
   * Nhập nội dung văn bản đề thi tùy chỉnh vào textarea
   */
  async enterRawText(text: string): Promise<void> {
    const ta = await this.waitVisible(this.rawTextarea);
    await this.typeWithReactSetter(ta, text);
    await this.driver.sleep(400);
  }

  /**
   * Bấm nút "Bắt đầu Quét"
   */
  async clickStartScan(): Promise<void> {
    const btn = await this.waitVisible(this.startScanBtn);
    await btn.click();
    await this.driver.sleep(600);
  }

  /**
   * Kiểm tra nút "Bắt đầu Quét" có bị disabled không
   */
  async isStartScanDisabled(): Promise<boolean> {
    try {
      const btn = await this.waitVisible(this.startScanBtn);
      const isEnabled = await btn.isEnabled();
      const disabledAttr = await btn.getAttribute('disabled');
      return !isEnabled || disabledAttr !== null;
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra trạng thái AI Scanning đang chạy (thanh tiến trình/bộ đếm)
   */
  async isScanningStateActive(): Promise<boolean> {
    return (await this.isDisplayed(this.scanningIndicator)) || (await this.isDisplayed(this.stopScanBtn));
  }

  /**
   * Bấm nút "Dừng quét"
   */
  async clickStopScan(): Promise<void> {
    const btn = await this.waitVisible(this.stopScanBtn);
    await btn.click();
    await this.driver.sleep(600);
  }

  /**
   * Kiểm tra thông báo đã dừng quét có hiển thị không
   */
  async isStopScanMessageDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.stoppedMessage);
  }

  /**
   * Đóng modal bằng icon X ở góc trên bên phải
   */
  async closeModalViaX(): Promise<void> {
    const btn = await this.waitVisible(this.closeModalXBtn);
    await btn.click();
    await this.driver.sleep(500);
  }

  /**
   * Đóng modal bằng nút "Hủy bỏ" ở footer
   */
  async closeModalViaCancel(): Promise<void> {
    const btn = await this.waitVisible(this.cancelModalBtn);
    await btn.click();
    await this.driver.sleep(500);
  }

  /**
   * Kiểm tra tiêu đề đề thi ở form ngoài vẫn được bảo toàn sau khi đóng modal
   */
  async isExamTitleFieldPresent(): Promise<boolean> {
    return await this.isDisplayed(this.examTitleInput);
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

