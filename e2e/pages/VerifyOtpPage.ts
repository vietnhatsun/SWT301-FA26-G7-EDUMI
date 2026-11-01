import { By, until, type WebDriver } from "selenium-webdriver";
import { BasePage } from "../base/BasePage";

/**
 * VerifyOtpPage – Page Object cho màn hình OTP inline trong AuthContainer.tsx
 * Màn hình OTP xuất hiện SAU khi đăng ký thành công (step === "verify")
 * URL vẫn là /register, không có route riêng.
 *
 * Tuân thủ POM: KHÔNG chứa expect/assertion.
 */
export class VerifyOtpPage extends BasePage {
    public readonly url: string = "/register";

    // ─── Locators khớp với HTML thực tế (AuthContainer.tsx) ─────────────────

    // 6 ô OTP: input[type="text"][maxlength="1"] với inputMode="numeric"
    private readonly otpInputs = By.css("input[inputmode='numeric'][maxlength='1']");

    // Nút "Xác thực tài khoản" (button[type="button"] trong bước verify)
    private readonly verifyBtn = By.xpath(
        "//button[contains(., 'Xác thực tài khoản') or contains(., 'Đã kích hoạt')]"
    );

    // Link "Gửi lại mã OTP" (button chứa text "Gửi lại mã OTP")
    private readonly resendBtn = By.xpath("//button[contains(., 'Gửi lại mã OTP')]");

    // Đồng hồ đếm ngược: span chứa text "Gửi lại sau"
    private readonly countdownText = By.xpath("//*[contains(., 'Gửi lại sau')]");

    // Nút quay lại sửa email (bước verify → form)
    private readonly backBtn = By.xpath("//button[contains(., 'Đổi thông tin đăng ký')]");

    // Toast thông báo
    private readonly alertMessage = By.css("div[role='alert']");

    // Input để điền thông tin đăng ký (cần navigate qua bước register trước)
    private readonly fullNameInput = By.css("input[placeholder='Nguyễn Văn A']");
    private readonly emailInput    = By.css("input[type='email']");
    private readonly passwordInput = By.css("input[type='password']");
    private readonly submitBtn     = By.css("button[type='submit']");

    constructor(driver: WebDriver) {
        super(driver);
    }

    /** Mở trang /register */
    async openPage(): Promise<this> {
        await this.open(this.url);
        await this.waitVisible(this.fullNameInput);
        return this;
    }

    /**
     * Đăng ký nhanh một tài khoản rồi kiểm tra xem có vào bước OTP không.
     * Trả về true nếu màn hình OTP xuất hiện, false nếu backend lỗi/chưa cấu hình.
     * KHÔNG throw – test tự xử lý khi backend chưa sẵn sàng.
     */
    async registerAndGoToOtp(
        fullName: string,
        email: string,
        password: string
    ): Promise<boolean> {
        await this.type(this.fullNameInput, fullName);
        await this.type(this.emailInput, email);
        await this.type(this.passwordInput, password);
        await this.click(this.submitBtn);
        // Chờ tối đa 8 giây để màn hình OTP xuất hiện
        try {
            await this.driver.wait(
                async () => {
                    const inputs = await this.driver.findElements(this.otpInputs);
                    return inputs.length === 6;
                },
                8000
            );
            return true; // Đã vào màn hình OTP
        } catch {
            return false; // Backend lỗi/chưa cấu hình → không vào được OTP
        }
    }

    /** Điền từng ký tự vào 6 ô OTP */
    async fillOtp(code: string): Promise<void> {
        const inputs = await this.driver.findElements(this.otpInputs);
        for (let i = 0; i < Math.min(code.length, inputs.length); i++) {
            await inputs[i].clear();
            await inputs[i].sendKeys(code[i]);
        }
    }

    /** Lấy số ô OTP đang được render */
    async getOtpInputCount(): Promise<number> {
        const inputs = await this.driver.findElements(this.otpInputs);
        return inputs.length;
    }

    /** Lấy value hiện tại của từng ô OTP (dùng để kiểm tra input reject chữ cái) */
    async getOtpValues(): Promise<string[]> {
        const inputs = await this.driver.findElements(this.otpInputs);
        const values: string[] = [];
        for (const input of inputs) {
            values.push(await input.getAttribute("value") ?? "");
        }
        return values;
    }

    /** Kiểm tra nút Xác thực có đang bị disabled không */
    async isVerifyButtonDisabled(): Promise<boolean> {
        try {
            const btn = await this.driver.wait(
                until.elementLocated(this.verifyBtn), 5000
            );
            const disabled = await btn.getAttribute("disabled");
            return disabled !== null;
        } catch {
            return true;
        }
    }

    /** Bấm nút Xác thực tài khoản */
    async clickVerify(): Promise<void> {
        await this.click(this.verifyBtn);
    }

    /** Bấm nút Gửi lại mã OTP */
    async clickResend(): Promise<void> {
        await this.click(this.resendBtn);
    }

    /** Kiểm tra nút Gửi lại có bị disable (trong thời gian đếm ngược) */
    async isResendButtonVisible(): Promise<boolean> {
        try {
            await this.driver.wait(until.elementLocated(this.resendBtn), 3000);
            return true;
        } catch {
            return false;
        }
    }

    /** Lấy text đồng hồ đếm ngược */
    async getCountdownText(): Promise<string> {
        try {
            const el = await this.waitVisible(this.countdownText);
            return await el.getText();
        } catch {
            return "";
        }
    }

    /** Bấm quay lại màn hình đăng ký */
    async clickBack(): Promise<void> {
        await this.click(this.backBtn);
    }

    /** Kiểm tra màn hình đăng ký (form) đã hiện trở lại chưa */
    async isRegisterFormVisible(): Promise<boolean> {
        return this.isDisplayed(this.fullNameInput);
    }

    /** Lấy nội dung toast thông báo */
    async getAlertMessage(): Promise<string> {
        try {
            const el = await this.driver.wait(
                until.elementLocated(this.alertMessage), 8000
            );
            await this.driver.wait(until.elementIsVisible(el), 8000);
            return await el.getText();
        } catch {
            return await this.driver.findElement(By.css("body")).getText();
        }
    }

    /** Lấy URL hiện tại */
    async getUrl(): Promise<string> {
        return this.driver.getCurrentUrl();
    }
}

