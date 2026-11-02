import { By, until, type WebElement } from 'selenium-webdriver';
import { BasePage } from '../base/BasePage';

/**
 * Page Object đại diện cho Trang chủ EduMi (/)
 * Tuân thủ quy tắc ISTQB & POM: Chỉ chứa bộ định vị và phương thức thao tác, KHÔNG chứa assertion.
 */
export class HomePage extends BasePage {
  // Locators trên Trang chủ
  private readonly brandLogoLink = By.css("a[href='/']");
  private readonly brandLogoImg = By.css("img[alt='EduMi Logo']");
  private readonly brandTitle = By.xpath("//a[@href='/']//span[contains(text(),'EduMi')]");
  private readonly navbar = By.css("header");
  
  // Locators các liên kết chính trên Navbar
  private readonly classesNavLink = By.css("nav a[href='/classes'], a[href='/classes']");
  private readonly materialsNavLink = By.css("nav a[href='/materials'], a[href='/materials']");
  private readonly examNavLink = By.css("nav a[href='/exam'], a[href='/exam']");
  private readonly assistantNavLink = By.css("nav a[href='/assistant'], a[href='/assistant']");
  private readonly premiumNavLink = By.css("a[href='/premium']");
  private readonly loginOrProfileLink = By.css("a[href='/login'], a[href='/profile']");

  // Hero Section & CTA
  private readonly heroSection = By.css("main section");
  private readonly heroHeading = By.xpath("//h1[contains(.,'Học toàn diện') or contains(.,'Nền tảng')]");
  private readonly ctaButton = By.css("a[href='/about']");

  // Footer
  private readonly footer = By.css("footer");

  async openPage(): Promise<this> {
    await this.open('/');
    await this.waitVisible(this.brandLogoLink);
    return this;
  }

  async getPageTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  async isBrandLogoDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.brandLogoLink);
  }

  async isBrandLogoImgDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.brandLogoImg);
  }

  async getBrandNameText(): Promise<string> {
    return this.getText(this.brandTitle);
  }

  async isNavbarDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.navbar);
  }

  async isClassesLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.classesNavLink);
  }

  async isMaterialsLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.materialsNavLink);
  }

  async isExamLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.examNavLink);
  }

  async isAssistantLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.assistantNavLink);
  }

  async isPremiumLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.premiumNavLink);
  }

  async isLoginOrProfileLinkDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.loginOrProfileLink);
  }

  async isHeroSectionDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.heroSection);
  }

  async isHeroHeadingDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.heroHeading);
  }

  async isCtaButtonDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.ctaButton);
  }

  async clickCtaButton(): Promise<void> {
    await this.click(this.ctaButton);
  }

  async clickClassesLink(): Promise<void> {
    await this.click(this.classesNavLink);
  }

  async clickMaterialsLink(): Promise<void> {
    await this.click(this.materialsNavLink);
  }

  async clickExamLink(): Promise<void> {
    await this.click(this.examNavLink);
  }

  async clickBrandLogo(): Promise<void> {
    await this.click(this.brandLogoLink);
  }

  async isFooterDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.footer);
  }

  async scrollToFooter(): Promise<void> {
    await this.driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
  }
}
