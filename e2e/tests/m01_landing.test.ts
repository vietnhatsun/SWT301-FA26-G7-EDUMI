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
    const homePage = await new HomePage(browser.get()).openPage();

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
        // 1. Kiểm tra header Navbar hiển thị
        const isNavbarVisible = await homePage.isNavbarDisplayed();
        expect(isNavbarVisible, 'Thanh điều hướng Navbar phải hiển thị trên trang chủ').toBe(true);

        // 2. Kiểm tra liên kết Lớp học (/classes)
        const isClassesVisible = await homePage.isClassesLinkDisplayed();
        expect(isClassesVisible, 'Liên kết Lớp Học (/classes) phải hiển thị trên Navbar').toBe(true);

        // 3. Kiểm tra liên kết Tài liệu (/materials)
        const isMaterialsVisible = await homePage.isMaterialsLinkDisplayed();
        expect(isMaterialsVisible, 'Liên kết Tài liệu (/materials) phải hiển thị trên Navbar').toBe(true);

        // 4. Kiểm tra liên kết Phòng thi (/exam)
        const isExamVisible = await homePage.isExamLinkDisplayed();
        expect(isExamVisible, 'Liên kết Phòng thi (/exam) phải hiển thị trên Navbar').toBe(true);

        // 5. Kiểm tra liên kết Trợ lí ảo (/assistant)
        const isAssistantVisible = await homePage.isAssistantLinkDisplayed();
        expect(isAssistantVisible, 'Liên kết Trợ lí ảo (/assistant) phải hiển thị trên Navbar').toBe(true);
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
