// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect } from '@playwright/test'
import { env } from '../../mesModules/env.js'

// attention la taille d'écran choisie affiche le menu burger
let page, directServiceTrans, transactionTrans, okTrans, totalTrans, currencySymbolTrans, cbTrans
let paiementTypeTrans, confirmPaymentTrans, membershipTrans, cashTrans, returnTrans
const language = "en"

test.use({ viewport: { width: 1200, height: 1200 }, ignoreHTTPSErrors: true })

test.describe("Adhesion suite test 0090-...", () => {
  test("Admin: lier un email à la carte client2", async ({ browser }) => {
    // connexion admin
    const page = await browser.newPage()
    await page.goto(env.domain)

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur menu "Cartes cashless" 
    await page.locator('a[href="/adminstaff/APIcashless/cartecashless/"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur "url qrcode"
    await page.getByRole('link', { name: 'https://demo.tibillet.localhost/qr/58515f52-747b-4934-93f2-597449bcde22/' }).click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // TODO: utiliser la traduction
    // message "Link your card to you" affiché --
    await expect(page.locator('.test-return-titre-popup', { hasText: 'Link your card to you' })).toBeVisible()

    // entrer l'email
    await page.locator('.test-return-email-link-card').fill('filaos974+lespass@hotmail.com')

    // cocher l'accord
    await page.locator('.test-return-agree-link-card').click()

    // valider le popup
    await page.locator('.test-return-validate-link-card').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // clique  sur afficher vos dernières transactions
    await page.locator('.test-return-show-transactions').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    const locatorMembership1 = page.locator('.test-return-panier-amap-demo-4000-content', { hasText: "Abonnement ou adhésion" })
    // test la présence de la valeur de l'adhésion "panier amap tibilletistan" = "40.00"
    await expect(locatorMembership1.locator('.test-return-token-price', { hasText: '40.00' })).toBeVisible()
    // test la présence du nom de l'adhésion "panier amap tibilletistan"
    await expect(locatorMembership1.locator('.test-return-token-name', { hasText: 'Panier AMAP Demo' })).toBeVisible()

    const locatorMembership2 = page.locator('.test-return-adhesion-associative-demo-2000-content', { hasText: "Abonnement ou adhésion" })
    // test la présence de la valeur de Adhésion associative TiBilletistan = "20.00"
    await expect(locatorMembership2.locator('.test-return-token-price', { hasText: '20.00' })).toBeVisible()
    // test la présence du nom de "Adhésion associative TiBilletistan"
    await expect(locatorMembership2.locator('.test-return-token-name', { hasText: 'Adhésion associative Demo' })).toBeVisible()

    await page.close()
  })
})
