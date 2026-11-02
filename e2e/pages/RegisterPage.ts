import { By, until, type WebDriver, type WebElement } from "selenium-webdriver";
import { BasePage } from "../base/BasePage";

export class RegisterPage extends BasePage {
    public readonly url: string = "/register";

    // ─── Locators khớp với HTML thực tế (AuthContainer.tsx) ───────────────
    // Họ và tên: input[type="text"] bên trong div có class chứa "Họ và tên"
    private readonly fullNameInput = By.css("input[placeholder='Nguyễn Văn A']");

    // Email: input[type="email"]
    private readonly emailInput = By.css("input[type='email']");

    // Mật khẩu: input[type="password"] hoặc input[type="text"] (khi show password)
    private readonly passwordInput = By.css("input[type='password'], input[placeholder='••••••••']");

    // Nút submit: button[type="submit"] nằm trong form
    private readonly submitBtn = By.css("button[type='submit']");

    // Toast thông báo: div[role="alert"] nằm ở góc dưới phải
    private readonly alertMessage = By.css("div[role='alert']");

    // Role buttons: button bên trong grid 3 cột (student/teacher/parent)
    private readonly roleStudentBtn = By.xpath("//button[.//span[text()='Học sinh']]");
    private readonly roleTeacherBtn = By.xpath("//button[.//span[text()='Giáo viên']]");
    private readonly roleParentBtn  = By.xpath("//button[.//span[text()='Phụ huynh']]");

    constructor(driver: WebDriver) {
        super(driver);
    }

    /** Mở trang đăng ký */
    async openPage(): Promise<this> {
        await this.open(this.url);
        await this.waitForLoad();
        return this;
    }

    /** Chờ form đăng ký render xong */
    async waitForLoad(): Promise<void> {
        await this.waitVisible(this.fullNameInput);
    }

    async fillFullName(name: string): Promise<void> {
        await this.type(this.fullNameInput, name);
    }

    async fillEmail(email: string): Promise<void> {
        await this.type(this.emailInput, email);
    }

    async fillPassword(pwd: string): Promise<void> {
        await this.type(this.passwordInput, pwd);
    }

    /** Chọn vai trò bằng cách click nút tương ứng */
    async selectRole(role: "student" | "teacher" | "parent"): Promise<void> {
        const map = {
            student: this.roleStudentBtn,
            teacher: this.roleTeacherBtn,
            parent:  this.roleParentBtn,
        };
        try {
            await this.click(map[role]);
        } catch {
            // Bỏ qua nếu role button không tìm thấy
        }
    }

    async submit(): Promise<void> {
        await this.click(this.submitBtn);
    }

    /**
     * Lấy text từ toast thông báo (div[role="alert"]).
     * Toast xuất hiện ở góc dưới phải màn hình sau khi submit.
     * Nếu không có toast (ví dụ TC-01 redirect sang OTP inline), lấy toàn bộ body.
     */
    async getAlertMessage(): Promise<string> {
        try {
            const el = await this.driver.wait(
                until.elementLocated(this.alertMessage),
                8000
            );
            await this.driver.wait(until.elementIsVisible(el), 8000);
            return await el.getText();
        } catch {
            // Nếu không có toast → đã chuyển sang bước OTP, lấy body text
            return await this.driver.findElement(By.css("body")).getText();
        }
    }
}
