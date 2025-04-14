import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import { lespassClientConnection } from '../../mesModules/communLespass.js'
import { execPath } from 'process'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
let page, urlConfirmation = 'inconnue', language
const email = process.env.TEST_EMAIL, currencySymbol = '€'
const adhesions = [
  {
    name: 'Adhésion (Le Tiers-Lustre)',
    prix: ['Annuelle - 20,00', 'Mensuelle - 2,00', 'Prix libre'],
    infos: 'Vous pouvez prendre une adhésion en une seule fois, ou payer tous les mois.'
  },
  {
    name: 'Panier AMAP (Le Tiers-Lustre)',
    prix: ['Annuelle - 400,00', 'Mensuelle - 40,00'],
    infos: "Association pour le maintien d'une agriculture paysanne. Recevez un panier chaque semaine."
  }
]
test.use({
  viewport: { width: 2000, height: 1200 },
  ignoreHTTPSErrors: true
})


test.describe("Adhésions", () => {
  test("Status - page", async ({ browser }) => {
    page = await browser.newPage()

    // connexion lespass
    await lespassClientConnection(page)

    // url à attendre
    const response = page.waitForRequest('**/memberships/')

    // clique bouton adhésions
    // TODO: à traduire une fois le bouton langue installé
    await page.locator('main a[href="/memberships/"]').click()

    // attend la fin du chargement de l'url
    await response

    // titre "Adhésions" visible
    await expect(page.locator('main h1', { hasText: 'Adhésions' })).toBeVisible()

    for (const item of adhesions) {
      // nom de l'adhésion visible
      await expect(page.locator('.card-body h3', { hasText: item.name })).toBeVisible()
      // infos adhésion visible
      await expect(page.locator('.card-body p', { hasText: item.infos })).toBeVisible()
      // bouton adhérer visible
      const bt = page.locator('div[class="card h-100"]', { hasText: item.name }).locator('.card-footer button', { hasText: 'Adhérer' })
      await expect(bt).toBeVisible()
    }
  })

  test.skip("status formulaire 'Adhésion (Le Tiers-Lustre)'", async ({ browser }) => {
    // sélectionner adhésion 'Adhésion (Le Tiers-Lustre)'
    await page.locator('main .card', { hasText: 'Adhésion (Le Tiers-Lustre)' }).locator('.card-footer button', { hasText: 'Adhérer' }).click()

    // formulaire adhésion ouvert; text 'Adhérer' visible
    await expect(page.locator('#subscribePanel h5', { hasText: 'Adhérer' })).toBeVisible()

    // les prix 'Adhésion (Le Tiers-Lustre)' sont affichés
    for (const item of adhesions[0].prix) {
      const parent = page.locator('.has-validation div', { hasText: item })
      // input radio visible
      await expect(parent.locator('input')).toBeVisible()
      // label visible
      await expect(parent.locator('label'), { hasText: item }).toBeVisible()
    }

    await page.pause()
    const labelInput = [
      {name: "email", label: "Adresse mail"},
      {name: "confirm-email", label: "Confirmation du mail"},
      {name: "firstname", label: "Prénom"},
      {name: "lastname", label: "Nom de la famille ou organisation"}
    ]
    for (const item of labelInput) {
      console.log('name =', item.name);
      
      // input visible
      // await expect(page.locator(`#membership-form .form-floating input[name="${item.name}"]`)).toBeVisible()
      await page.locator(`#membership-form .form-floating input[name="${item.name}"]`).click()
      // label visible
      //await expect(parent.locator('label'), { hasText: item.label }).toBeVisible()
    }

    // sélectionner adhésion 'Panier AMAP (Le Tiers-Lustre))'
    // await page.locator('main .card', { hasText: 'Panier AMAP (Le Tiers-Lustre)' }).locator('.card-footer button', { hasText: 'Adhérer' }).click()


    await page.pause()
  })
})