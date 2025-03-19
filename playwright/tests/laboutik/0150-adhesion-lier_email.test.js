// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect } from '@playwright/test'
import { env } from '../../mesModules/env.js'

// attention la taille d'écran choisie affiche le menu burger
let page, directServiceTrans, transactionTrans, okTrans, totalTrans, currencySymbolTrans, cbTrans
let paiementTypeTrans, confirmPaymentTrans, membershipTrans, cashTrans, returnTrans
const language = "en"

test.use({ viewport: { width: 1200, height: 1200 }, ignoreHTTPSErrors: true })

test.describe.skip("Adhesion suite test 0010-carte-nfc.test.js", () => {
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
    await page.locator('tr[class="row1"]', { hasText: env.tagIdClient2 }).locator('td[class="field-url_qrcode"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

//
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
