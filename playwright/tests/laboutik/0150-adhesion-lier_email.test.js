// https://trycatchdebug.net/news/1209805/playwright-yopmail-email-testing
// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect } from '@playwright/test'
import { env } from '../../mesModules/env.js'
import * as dotenv from 'dotenv'
import { detectLespassLanguage, lespassTranslate } from '../../mesModules/communLespass.js'

let lespassLanguage 
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

const email = process.env.EMAILTESTLOGIN

// attention la taille d'écran choisie affiche le menu burger
test.use({ viewport: { width: 1200, height: 1200 }, ignoreHTTPSErrors: true })

test.describe("Adhesion suite test 0010-carte-nfc.test.js", () => {
  test("Admin: lier un email à la carte client2", async ({ browser }) => {
    // connexion admin
    const page = await browser.newPage()
    const pageUrl = 'https://laboutik.' + process.env.DOMAIN 
    console.log('pageUrl =', pageUrl);
    
    await page.goto(env.domain)

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur menu "Cartes cashless" 
    await page.locator('a[href="/adminstaff/APIcashless/cartecashless/"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur "url qrcode"
    await page.locator('#result_list tr', { hasText: env.tagIdClient2 }).locator('td[class="field-url_qrcode"]').click()

    // attendre menu visible donc la fin du chargement de l'url qrcode
    await page.locator('#mainMenu').waitFor()

    await page.pause()

    // détecte la langue 'fr' or 'en' 
    lespassLanguage = await detectLespassLanguage(page)

    // message "Linking my Pass card"ou "Liaison de ma carte Pass" affiché --
    const titleTrans = lespassTranslate('LinkingPassCard', lespassLanguage)
    await expect(page.locator('h1', { hasText: titleTrans })).toBeVisible()

    await page.pause()

    // entrer l'email
    await page.locator('#linkform input[name="email"]').fill(email)

    // entrer l'email de confirmation
    await page.locator('#linkform input[name="emailConfirmation"]').fill(email)

    // cocher l'accord
    await page.locator('#cgu').click()

    // valider le popup
    await page.locator('#linkform button[hx-post="/qr/link/"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')
    //
    // clique  sur afficher vos dernières transactions
    await page.locator('.test-return-show-transactions').click()
    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    const locatorMembership1 = page.locator('.test-return-panier-amap-linterrupteur-42000-content', { hasText: "Abonnement ou adhésion" })
    await page.pause()
    // test la présence de la valeur de l'adhésion "Panier AMAP L’interrupteur" = "420.00"
    await expect(locatorMembership1.locator('.test-return-token-price', { hasText: '420.00' })).toBeVisible()
    // test la présence du nom de l'adhésion "panier amap tibilletistan"
    await expect(locatorMembership1.locator('.test-return-token-name', { hasText: 'Panier AMAP L’interrupteur' })).toBeVisible()

    const locatorMembership2 = page.locator('.test-return-adhesion-associative-linterrupteur-2000-content', { hasText: "Abonnement ou adhésion" })
    // test la présence de la valeur de Adhésion associative L’interrupteur = "20.00"
    await expect(locatorMembership2.locator('.test-return-token-price', { hasText: '20.00' })).toBeVisible()
    // test la présence du nom de "Adhésion associative TiBilletistan"
    await expect(locatorMembership2.locator('.test-return-token-name', { hasText: 'Adhésion associative L’interrupteur' })).toBeVisible()

    await page.close()
  })
})
