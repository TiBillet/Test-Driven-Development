import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import { lespassClientConnection } from '../../mesModules/communLespass.js'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
let page
const email2 = process.env.TEST_EMAIL2

test.use({
  viewport: { width: 2000, height: 1200 },
  ignoreHTTPSErrors: true
})

test.describe("Vérification prise d'adhésions", () => {
  test("Status 'Adhésion (Le Tiers-Lustre)' - annuelle", async ({ browser }) => {
    page = await browser.newPage()

    // connexion lespass
    await lespassClientConnection(page, email2)

    // url à attendre - "MON COMPTE" 
    const response = page.waitForRequest('**/my_account/')
    // cliquer menu "MON COMPTE"
    await page.locator('#mainMenu .nav-item a[href="/my_account/"]').click()
    // attend la fin du chargement de l'url
    await response

    // url à attendre - "Mes adhésions"
    const responseMembership = page.waitForRequest('**/my_account/membership/')
    // cliquer sur "Mes adhésions"
    await page.locator('main .nav-item a[href="/my_account/membership/"]').click()
    // attend la fin du chargement de l'url
    await responseMembership

    const parent = page.locator('.col', {hasText: "Adhésion (Le Tiers-Lustre) annuelle"})

    // titre "Adhésion (Le Tiers-Lustre) annuelle" visibe
    await expect(parent.locator('.card-title', {hasText: "Adhésion (Le Tiers-Lustre) annuelle"})).toBeVisible()
    
    // proprio de l'adhésion visible "pour albert Dupont"
    await expect(parent.locator('.card-body h4', { hasText: "pour albert Dupont" })).toBeVisible()

    // option "Membre actif.ve" visible
    await expect(parent.locator('span', {hasText: "Membre actif.ve"})).toBeVisible()
  })

  test("Status 'Panier AMAP (Le Tiers-Lustre)' - mensuelle", async ({ browser }) => {
    const parent = page.locator('.col', {hasText: "Panier AMAP (Le Tiers-Lustre) mensuelle"})

    // titre "Adhésion (Le Tiers-Lustre) annuelle" visibe
    await expect(parent.locator('.card-title', {hasText: "Panier AMAP (Le Tiers-Lustre) mensuelle"})).toBeVisible()

    // proprio de l'adhésion visible "pour albert Dupont"
    await expect(parent.locator('.card-body h4', { hasText: "pour albert Dupont" })).toBeVisible()

    await page.close()
  })
})
