// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// LaBoutik: DEBUG=1 / DEMO=1; language = en

import { test, expect } from '@playwright/test'
import { detectLanguage, lespassTranslate } from '../../mesModules/communLespass.js'
import { connection, changeLanguage, getTranslate, getStyleValue, goPointSale, selectArticles, getEntity, resetCardCashless, clients } from '../../mesModules/commun.js'

let laboutikClient = clients.client3
let laboutikPage, currencySymbolTrans, totalTrans, cbTrans, msgAwaitingCard
let anonymousCardTrans, directServiceTrans, paiementTypeTrans, confirmPaymentTrans, lespassLanguage, urlConfirmation
const email = process.env.TEST_EMAIL

// attention la taille d'écran choisie affiche le menu burger
test.use({ viewport: { width: 1200, height: 1200 }, ignoreHTTPSErrors: true })

test.describe(`Adhesion: lier une carte au compte utilisateur ${laboutikClient.id}`, () => {
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
  test("Carte client ?, prise de 2 adhésions en cb.", async () => {
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

  test("Admin: lier un email à la carte client", async ({ browser }) => {
    // connexion admin
    const page = await browser.newPage()
    await page.goto(process.env.LABOUTIK_URL)

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur menu "Cartes cashless" 
    await page.locator('a[href="/adminstaff/APIcashless/cartecashless/"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliquer sur "url qrcode"
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
    // const popupTrans = lespassTranslate('validateEmailForAccessprofile', lespassLanguage)
    // await expect(page.locator('#toastContainer div[class="toast show"] div[class="toast-body"]', { hasText: popupTrans })).toBeVisible()

    // go url de confirmation
    urlConfirmation = await page.locator('#toastContainer a', { hasText: 'TEST MODE' }).getAttribute('href')
    // console.log('urlConfirmation =', urlConfirmation)

    await page.close()
  })

  test("Le client détient les adhésions", async ({ browser }) => {
    const page = await browser.newPage()
    // dev
    // urlConfirmation = 'https://lespass.tibillet.localhost/emailconfirmation/OWFjZjA2ODMtMjliMS00ZDY4LTliNTktYjBlNjMzYTdjYjg5OjF0eks5aToyeG5aMmpPYnBDeFZzVGJQa0F0Z1REa2pVV2NtWW5nOTBDR3YybE1HbTNB'

    // go lespass avec url de confirmation
    await page.goto(urlConfirmation)

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
    // contient une ligne avec l'adhésion "Adhésion (Le Tiers-Lustre) Le Tiers-Lustre" / fusion = nth(0)
    await expect(page.locator('div[class="table-responsive"] tr', { hasText: 'Adhésion (Le Tiers-Lustre) Le Tiers-Lustre'}).nth(1)).toBeVisible()

    // TODO: modification à venir
    // contient une ligne avec l'adhésion "Panier AMAP (Le Tiers-Lustre) Le Tiers-Lustre" / fusion = nth(0)
    await expect(page.locator('div[class="table-responsive"] tr', { hasText: 'Panier AMAP (Le Tiers-Lustre) Le Tiers-Lustre'}).nth(1)).toBeVisible()
    await page.close()
  })
})
