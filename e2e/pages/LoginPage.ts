import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object đại diện cho trang Đăng nhập (/login - AuthContainer.tsx)
 * Tuân thủ chuẩn POM của ISTQB: chỉ tương tác và lấy dữ liệu, KHÔNG chứa assertion.
 */
export class LoginPage extends BasePage {
  public readonly url: string = '/login';

  // Locators bám sát DOM thực tế của AuthContainer.tsx
  private readonly emailInput = By.css("input[type='email']");
  private readonly passwordInput = By.css("input[type='password'], input[placeholder='••••••••']");
  private readonly submitBtn = By.css("button[type='submit']");
  private readonly toastAlert = By.css("div[role='alert']");
  private readonly toastTitle = By.css("div[role='alert'] h4");
  private readonly toastMessage = By.css("div[role='alert'] p");
  private readonly forgotPasswordLink = By.css("a[href='/forgot-password']");
  private readonly registerTabBtn = By.xpath("//button[text()='ĐĂNG KÝ']");
  private readonly loginTabBtn = By.xpath("//button[text()='ĐĂNG NHẬP']");
  private readonly googleBtn = By.xpath("//button[.//span[contains(text(), 'Google')]]");

  constructor(driver: WebDriver) {
    super(driver);
  }

  /** Mở trang đăng nhập */
  async openPage(): Promise<this> {
    await this.open(this.url);
    await this.waitForLoad();
    return this;
  }

  /** Xóa toàn bộ cookie để phiên luôn sạch trước mỗi bài test */
  async clearSession(): Promise<void> {
    try {
      await this.driver.manage().deleteAllCookies();
    } catch {
      // bỏ qua nếu browser chưa ở trong domain
    }
  }

  /** Chờ form đăng nhập sẵn sàng tương tác */
  async waitForLoad(): Promise<void> {
    await this.waitVisible(this.emailInput);
  }

  async fillEmail(email: string): Promise<void> {
    await this.type(this.emailInput, email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  async submit(): Promise<void> {
    await this.click(this.submitBtn);
  }

  /** Thực hiện quy trình đăng nhập hoàn chỉnh */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Lấy toàn bộ nội dung trong Floating Toast Notification */
  async getToastAlertText(timeoutMs: number = 3000): Promise<string> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.toastAlert), timeoutMs);
      await this.driver.wait(until.elementIsVisible(el), timeoutMs);
      return await el.getText();
    } catch {
      return '';
    }
  }

  /** Chờ và lấy text Toast có chứa từ khóa mong muốn */
  async waitForToastText(expectedText?: string): Promise<string> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.toastAlert), 7000);
      await this.driver.wait(until.elementIsVisible(el), 7000);
      if (expectedText) {
        await this.driver.wait(async () => {
          const txt = await el.getText();
          return txt.toLowerCase().includes(expectedText.toLowerCase());
        }, 7000);
      }
      return await el.getText();
    } catch {
      return await this.getToastAlertText();
    }
  }

  /** Chờ đăng nhập thành công: hoặc toast thành công hiện ra, hoặc URL chuyển sang trang đích */
  async waitForSuccessOrRedirect(expectedMessage: string, expectedRedirect: string): Promise<boolean> {
    try {
      await this.driver.wait(async () => {
        const url = await this.driver.getCurrentUrl();
        if (url.includes(expectedRedirect)) return true;
        const toastElements = await this.driver.findElements(this.toastAlert);
        if (toastElements.length > 0) {
          const text = await toastElements[0].getText();
          if (text.includes(expectedMessage)) return true;
        }
        return false;
      }, 10000);
      return true;
    } catch {
      return false;
    }
  }

  /** Lấy riêng đoạn text mô tả lỗi / thông báo trong Toast */
  async getToastMessage(): Promise<string> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.toastMessage), 6000);
      await this.driver.wait(until.elementIsVisible(el), 6000);
      return await el.getText();
    } catch {
      return await this.getToastAlertText();
    }
  }

  /** Kiểm tra xem Toast alert có đang hiển thị không */
  async isToastAlertDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.toastAlert);
  }

  async isEmailInputDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.emailInput);
  }

  async isPasswordInputDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.passwordInput);
  }

  async isSubmitButtonDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.submitBtn);
  }

  async isForgotPasswordLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.forgotPasswordLink);
  }

  async isGoogleButtonDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.googleBtn);
  }

  /** Chuyển sang tab Đăng ký */
  async switchToRegister(): Promise<void> {
    await this.click(this.registerTabBtn);
  }

  /** Click Quên mật khẩu */
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }
}
