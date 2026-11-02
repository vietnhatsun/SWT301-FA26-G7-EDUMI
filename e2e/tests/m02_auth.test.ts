import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { LoginPage } from '../pages/LoginPage';
import { readCsv } from '../utils/csv';
import { env } from '../config/env';

interface AuthRow extends Record<string, string> {
  tcId: string;
  description: string;
  email: string;
  password: string;
  expectedType: 'SUCCESS' | 'ERROR' | 'WARNING' | 'VALIDATION';
  expectedMessage: string;
  expectedRedirect: string;
}

describe('Module M02: Xác thực Đăng nhập & Phân quyền (Authentication & Roles)', () => {
  const browser = useDriver();
  const testCases = readCsv<AuthRow>('e2e/data/m02_auth_data.csv');

  it.each(testCases)('$tcId: $description', async (row) => {
    const driver = browser.get();
    const loginPage = new LoginPage(driver);

    // Mở trang đăng nhập
    await loginPage.openPage();

    // Dọn dẹp session cũ nếu có để tránh ảnh hưởng giữa các test case
    await loginPage.clearSession();

    // Thay thế placeholder bằng tài khoản cấu hình trong .env.e2e nếu có
    let email = row.email;
    if (email === '{STUDENT_EMAIL}') {
      email = env.accounts.student.email || 'student@edumi.vn';
    } else if (email === '{TEACHER_EMAIL}') {
      email = env.accounts.teacher.email || 'teacher@edumi.vn';
    }

    let password = row.password;
    if (password === '{STUDENT_PASSWORD}') {
      password = env.accounts.student.password || 'Secret@123';
    } else if (password === '{TEACHER_PASSWORD}') {
      password = env.accounts.teacher.password || 'Teacher@123';
    }

    switch (row.tcId) {
      case 'TC-M02-01': {
        // BR-M1-01: Đăng nhập thành công với tài khoản học sinh
        expect(await loginPage.isEmailInputDisplayed(), 'Ô nhập Email phải hiển thị').toBe(true);
        expect(await loginPage.isPasswordInputDisplayed(), 'Ô nhập Mật khẩu phải hiển thị').toBe(true);
        expect(await loginPage.isSubmitButtonDisplayed(), 'Nút Đăng nhập phải hiển thị').toBe(true);

        await loginPage.login(email, password);

        const isSuccess = await loginPage.waitForSuccessOrRedirect(row.expectedMessage, row.expectedRedirect);
        expect(isSuccess, 'Đăng nhập học sinh thành công phải hiển thị thông báo hoặc chuyển hướng /profile').toBe(true);
        break;
      }

      case 'TC-M02-02': {
        // BR-M1-02: Báo lỗi khi nhập sai mật khẩu
        await loginPage.login(email, password);

        const alertText = await loginPage.waitForToastText('Email hoặc mật khẩu');
        expect(alertText, 'Hệ thống phải báo lỗi email hoặc mật khẩu không chính xác').toContain(row.expectedMessage);

        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl, 'Người dùng phải ở lại trang đăng nhập').toContain(row.expectedRedirect);
        break;
      }

      case 'TC-M02-03': {
        // BR-M1-02: Báo lỗi khi email không tồn tại
        await loginPage.login(email, password);

        const alertText = await loginPage.waitForToastText('Email hoặc mật khẩu');
        expect(alertText, 'Hệ thống phải báo lỗi không tìm thấy tài khoản').toContain(row.expectedMessage);

        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl, 'Không chuyển trang khi email không tồn tại').toContain(row.expectedRedirect);
        break;
      }

      case 'TC-M02-04': {
        // BR-M1-03: Chặn submit khi để trống trường email (Client validation)
        if (password) await loginPage.fillPassword(password);
        await loginPage.submit();

        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl, 'Form phải chặn submit, URL vẫn ở /login').toContain(row.expectedRedirect);
        break;
      }

      case 'TC-M02-05': {
        // BR-M1-03: Chặn submit khi để trống mật khẩu (Client validation)
        if (email) await loginPage.fillEmail(email);
        await loginPage.submit();

        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl, 'Form phải chặn submit khi mật khẩu trống').toContain(row.expectedRedirect);
        break;
      }

      case 'TC-M02-06': {
        // BR-M1-04: Mật khẩu phân biệt hoa thường
        await loginPage.login(email, password);

        const alertText = await loginPage.waitForToastText('Email hoặc mật khẩu');
        expect(alertText, 'Mật khẩu sai hoa thường phải bị từ chối').toContain(row.expectedMessage);
        break;
      }

      case 'TC-M02-07': {
        // BR-M1-05: Chặn đăng nhập tài khoản chưa kích hoạt OTP
        await loginPage.login(email, password);

        const alertText = await loginPage.waitForToastText('xác thực');
        expect(alertText.toLowerCase(), 'Phải cảnh báo tài khoản chưa kích hoạt OTP').toMatch(
          /chưa được xác thực|xác thực|otp|kích hoạt/
        );
        break;
      }

      case 'TC-M02-08': {
        // BR-M1-06: Chặn đăng nhập tài khoản bị khóa
        await loginPage.login(email, password);

        const alertText = await loginPage.waitForToastText('khóa');
        expect(alertText.toLowerCase(), 'Phải báo tài khoản đã bị khóa').toMatch(
          /bị khóa|liên hệ|quản trị viên/
        );
        break;
      }

      case 'TC-M02-09': {
        // BR-M1-07: Đăng nhập tài khoản Giáo viên thành công
        await loginPage.login(email, password);

        const isSuccess = await loginPage.waitForSuccessOrRedirect(row.expectedMessage, row.expectedRedirect);
        expect(isSuccess, 'Đăng nhập giáo viên phải thành công và điều hướng').toBe(true);
        break;
      }

      case 'TC-M02-10': {
        // BR-M1-10: Chống tấn công SQL Injection
        // Trình duyệt chặn submit bằng HTML5 input validation hoặc API Supabase từ chối an toàn
        await loginPage.login(email, password);

        // Đảm bảo không bị lọt vào hệ thống (/profile) và không bị lỗi crash 500
        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl, 'Tấn công SQL Injection bị chặn, URL phải giữ nguyên ở /login').toContain('/login');
        expect(currentUrl, 'Hệ thống an toàn tuyệt đối, không crash lỗi 500').not.toContain('500');

        // Nếu có thông báo xuất hiện thì không được là đăng nhập thành công
        const alertText = await loginPage.getToastAlertText(2000);
        if (alertText) {
          expect(alertText.toLowerCase()).not.toContain('thành công');
        }
        break;
      }

      default:
        throw new Error(`Chưa xử lý Test Case: ${row.tcId}`);
    }
  });
});
