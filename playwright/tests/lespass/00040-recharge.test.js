import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import { lespassClientConnection } from '../../mesModules/communLespass.js'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
let page
const email2 = process.env.TEST_EMAIL2, currencySymbol = '€'
const adhesions = [
  {
    name: 'Adhésion (Le Tiers-Lustre)',
    prix: 'Annuelle - 20,00',
    infos: 'Vous pouvez prendre une adhésion en une seule fois, ou payer tous les mois.'
  },
  {
    name: 'Panier AMAP (Le Tiers-Lustre)',
    prix: 'Mensuelle - 40,00',
    infos: "Association pour le maintien d'une agriculture paysanne. Recevez un panier chaque semaine."
  }
]
test.use({
  viewport: { width: 2000, height: 1200 },
  ignoreHTTPSErrors: true
})


test.describe("Recharge compte TiBillet", () => {
  test("Recharge de 20 Unité", async ({ browser }) => {
    page = await browser.newPage()

    // connexion lespass
    await lespassClientConnection(page, email2)

    // url à attendre - "MON COMPTE" 
    const response = page.waitForRequest('**/my_account/')
    // cliquer menu "MON COMPTE"
    await page.locator('#mainMenu .nav-item a[href="/my_account/"]').click()
    // attend la fin du chargement de l'url
    await response

    // url à attendre - "Recharger en TiBillets" 
    const responseRefillWallet = page.waitForRequest('**/my_account/refill_wallet')
    // cliquer sur "Recharger en TiBillets"
    await page.locator('a[hx-get="/my_account/refill_wallet"]').click()
    // attend la fin du chargement de l'url
    await responseRefillWallet

    await page.waitForLoadState()

    // stripe label "Recharge Primary Asset"  visible
    await expect(page.locator('.ProductSummary-info span', { hasText: "Recharge Primary Asset" })).toBeVisible()

    // enttrer une recharge de 20Unité
    await page.locator('#customUnitAmount').fill('')
    await page.locator('#customUnitAmount').fill('20')

    // remplissage 4242 du formulaire stripe
    await page.locator('form fieldset input[placeholder="1234 1234 1234 1234"]').fill('4242 4242 4242 4242')
    await page.locator('form fieldset input[placeholder="MM / AA"]').fill('4 / 27')
    await page.locator('form fieldset input[placeholder="CVC"]').fill('424')
    await page.locator('form #billingName').fill('4242')

    // la somme à payer est de  20,00 Unité
    expect(page.locator('#root button[data-testid="hosted-payment-submit-button"]', { hasText: 'Payer 20,00 ' + currencySymbol })).toBeVisible()

    // valider le paiement
    await page.locator('#root button[data-testid="hosted-payment-submit-button"]', { hasText: 'Payer 20,00 ' + currencySymbol }).click()

    // Attendre fin de chargement
    await page.waitForLoadState()
  })

  test("Retour formulaire stripe pour Recharge compte TiBillet de 20 Unités = succès", async ({ browser }) => {
    // message de succès "Tirelire rechargée" affiché
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: 'Tirelire rechargée' })).toBeVisible()

    // Attend que la table contenant le mot "Solde" soit affichée/présent dans le dom
    await page.waitForSelector('table', { hasText: "Solde", state: 'attached' })

    // récupère le solde et remplace le symbole décimal "." par ","
    // playwright navigateur(headed) utilise "," / playwright sans navigateur(headless) utilise "."
    const returnBalance = await page.evaluate(() => {
      const text = document.querySelector('div[hx-get="/my_account/tokens_table/"] table tbody tr td').innerText
      return text.replace('.', ',')
    })

    // solde = '20,00 TiBillets'
    expect(returnBalance).toEqual('20,00 TiBillets')

    await page.close()
  })
})
