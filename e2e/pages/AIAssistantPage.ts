import { By, until, type WebDriver, type WebElement, Key } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object Model cho phần mở rộng: AI Study Assistant & Lộ trình học (/assistant)
 * Tuân thủ chuẩn ISTQB: Đóng gói toàn bộ selector và hành động, KHÔNG chứa assertion.
 */
export class AIAssistantPage extends BasePage {
  // --- Locators: Màn hình Chào mừng (Welcome Stage) ---
  private readonly mascotImage = By.css("img[alt='Capy AI Assistant']");
  private readonly welcomeHeading = By.xpath("//h1[contains(., 'Rất vui được gặp bạn') or contains(., 'Sun')]");
  private readonly chatInput = By.css("input[placeholder*='Hỏi Capy AI bất cứ điều gì']");
  private readonly sendButton = By.css("button[title='Gửi câu hỏi']");

  // --- Locators: Thẻ gợi ý nhanh (Quick Prompts) ---
  private readonly quickPromptPills = By.xpath("//button[contains(@class, 'rounded-full') and .//span[contains(text(), 'Bóc tách') or contains(text(), 'Casio') or contains(text(), 'Công thức') or contains(text(), 'Chiến thuật')]]");

  // --- Locators: Bộ chọn mô hình AI (Model Selector) ---
  private readonly modelDropdownToggle = By.xpath("//button[.//span[contains(text(), 'Capy Mentor') or contains(text(), 'AI Exam Scanner') or contains(text(), 'Deep Reasoning')]]");
  private readonly modelDropdownMenu = By.xpath("//div[contains(@class, 'rounded-2xl') and contains(@class, 'bg-white')]");

  // --- Locators: Sidebar & Lịch sử trò chuyện ---
  private readonly newChatBtn = By.xpath("//button[contains(., 'Trò chuyện mới')]");
  private readonly searchHistoryInput = By.css("input[placeholder*='Tìm kiếm đoạn chat']");

  // --- Locators: Luồng tin nhắn hội thoại ---
  private readonly userMessageBubbles = By.css("div[class*='bg-[#14301d]']");
  private readonly assistantMessageCards = By.css("div[class*='rounded-[24px]']");

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Mở trực tiếp trang AI Assistant (/assistant)
   */
  async openPage(): Promise<this> {
    await this.open('/assistant');
    await this.waitVisible(this.chatInput);
    await this.driver.sleep(800);
    return this;
  }

  /**
   * Kiểm tra Mascot Capy 3D có hiển thị không
   */
  async isMascotDisplayed(): Promise<boolean> {
    return await this.isDisplayed(this.mascotImage);
  }

  /**
   * Lấy tiêu đề chào mừng tại trung tâm màn hình
   */
  async getWelcomeHeadingText(): Promise<string> {
    try {
      const el = await this.waitVisible(this.welcomeHeading);
      return await el.getText();
    } catch {
      return '';
    }
  }

  /**
   * Mở dropdown chọn mô hình AI
   */
  async openModelDropdown(): Promise<void> {
    const btn = await this.waitVisible(this.modelDropdownToggle);
    await btn.click();
    await this.waitVisible(this.modelDropdownMenu);
    await this.driver.sleep(400);
  }

  /**
   * Chọn một mô hình AI cụ thể (VD: "Deep Reasoning 9+")
   */
  async selectModel(modelName: string): Promise<void> {
    await this.openModelDropdown();
    const itemLocator = By.xpath(`//button[contains(., '${modelName}')]`);
    const item = await this.waitVisible(itemLocator);
    await item.click();
    await this.driver.sleep(500);
  }

  /**
   * Lấy tên mô hình AI đang được chọn hiện tại
   */
  async getSelectedModelName(): Promise<string> {
    const toggle = await this.waitVisible(this.modelDropdownToggle);
    return await toggle.getText();
  }

  /**
   * Bấm vào một thẻ gợi ý nhanh (Quick Prompt)
   */
  async clickQuickPromptByText(promptSnippet: string): Promise<void> {
    const pillLocator = By.xpath(`//button[contains(@class, 'rounded-full') and .//span[contains(text(), '${promptSnippet}')]]`);
    const pill = await this.waitVisible(pillLocator);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center" });', pill);
    await pill.click();
    await this.driver.sleep(1000);
  }

  /**
   * Nhập nội dung câu hỏi vào ô chat và gửi
   */
  async sendChatMessage(message: string): Promise<void> {
    const input = await this.waitVisible(this.chatInput);
    await this.typeWithReactSetter(input, message);
    await this.driver.sleep(300);

    const sendBtn = await this.waitVisible(this.sendButton);
    await sendBtn.click();
    await this.driver.sleep(1200);
  }

  /**
   * Kiểm tra tin nhắn người dùng đã gửi có xuất hiện trong luồng chat không
   */
  async hasUserMessage(textSnippet: string): Promise<boolean> {
    try {
      const bubbles = await this.driver.findElements(this.userMessageBubbles);
      for (const b of bubbles) {
        const text = await b.getText();
        if (text.includes(textSnippet)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Bấm nút "Trò chuyện mới" trên thanh menu bên trái
   */
  async clickNewChat(): Promise<void> {
    const btn = await this.waitVisible(this.newChatBtn);
    await btn.click();
    await this.driver.sleep(600);
  }

  /**
   * Kiểm tra màn hình chào mừng có đang ở trạng thái rỗng ban đầu không
   */
  async isWelcomeScreenActive(): Promise<boolean> {
    return (await this.isDisplayed(this.mascotImage)) && (await this.isDisplayed(this.chatInput));
  }

  /**
   * Helper kích hoạt sự kiện input cho React 19 State update
   */
  private async typeWithReactSetter(element: WebElement, text: string): Promise<void> {
    await this.driver.executeScript(
      `
      const el = arguments[0];
      const val = arguments[1] ?? '';
      const proto = window.HTMLInputElement.prototype;
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

