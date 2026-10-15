import { Builder, Capabilities, type WebDriver } from 'selenium-webdriver'

export const HLM_PROXY_URL = process.env.HLM_PROXY_URL ?? 'http://localhost:8085'
// Chrome runs inside Docker; host.docker.internal resolves to the WSL host where Vite listens
export const BASE_URL = process.env.BASE_URL ?? 'http://host.docker.internal:5173'
export const HEALING = (process.env.HEALING ?? 'on') !== 'off'

export async function createDriver(): Promise<WebDriver> {
  const caps = Capabilities.chrome().set('goog:chromeOptions', {
    args: ['--window-size=1280,900'],
  })
  const driver = await new Builder().usingServer(HLM_PROXY_URL).withCapabilities(caps).build()
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30000, script: 30000 })
  return driver
}

// Healenium-Proxy intercepts these script "commands" to toggle healing per section.
export async function setHealing(driver: WebDriver, enabled: boolean): Promise<void> {
  try {
    await driver.executeScript(enabled ? 'disable_healing_false' : 'disable_healing_true')
  } catch (err) {
    // without the proxy the browser just sees an invalid script
    if (!(err instanceof Error && err.name === 'JavascriptError')) throw err
  }
}
