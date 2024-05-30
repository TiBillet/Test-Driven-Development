// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect, chromium } from '@playwright/test'
import { env } from '../../mesModules/env.js'
import {
  connection, changeLanguage, goPointSale, getTranslate, resetCardCashless, creditCardCashless,
  getStyleValue
} from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page
const language = "en"

test.use({ viewport: { width: 375, height: 800 }, ignoreHTTPSErrors: true })

test.describe("Prise de deux adhésions", () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    await page.pause()    
    await page.close()
  })
})