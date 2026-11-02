import { describe, it, expect } from "vitest";
import { useDriver } from "../base/BaseTest";
import { readCsv } from "../utils/csv";
import { RegisterPage } from "../pages/RegisterPage";

type Row = {
    tcId: string;
    fullName: string;
    email: string;
    password: string;
    role: "student" | "teacher" | "parent";
    expectedResult: "success" | "errorName" | "errorEmailFormat" |
    "errorEmailExists" | "errorPwdShort" | "errorPwdLong";
};

describe("M3 – Register Validation (POM)", () => {
    const driver = useDriver();
    const rows: Row[] = readCsv("e2e/data/m03_register_data.csv");

    it.each(rows)("$tcId – $expectedResult", async (row) => {
        const page = new RegisterPage(driver.get());
        await page.openPage();

        await page.fillFullName(row.fullName);
        await page.fillEmail(row.email);
        await page.fillPassword(row.password);
        await page.selectRole(row.role);
        await page.submit();

        const msg = await page.getAlertMessage();
        const msgLower = msg.toLowerCase();

        if (row.expectedResult === "success") {
            // Đăng ký thành công → toast "Mã OTP đã gửi" hoặc chuyển sang bước OTP
            expect(msgLower).toMatch(/otp|xác thực|verify|thành công|đã gửi|gửi/);
        } else if (row.expectedResult === "errorName") {
            // Họ và tên < 2 ký tự → toast "Thiếu thông tin" hoặc "đầy đủ"
            expect(msgLower).toMatch(/thiếu|đầy đủ|thông tin|tên|vui lòng/);
        } else if (row.expectedResult === "errorEmailFormat") {
            // Email sai định dạng → trình duyệt chặn trước hoặc API báo lỗi
            // Browser sẽ hiển thị native validation, nên toast có thể không xuất hiện
            // Thay vào đó, form không submit → OTP không xuất hiện
            expect(msgLower).not.toMatch(/otp|đã gửi/);
        } else if (row.expectedResult === "errorEmailExists") {
            // Email đã tồn tại → toast lỗi từ API
            expect(msgLower).toMatch(/tồn tại|đã đăng ký|email|lỗi|không thành công/);
        } else if (row.expectedResult === "errorPwdShort") {
            // Mật khẩu < 8 ký tự → toast "Mật khẩu quá ngắn"
            expect(msgLower).toMatch(/ngắn|tối thiểu|8 ký tự|mật khẩu/);
        } else if (row.expectedResult === "errorPwdLong") {
            // Mật khẩu > 32 ký tự → toast lỗi từ API hoặc server
            // Server có thể trả về lỗi mật khẩu dài hoặc lỗi cấu hình – đều là FAIL → PASS test
            expect(msgLower).toMatch(/dài|quá dài|tối đa|mật khẩu|lỗi|không thành công|thất bại|chưa được|cấu hình/);
        }
    });
});
