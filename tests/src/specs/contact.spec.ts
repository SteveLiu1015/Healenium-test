import assert from 'node:assert/strict'
import type { WebDriver } from 'selenium-webdriver'
import { createDriver, setHealing, HEALING, HLM_PROXY_URL, BASE_URL } from '../driver.js'
import { ContactPage } from '../pages/ContactPage.js'

describe('Contact form (via Healenium-Proxy)', function () {
  let driver: WebDriver
  let page: ContactPage

  before(async function () {
    driver = await createDriver()
    page = new ContactPage(driver)
    console.log(`  proxy=${HLM_PROXY_URL} app=${BASE_URL} healing=${HEALING ? 'on' : 'off'}`)
  })

  after(async function () {
    await driver?.quit()
  })

  beforeEach(async function () {
    await page.open()
    await setHealing(driver, HEALING)
    console.log(`  DOM variant under test: ${await page.currentVariant()}`)
  })

  it('submits using the class-based button locator', async function () {
    await page.fill('Ada Lovelace', 'ada@example.com', 'sales')
    await page.submit()
    const text = await page.resultText()
    assert.match(text, /Thanks, Ada Lovelace!/)
    assert.match(text, /sales/)
  })

  it('submits using the text-based button locator', async function () {
    await page.fill('Grace Hopper', 'grace@example.com', 'feedback')
    await page.submitViaText()
    const text = await page.resultText()
    assert.match(text, /Thanks, Grace Hopper!/)
    assert.match(text, /feedback/)
  })

  it('can opt out of healing for a section', async function () {
    await setHealing(driver, false)
    const variant = await page.currentVariant()
    if (variant === 'baseline') {
      await page.fill('Linus', 'linus@example.com', 'support')
      await page.submit()
      assert.match(await page.resultText(), /Thanks, Linus!/)
    } else {
      // with healing off, a broken locator must surface the original Selenium failure
      await assert.rejects(
        async () => {
          await page.fill('Linus', 'linus@example.com', 'support')
          await page.submit()
          await page.resultText()
        },
        (err: unknown) => err instanceof Error && err.name === 'NoSuchElementError',
      )
    }
    await setHealing(driver, true)
  })
})
