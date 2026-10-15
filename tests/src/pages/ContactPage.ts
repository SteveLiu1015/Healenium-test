import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver'
import { BASE_URL } from '../driver.js'

const FIND_TIMEOUT = 5000

// One locator strategy per element so each DOM variant breaks a different one.
export const locators = {
  // breaks on: rename-id
  name: By.id('name'),
  email: By.id('email'),
  topic: By.id('topic'),
  // breaks on: rename-class, change-tag
  submit: By.css('button.btn.primary'),
  // breaks on: change-text, change-tag
  submitByText: By.xpath("//button[normalize-space()='Send message']"),
  // breaks on: nest-deeper, rename-id
  result: By.css('form > footer > p#result'),
  variantBadge: By.css('[data-variant]'),
}

export class ContactPage {
  constructor(private readonly driver: WebDriver) {}

  async open(): Promise<void> {
    await this.driver.get(`${BASE_URL}/`)
    await this.driver.wait(until.elementLocated(locators.variantBadge), FIND_TIMEOUT)
  }

  async currentVariant(): Promise<string> {
    const badge = await this.driver.findElement(locators.variantBadge)
    return (await badge.getAttribute('data-variant')) ?? ''
  }

  private find(locator: By): Promise<WebElement> {
    // No explicit wait: healing is triggered by the NoSuchElement from findElement.
    return this.driver.findElement(locator)
  }

  async fill(name: string, email: string, topic: string): Promise<void> {
    await (await this.find(locators.name)).sendKeys(name)
    await (await this.find(locators.email)).sendKeys(email)
    const select = await this.find(locators.topic)
    await select.findElement(By.css(`option[value='${topic}']`)).click()
  }

  async submit(): Promise<void> {
    await (await this.find(locators.submit)).click()
  }

  async submitViaText(): Promise<void> {
    await (await this.find(locators.submitByText)).click()
  }

  async resultText(): Promise<string> {
    const el = await this.find(locators.result)
    await this.driver.wait(async () => (await el.getAttribute('data-state')) === 'done', FIND_TIMEOUT)
    return el.getText()
  }
}
