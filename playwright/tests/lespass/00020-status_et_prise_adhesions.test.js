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


test.describe("Statut et prise d'adhésions", () => {
  test("Status - page", async ({ browser }) => {
    page = await browser.newPage()

    // connexion lespass
    await lespassClientConnection(page, email2)

    // url à attendre
    const response = page.waitForRequest('**/memberships/')

    // cliquer bouton adhésions
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

  // template: BaseBillet/reunion/views/membership/form.html - BaseBillet/views.py (def retrive/1184)
  test("status formulaire 'Adhésion (Le Tiers-Lustre)'", async ({ browser }) => {
    // url du formulaire à attendre
    const responseForm = page.waitForRequest('**/memberships/**')

    // sélectionner adhésion 'Adhésion (Le Tiers-Lustre)'
    await page.locator('main .card', { hasText: 'Adhésion (Le Tiers-Lustre)' }).locator('.card-footer button', { hasText: 'Adhérer' }).click()

    // attend la fin du chargement de l'url
    await responseForm

    // formulaire adhésion ouvert; text 'Adhérer' visible
    await expect(page.locator('#subscribePanel h5', { hasText: 'Adhérer' })).toBeVisible()

    // titre 'Adhésion (Le Tiers-Lustre)' visible
    await expect(page.locator('#membership-form h3', { hasText: 'Adhésion (Le Tiers-Lustre)' })).toBeVisible()

    // les prix 'Adhésion (Le Tiers-Lustre)' sont affichés
    for (const item of adhesions[0].prix) {
      let labelText = item
      if (item !== 'Prix libre') {
        labelText = item + currencySymbol
      }
      const parent = page.locator('.has-validation div', { hasText: labelText })
      // input radio visible
      await expect(parent.locator('input')).toBeVisible()
      // label visible
      await expect(parent.locator('label'), { hasText: labelText }).toBeVisible()
    }

    // test la présence des champs input "email", "firstname" et "lastname"
    const labelInput = [
      { name: "email", label: "Adresse mail" },
      { name: "firstname", label: "Prénom" },
      { name: "lastname", label: "Nom de famille ou organisation" }
    ]
    for (const item of labelInput) {
      // le parent test aussi la présence du label
      const parent = page.locator('#membership-form .form-floating', { hasText: item.label })
      // input visible
      await expect(parent.locator(`input[name="${item.name}"]`)).toBeVisible()
    }

    // membre actif
    await expect(page.locator('#membership-form .form-check', { hasText: "Membre actif.ve" })).toBeVisible()

    // sortir du formulaire
    await page.locator('#membership-form .test-membership-bt-cancel').click()
  })

  test("status formulaire 'Panier AMAP (Le Tiers-Lustre)'", async ({ browser }) => {
    // url du formulaire à attendre
    const responseForm = page.waitForRequest('**/memberships/**')

    // sélectionner adhésion 'Panier AMAP (Le Tiers-Lustre))'
    await page.locator('main .card', { hasText: 'Panier AMAP (Le Tiers-Lustre)' }).locator('.card-footer button', { hasText: 'Adhérer' }).click()

    // attend la fin du chargement de l'url
    await responseForm

    // formulaire adhésion ouvert; text 'Adhérer' visible
    await expect(page.locator('#subscribePanel h5', { hasText: 'Adhérer' })).toBeVisible()

    // titre 'Panier AMAP (Le Tiers-Lustre)' visible
    await expect(page.locator('#membership-form h3', { hasText: 'Panier AMAP (Le Tiers-Lustre)' })).toBeVisible()

    // les prix 'Adhésion (Le Tiers-Lustre)' sont affichés
    for (const item of adhesions[1].prix) {
      let labelText = item
      if (item !== 'Prix libre') {
        labelText = item + currencySymbol
      }
      const parent = page.locator('.has-validation div', { hasText: labelText })
      // input radio visible
      await expect(parent.locator('input')).toBeVisible()
      // label visible
      await expect(parent.locator('label'), { hasText: labelText }).toBeVisible()
    }

    // test la présence des champs input "email", "firstname" et "lastname"
    const labelInput = [
      { name: "email", label: "Adresse mail" },
      { name: "firstname", label: "Prénom" },
      { name: "lastname", label: "Nom de famille ou organisation" }
    ]
    for (const item of labelInput) {
      // le parent test aussi la présence du label
      const parent = page.locator('#membership-form .form-floating', { hasText: item.label })
      // input visible
      await expect(parent.locator(`input[name="${item.name}"]`)).toBeVisible()
    }

    // options
    const options = ["Livraison à l'asso", "Livraison à la maison"]
    for (const item of options) {
      const parent = page.locator('#membership-form .form-check', { hasText: item })
      // input visible
      await expect(parent.locator('input')).toBeVisible()
    }
  })

  test("Prendre 'Panier AMAP (Le Tiers-Lustre)' - mensuel 40 Unité - Livraison à l'asso", async ({ browser }) => {
    // slectionner prix "Mensuelle - 40,00€"
    await page.locator('#membership-form .form-check', { hasText: adhesions[1].prix[1] + currencySymbol }).locator('input').click()

    // prénom
    const inputFirstname = page.locator('#membership-form input[name="firstname"]')

    // envoyer/valider la demande d'adhésion
    await page.locator('#membership-submit').click()

    // après la validation le prénom(firsname) n'est pas valide
    const validationFirstname = await inputFirstname.evaluate((element) => {
      return element.checkValidity()
    })
    expect(validationFirstname).toEqual(false)

    // entrer le prénom "albert"
    await page.locator('#membership-form input[name="firstname"]').fill('albert')

    // Nom de famille ou organisation
    const inputLastname = page.locator('#membership-form input[name="lastname"]')

    // envoyer/valider la demande d'adhésion
    await page.locator('#membership-submit').click()

    // après la validation le Nom de famille ou organisation n'est pas valide
    const validationLastname = await inputLastname.evaluate((element) => {
      return element.checkValidity()
    })
    expect(validationLastname).toEqual(false)

    // entrer le nom de famille "Dupont"
    await page.locator('#membership-form input[name="lastname"]').fill("Dupont")

    // Sélectionnner "Livraison à l'asso"
    page.locator('#membership-form .form-check', { hasText: "Livraison à l'asso" }).locator('input').click()

    // url à attendre - paiement stripe
    const response = page.waitForRequest('**/memberships/')

    // envoyer/valider la demande d'adhésion
    await page.locator('#membership-submit').click()

    // attend la fin du chargement de l'url
    await response

    // produit visible "S'abonner à Panier AMAP (Le Tiers-Lustre)"
    await expect(page.locator('div[class="ProductSummary-info"]', { hasText: "S'abonner à Panier AMAP (Le Tiers-Lustre)" })).toBeVisible()

    // prix visible "40,00 Unités" et "mois"
    await expect(page.locator('#ProductSummary-totalAmount', { hasText: `40,00 ${currencySymbol}` })).toBeVisible()
    await expect(page.locator('#ProductSummary-totalAmount', { hasText: 'mois' })).toBeVisible()

    // remplissage 4242 du formulaire stripe
    await page.locator('form fieldset input[placeholder="1234 1234 1234 1234"]').fill('4242 4242 4242 4242')
    await page.locator('form fieldset input[placeholder="MM / AA"]').fill('4 / 27')
    await page.locator('form fieldset input[placeholder="CVC"]').fill('424')
    await page.locator('form #billingName').fill('4242')
    await page.locator('form div[class="SubmitButton-IconContainer"]').click()
  })

  test("Retour formulaire stripe pour 'Panier AMAP (Le Tiers-Lustre)' mensuel de 40 Unité = succès", async ({ browser }) => {
    // Attendre fin de chargement
    await page.waitForNavigation()

    // message de succès pour l'adhésion panier amap 40 unité
    const successMsg = 'Votre adhésion a été validé. Vous allez recevoir un mail de confirmation. Merci !'
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: successMsg })).toBeVisible()

    // fermer le message de succès - cliquer sur bouton
    await page.locator('#toastContainer div[role="status"] div', { hasText: 'Succès' }).locator('button').click()

    // message non visible
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: successMsg })).not.toBeVisible()
  })

  test("Prendre 'Adhésion (Le Tiers-Lustre)' - Annuelle - 20,00Unité", async ({ browser }) => {
    // url du formulaire à attendre
    const responseForm = page.waitForRequest('**/memberships/**')

    // sélectionner adhésion 'Adhésion (Le Tiers-Lustre)'
    await page.locator('main .card', { hasText: 'Adhésion (Le Tiers-Lustre)' }).locator('.card-footer button', { hasText: 'Adhérer' }).click()

    // attend la fin du chargement de l'url
    await responseForm

    // titre 'Adhésion (Le Tiers-Lustre)' visible
    await expect(page.locator('#membership-form h3', { hasText: 'Adhésion (Le Tiers-Lustre)' })).toBeVisible()

    // slectionner prix "Annuelle - 20,00Unité"
    await page.locator('#membership-form .form-check', { hasText: adhesions[0].prix[0] + currencySymbol }).locator('input').click()

    // entrer le prénom "albert"
    await page.locator('#membership-form input[name="firstname"]').fill('albert')

    // entrer le nom de famille "Dupont"
    await page.locator('#membership-form input[name="lastname"]').fill("Dupont")

    // sélectionner "Membre actif.ve"
    await page.locator('#membership-form .form-check', { hasText: "Membre actif.ve" }).locator('input').click()

    // url à attendre - paiement stripe
    const response = page.waitForRequest('**/memberships/')

    // envoyer/valider la demande d'adhésion
    await page.locator('#membership-submit').click()

    // attend la fin du chargement de l'url
    await response

    // produit visible "Adhésion (Le Tiers-Lustre)"
    await expect(page.locator('div[class="ProductSummary-info"]', { hasText: "Adhésion (Le Tiers-Lustre)" })).toBeVisible()

    // prix visible "20,00 Unités"
    await expect(page.locator('#ProductSummary-totalAmount', { hasText: `20,00 ${currencySymbol}` })).toBeVisible()

    // remplissage 4242 du formulaire stripe
    await page.locator('form fieldset input[placeholder="1234 1234 1234 1234"]').fill('4242 4242 4242 4242')
    await page.locator('form fieldset input[placeholder="MM / AA"]').fill('4 / 27')
    await page.locator('form fieldset input[placeholder="CVC"]').fill('424')
    await page.locator('form #billingName').fill('4242')
    await page.locator('form div[class="SubmitButton-IconContainer"]').click()
  })

  test("Retour formulaire stripe pour 'Adhésion (Le Tiers-Lustre)' - Annuelle - 20,00Unité = succès", async ({ browser }) => {
    // Attendre fin de chargement
    await page.waitForNavigation()

    // message de succès pour l'adhésion panier amap 40 unité
    const successMsg = 'Votre adhésion a été validé. Vous allez recevoir un mail de confirmation. Merci !'
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: successMsg })).toBeVisible()

    // fermer le message de succès - cliquer sur bouton
    await page.locator('#toastContainer div[role="status"] div', { hasText: 'Succès' }).locator('button').click()

    // message non visible
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: successMsg })).not.toBeVisible()

    await page.close()
  })
})