// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect } from '@playwright/test'
import { env } from '../../mesModules/env.js'

// attention la taille d'écran choisie affiche le menu burger
let page, directServiceTrans, transactionTrans, okTrans, totalTrans, currencySymbolTrans, cbTrans
let paiementTypeTrans, confirmPaymentTrans, membershipTrans, cashTrans, returnTrans
const language = "en"

test.use({ viewport: { width: 1200, height: 1200 }, ignoreHTTPSErrors: true })

test.describe("Adhesion suite Panier AMAP Mensuel", () => {
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

    await page.pause()

    // TODO: utiliser la traduction
    // message "Link your card to you" affiché --
    await expect(page.locator('.test-return-titre-popup', { hasText: 'Link your card to you' })).toBeVisible()

    // entrer l'email
    await page.locator('.test-return-email-link-card').fill('io@gg.fr')

    // cocher l'accord
    await page.locator('.test-return-agree-link-card').click()

    // valider le popup
    await page.locator('.test-return-validate-link-card').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // clique  sur 
    await page.locator('.test-return-show-transactions').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    await page.pause()
    await page.close()
  })

})
