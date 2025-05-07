// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// LaBoutik: DEBUG=1 / DEMO=1; language = en

import { test, expect } from '@playwright/test'
import { detectLanguage, lespassTranslate, lespassClientConnection } from '../../mesModules/communLespass.js'
import { connection, changeLanguage, getTranslate, getStyleValue, goPointSale, selectArticles, getEntity,
  resetCardCashless, clients, fakeUserAgent
} from '../../mesModules/commun.js'

let laboutikClient = clients.client3
let laboutikPage, currencySymbolTrans, totalTrans, cbTrans, msgAwaitingCard
let anonymousCardTrans, directServiceTrans, paiementTypeTrans, confirmPaymentTrans, lespassLanguage, urlConfirmation
const email = process.env.TEST_EMAIL

// attention la taille d'écran choisie affiche le menu burger
test.use({
  viewport: { width: 1200, height: 1300 },
  ignoreHTTPSErrors: true,
  userAgent: fakeUserAgent
})

test.describe(`Prise de 2 adhesions plus lier une carte à un compte utilisateur ${laboutikClient.id}`, () => {
  // connexion à laboutik
  test("Connection", async ({ browser }) => {
    laboutikPage = await browser.newPage()
    await connection(laboutikPage)

    // changer de langue
    const language = "en"
    await changeLanguage(laboutikPage, language)

    // attente affichage menu burger
    await laboutikPage.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // obtenir les traductions qui seront utilisées
    const currencySymbolTransTempo = await getTranslate(laboutikPage, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(laboutikPage, currencySymbolTransTempo)
    directServiceTrans = await getTranslate(laboutikPage, 'directService', 'capitalize')
    paiementTypeTrans = await getTranslate(laboutikPage, 'paymentTypes', 'capitalize')
    cbTrans = await getTranslate(laboutikPage, 'cb')
    confirmPaymentTrans = await getTranslate(laboutikPage, 'confirmPayment', 'capitalize')
    totalTrans = await getTranslate(laboutikPage, 'total', 'capitalize')
    msgAwaitingCard = await getTranslate(laboutikPage, 'awaitingCardReading', 'capitalize')
    anonymousCardTrans = await getTranslate(laboutikPage, 'anonymousCard', 'capitalize')
  })

  // Prise de 2 adhésions; "Panier AMAP (Le Tiers-Lustre) Mensuelle" et "Adhésion (Le Tiers-Lustre) Mensuelle".
  test("Prise de 2 adhésions en cb, client 3.", async () => {
    // vidage carte client laboutikClient
    await resetCardCashless(laboutikPage, laboutikClient.id)

    // aller au point de vente "BAR 1"
    await goPointSale(laboutikPage, 'Adhésions')

    // attendre fin utilisation réseau
    await laboutikPage.waitForLoadState('networkidle')

    // titre
    await expect(laboutikPage.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
    await expect(laboutikPage.locator('.navbar-horizontal .titre-vue', { hasText: 'Adhésions' })).toBeVisible()

    // sélection de 2 adhésions
    const listeArticles = [{ nom: "Panier AMAP (Le Tiers-Lustre) Mensuelle", nb: 1, prix: 40 }, { nom: "Adhésion (Le Tiers-Lustre) Mensuelle", nb: 1, prix: 2 }]
    await selectArticles(laboutikPage, listeArticles, "Adhésions")

    // valider achats
    await laboutikPage.locator('#bt-valider').click()

    // attendre moyens de paiement
    await expect(laboutikPage.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // paiement par cb
    await laboutikPage.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]', { hasText: cbTrans }).click()

    // attente affichage "popup-cashless"
    await laboutikPage.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(laboutikPage.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // cb est affiché
    await expect(laboutikPage.locator('.test-return-payment-method', { hasText: 'cb' })).toBeVisible()

    // valider
    await laboutikPage.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await laboutikPage.locator('#popup-cashless').waitFor({ state: 'visible' })

    // cliquer sur carte nfc simulée
    await laboutikPage.locator('#' + laboutikClient.id).click()

    // attente affichage "popup-cashless"
    await laboutikPage.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    let backGroundColorReturn = await getStyleValue(laboutikPage, '#popup-cashless', 'backgroundColor')
    expect(backGroundColorReturn).toEqual('rgb(51, 148, 72)')

    // total cb
    await expect(laboutikPage.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 42.00 ${currencySymbolTrans}` })).toBeVisible()

    await laboutikPage.close()
  })

  test(`Admin: lier l'email "${email}" à la carte client et vérifier les adhésions de celui-ci.`, async ({ browser }) => {
    // connexion admin
    const page = await browser.newPage()
    await page.goto(process.env.LABOUTIK_URL)

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur menu "Cartes cashless" 
    await page.locator('a[href="/adminstaff/APIcashless/cartecashless/"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')
    
    // **** cliquer sur "url qrcode" ****
    await page.locator('#result_list tr', { hasText: laboutikClient.tagId }).locator('td[class="field-url_qrcode"]').click()

    // attendre menu visible donc la fin du chargement de l'url qrcode
    await page.locator('#mainMenu').waitFor()

    // détecte la langue 'fr' or 'en' 
    lespassLanguage = await detectLanguage(page)

    // message "Linking my Pass card"ou "Liaison de ma carte Pass" affiché --
    const titleTrans = lespassTranslate('LinkingPassCard', lespassLanguage)
    await expect(page.locator('h1', { hasText: titleTrans })).toBeVisible()

    // entrer l'email
    await page.locator('#linkform input[name="email"]').fill(email)

    // entrer l'email de confirmation
    await page.locator('#linkform input[name="emailConfirmation"]').fill(email)

    // cocher l'accord
    await page.locator('#cgu').click()

    // url à attendre
    const response = page.waitForRequest('**/qr/link/')

    // valider le popup
    await page.locator('#linkform button[hx-post="/qr/link/"]').click()

    // attend la fin du chargement de l'url
    await response

    // popup warning acces email for access profil is vissible
    let popupTrans = lespassTranslate('validateEmailForAccessprofile', lespassLanguage)
    await expect(page.locator('#toastContainer div[class="toast show"] div[class="toast-body"]', { hasText: popupTrans })).toBeVisible()

    // url à attendre
    const responseConfirmation = page.waitForRequest('**/lespass.tibillet.localhost/emailconfirmation/**')

    // cliquer bt "TEST MODE"
    await page.locator('a', { hasText: 'TEST MODE' }).click()

    // attend la fin du chargement de l'url
    await responseConfirmation

    await page.close()
  })


  test(`Vérifier les adhésions après connexion de "${email}" à lespass.`, async ({ browser }) => {
    const page = await browser.newPage()

    // connexion lespass
    await lespassClientConnection(page, email)

    // Attendre que le message de succès  soit affichée/présente dans le dom
    await page.waitForSelector('#tibillet-toast- div', { hasText: "Succès", state: 'attached' })

    lespassLanguage = await detectLanguage(page)

    // identification  ok
    const popupTrans = lespassTranslate('fullyLoggedIn', lespassLanguage)
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: popupTrans })).toBeVisible()

    // charge le profil
    const profilLoaded = page.waitForRequest('**/my_account/**')

    // clique sur "mon compte"
    await page.locator('#mainMenu a[href="/my_account/"]').click()

    // attendre chargement du profil
    await profilLoaded

    // charge les transactions
    const transactionsLoad = page.waitForRequest('**/my_account/**')

    await page.locator('#transactionHistory a[hx-get="/my_account/transactions_table/"]').click()

    // attendre chargement des transactions
    await transactionsLoad

    // TODO: modification à venir
    // contient une ligne avec l'adhésion "Adhésion (Le Tiers-Lustre) Le Tiers-Lustre"
    await expect(page.locator('div[class="table-responsive"] tr', { hasText: 'Adhésion (Le Tiers-Lustre) Le Tiers-Lustre' })
      .filter({ hasText: 'Abonnement ou adhésion' })).toBeVisible()

    // TODO: modification à venir
    // contient une ligne avec l'adhésion "Panier AMAP (Le Tiers-Lustre) Le Tiers-Lustre"
    await  expect(page.locator('div[class="table-responsive"] tr', { hasText: 'Panier AMAP (Le Tiers-Lustre) Le Tiers-Lustre' })
      .filter({ hasText: 'Abonnement ou adhésion' })).toBeVisible()
    await page.close()
  })
})
