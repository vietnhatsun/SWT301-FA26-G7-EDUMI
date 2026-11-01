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
  private readonly classesNavLink = By.css("a[href='/classes']");
  private readonly materialsNavLink = By.css("a[href='/materials']");
  private readonly heroSection = By.css("main section");
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

  async isHeroSectionDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.heroSection);
  }

  async isFooterDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.footer);
  }
}
