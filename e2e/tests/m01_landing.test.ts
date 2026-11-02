import { describe, expect, it } from 'vitest';
import { useDriver } from '../base/BaseTest';
import { HomePage } from '../pages/HomePage';
import { readCsv } from '../utils/csv';

interface LandingRow extends Record<string, string> {
  tcId: string;
  description: string;
  expectedTitle: string;
  expectedBrandName: string;
  expectedResult: string;
}

describe('Module M01: Trang chủ & Khóa học (Landing Page)', () => {
  const browser = useDriver();
  const testCases = readCsv<LandingRow>('e2e/data/m01_landing_data.csv');

  it.each(testCases)('$tcId: $description', async (row) => {
    const driver = browser.get();
    const homePage = await new HomePage(driver).openPage();

    switch (row.tcId) {
      case 'TC-M01-01': {
        // BR-M1-01: Mở trang chủ hiển thị đúng Brand Logo và Tiêu đề website
        const title = await homePage.getPageTitle();
        expect(title, 'Tiêu đề trang web phải chứa tên EduMi').toContain('EduMi');

        const isLogoVisible = await homePage.isBrandLogoDisplayed();
        expect(isLogoVisible, 'Logo thương hiệu phải hiển thị trên thanh điều hướng').toBe(true);

        const isLogoImgVisible = await homePage.isBrandLogoImgDisplayed();
        expect(isLogoImgVisible, 'Hình ảnh logo thương hiệu phải hiển thị').toBe(true);

        const brandName = await homePage.getBrandNameText();
        expect(brandName.trim(), 'Tên thương hiệu phải là EduMi').toBe(row.expectedBrandName);
        break;
      }

      case 'TC-M01-02': {
        // BR-M1-02: Thanh điều hướng Navbar hiển thị đầy đủ các liên kết chính
        const isNavbarVisible = await homePage.isNavbarDisplayed();
        expect(isNavbarVisible, 'Thanh điều hướng Navbar phải hiển thị trên trang chủ').toBe(true);

        const isClassesVisible = await homePage.isClassesLinkDisplayed();
        expect(isClassesVisible, 'Liên kết Lớp Học (/classes) phải hiển thị trên Navbar').toBe(true);

        const isMaterialsVisible = await homePage.isMaterialsLinkDisplayed();
        expect(isMaterialsVisible, 'Liên kết Tài liệu (/materials) phải hiển thị trên Navbar').toBe(true);

        const isExamVisible = await homePage.isExamLinkDisplayed();
        expect(isExamVisible, 'Liên kết Phòng thi (/exam) phải hiển thị trên Navbar').toBe(true);

        const isAssistantVisible = await homePage.isAssistantLinkDisplayed();
        expect(isAssistantVisible, 'Liên kết Trợ lí ảo (/assistant) phải hiển thị trên Navbar').toBe(true);
        break;
      }

      case 'TC-M01-03': {
        // BR-M1-03: Hiển thị Banner Hero chính và nút kêu gọi hành động Khám phá EduMi
        const isHeroVisible = await homePage.isHeroSectionDisplayed();
        expect(isHeroVisible, 'Khu vực Hero Banner phải hiển thị nổi bật trên đầu trang').toBe(true);

        const isHeroHeadingVisible = await homePage.isHeroHeadingDisplayed();
        expect(isHeroHeadingVisible, 'Tiêu đề chính của Hero Banner phải hiển thị').toBe(true);

        const isCtaVisible = await homePage.isCtaButtonDisplayed();
        expect(isCtaVisible, 'Nút kêu gọi hành động Khám phá EduMi phải hiển thị').toBe(true);
        break;
      }

      case 'TC-M01-04': {
        // BR-M1-04: Điều hướng đến trang Lớp học /classes từ Navbar thành công
        // 1. Thao tác click vào liên kết Lớp học
        await homePage.clickClassesLink();

        // 2. Chờ điều hướng hoàn tất và kiểm tra URL đích
        await driver.wait(async () => (await homePage.getCurrentUrl()).includes('/classes'), 10000);
        const currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl, 'URL sau khi click phải chuyển hướng đến /classes').toContain('/classes');
        break;
      }

      case 'TC-M01-05': {
        // BR-M1-05: Điều hướng đến trang Tài liệu /materials từ Navbar thành công
        await homePage.clickMaterialsLink();
        await driver.wait(async () => (await homePage.getCurrentUrl()).includes('/materials'), 10000);
        const currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl).toContain('/materials');
        break;
      }

      case 'TC-M01-06': {
        // BR-M1-06: Điều hướng đến trang Phòng thi /exam từ Navbar thành công
        await homePage.clickExamLink();
        await driver.wait(async () => (await homePage.getCurrentUrl()).includes('/exam'), 10000);
        const currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl).toContain('/exam');
        break;
      }

      case 'TC-M01-07': {
        // BR-M1-07: Kiểm tra hình ảnh logo và thuộc tính hiển thị hợp lệ
        const isLogoImgVisible = await homePage.isBrandLogoImgDisplayed();
        expect(isLogoImgVisible, 'Hình ảnh logo thương hiệu phải hiển thị rõ nét').toBe(true);
        break;
      }

      case 'TC-M01-08': {
        // BR-M1-08: Cuộn trang xuống cuối và kiểm tra hiển thị Footer
        await homePage.scrollToFooter();
        const isFooterVisible = await homePage.isFooterDisplayed();
        expect(isFooterVisible, 'Chân trang Footer phải hiển thị khi cuộn xuống cuối').toBe(true);
        break;
      }

      case 'TC-M01-09': {
        // BR-M1-09: Kiểm tra nút Đăng nhập hoặc Hồ sơ trên Navbar
        const isAuthLinkVisible = await homePage.isLoginOrProfileLinkDisplayed();
        expect(isAuthLinkVisible, 'Nút Đăng nhập hoặc Hồ sơ người dùng phải hiển thị trên Navbar').toBe(true);
        break;
      }

      case 'TC-M01-10': {
        // BR-M1-10: Click Brand Logo tại trang khác điều hướng trở về trang chủ /
        await homePage.clickClassesLink();
        await driver.wait(async () => (await homePage.getCurrentUrl()).includes('/classes'), 10000);
        await homePage.clickBrandLogo();
        await driver.wait(async () => !(await homePage.getCurrentUrl()).includes('/classes'), 10000);
        const currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl.endsWith('/') || !currentUrl.includes('/classes')).toBe(true);
        break;
      }

      default: {
        const isVisible = await homePage.isBrandLogoDisplayed();
        expect(isVisible).toBe(true);
        break;
      }
    }
  });
});
