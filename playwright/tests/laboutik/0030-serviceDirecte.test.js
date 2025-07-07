// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// cashless_demo1.env DEBUG=True / DEMO=True / language = fr
import { test, expect } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, getTranslate, selectArticles, getStyleValue, checkBillDirectService,
  resetCardCashless, creditMoneyOnCardCashless, getEntity, fakeUserAgent
} from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page, directServiceTrans, cashTrans, paiementTypeTrans, confirmPaymentTrans, transactionTrans, okTrans
let totalTrans, givenSumTrans, changeTrans, currencySymbolTrans, returnTrans, cbTrans, prePurchaseCardTrans
let postPurchaseCardTrans, onTrans, cardTrans, totalUppercaseTrans, insufficientFundsTrans, isMissingTrans
let hasTrans, possiblePurchaseByTrans, additionalTrans, inTrans, nameTrans, cashLowercaseTrans
const language = "en"

test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true,
  userAgent: fakeUserAgent
})


test.describe("Point de vente, service direct 'BAR 1'", () => {

  test("Connexion +  aller au point de vente 'BAR 1'", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // obtenir les traductions pour ce test et tous les autres
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    directServiceTrans = await getTranslate(page, 'directService', 'capitalize')
    cashTrans = await getTranslate(page, 'cash', 'uppercase')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    totalTrans = await getTranslate(page, 'total', 'capitalize')
    givenSumTrans = await getTranslate(page, 'givenSum')
    changeTrans = await getTranslate(page, 'change', 'capitalize')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    cbTrans = await getTranslate(page, 'cb')
    prePurchaseCardTrans = await getTranslate(page, 'prePurchaseCard')
    postPurchaseCardTrans = await getTranslate(page, 'postPurchaseCard')
    onTrans = await getTranslate(page, 'on', 'capitalize')
    cardTrans = await getTranslate(page, 'card')
    totalUppercaseTrans = await getTranslate(page, 'total', 'uppercase')
    insufficientFundsTrans = await getTranslate(page, 'insufficientFunds', 'capitalize')
    isMissingTrans = await getTranslate(page, 'isMissing', 'capitalize')
    hasTrans = await getTranslate(page, 'has')
    possiblePurchaseByTrans = await getTranslate(page, 'possiblePurchaseBy', 'capitalize')
    additionalTrans = await getTranslate(page, 'additional', 'capitalize')
    inTrans = await getTranslate(page, 'in')
    nameTrans = await getTranslate(page, 'name', 'capitalize')
    cashLowercaseTrans = await getTranslate(page, 'cash')
  })

  test("Achat 2 pression 33 + 1 pression 50 + paiement en espèce(30Unités) + confirmation + rendu", async () => {
    // page attendue "Direct service - icon Bar 1"
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')

    // sélection des articles
    const listeArticles = [{ nom: "Pression 33", nb: 2, prix: 2 }, { nom: "Pression 50", nb: 1, prix: 2.5 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // la liste des achats correspond au contenu de listeArticles
    await checkBillDirectService(page, listeArticles)

    // valider achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélectionner espèce
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // espèce est affiché
    await expect(page.locator('.test-return-payment-method', { hasText: cashTrans })).toBeVisible()

    // input value = 30
    await page.locator('#given-sum').fill('30')

    // valider
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(espèce) 6.50 Unités' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cashTrans}) 6.50 ${currencySymbolTrans}` })).toBeVisible()

    // 'somme donnée 30 Unités' est affiché
    await expect(page.locator('.test-return-given-sum', { hasText: `${givenSumTrans} 30 ${currencySymbolTrans}` })).toBeVisible()

    // 'Monnaie à rendre 23.5 Unités' est affiché
    await expect(page.locator('.test-return-change', { hasText: `${changeTrans} 23.5 ${currencySymbolTrans}` })).toBeVisible()

    // bouton retour présent
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // cliquer sur RETOUR
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')
  })

  test("Achat 1 Eau 50cL + 1 café + paiement en cb  + confirmation", async () => {
    // sélection des articles
    const listeArticles = [{ nom: "Eau 50cL", nb: 1, prix: 1 }, { nom: "Café", nb: 1, prix: 1 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // la liste des achats correspond au contenu de listeArticles
    await checkBillDirectService(page, listeArticles)

    // valider achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélectionner cb
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // cb est affiché
    await expect(page.locator('.test-return-payment-method', { hasText: 'cb' })).toBeVisible()

    // valider
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(cb) 2.00 Unités' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 2.00 ${currencySymbolTrans}` })).toBeVisible()

    // bouton retour présent
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // cliquer sur RETOUR
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')
  })

  test("contexte: vider carte client 1 et la crediter de 10Unités", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // créditer monnaie : 1 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client1', 1, 'cb')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(cb) 10.00 Unités' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 10.00 ${currencySymbolTrans}` })).toBeVisible()

    // retour créditation
    await page.locator('#popup-retour').click()
  })

  test("Achat 1 Soft G + paiement en cashless; carte cashless client 1 = 10Unités", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')

    // sélection des articles
    const listeArticles = [{ nom: "Soft G", nb: 1, prix: 1.5 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider les achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélection cashless
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]').click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total (moyen de paiement 1 / moyen de paiement 2) valeur Unités
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(cashless) 1.50 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `CLIENT 1 - ${prePurchaseCardTrans} 10 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - ${postPurchaseCardTrans} 8.5 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })

  test("contexte: vider carte cahsless client 1 = 0Unité et carte cashless client 2 = 40Unités", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // vider carte client 2
    await resetCardCashless(page, 'nfc-client2')

    // client 2, créditer monnaie : 4 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client2', 4, 'cb')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(cb) 40.00 Unités' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 40.00 ${currencySymbolTrans}` })).toBeVisible()

    // retour créditation
    await page.locator('#popup-retour').click()

    // --- carte client 1, cashless = 0 Unité ---
    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sur carte 0 Unité
    await expect(page.locator('.test-return-total-card', { hasText: '0' })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()

    // --- carte client 2, cashless = 40 Unités ---
    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sur carte 40 Unités
    await expect(page.locator('.test-return-total-card', { hasText: '40.00' })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })

  test("Achat 1 Guinness + 1 Soft P + paiement en cashless 0Unité / cashless complémentaire client2 40Unités", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

    // sélection des articles
    const listeArticles = [{ nom: "Guinness", nb: 1, prix: 4.99 }, { nom: "Soft P", nb: 1, prix: 1 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider les achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // "TOTAL 5.99 Unités"
    await expect(page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]', { hasText: `${totalUppercaseTrans} 5.99 ${currencySymbolTrans}` })).toBeVisible()

    // sélection cashless
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]').click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fonds insuffisants; couleur du fond = 'rgb(114, 39, 39)'
    const backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(114, 39, 39)')

    // message fonds insuffisants affiché
    await expect(page.locator('.test-return-title', { hasText: insufficientFundsTrans })).toBeVisible()

    // il manque 5.99 Unités
    await expect(page.locator('.test-return-missing-cash', { hasText: `${isMissingTrans} 5.99 ${currencySymbolTrans}` })).toBeVisible()

    // contenu première carte
    await expect(page.locator('.test-return-fisrt-card-content', { hasText: `CLIENT 1 ${hasTrans} 0` })).toBeVisible()

    // message 'Achat possible par' affiché
    await expect(page.locator('.test-returm-possible-purchase', { hasText: possiblePurchaseByTrans })).toBeVisible()

    // sélection 2ème carte cashless
    await page.locator('#popup-cashless .test-fonds-insuffisants-nfc').click()

    // sélection client 2 affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sélection client 2
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total (moyen de paiement 1 / moyen de paiement 2) valeur "symbole monnaie"
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(cashless/cashless) 5.99 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `CLIENT 1 - ${prePurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // complémentaire
    await expect(page.locator('.test-return-additional', { hasText: `${additionalTrans} 5.99 ${currencySymbolTrans} ${inTrans} cashless` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - ${postPurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // cliquer sur RETOUR
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')
  })

  test("contexte, complémentaire espèce : vider carte cahsless client 1 = 0Unité", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // --- carte client 1, cashless = 0 Unité ---
    // Clique sur le bouton "CHECK CARTE"
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sur carte 0 Unité
    await expect(page.locator('.test-return-total-card', { hasText: '0' })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })

  test("Achat 1 Chimay Bleue + paiement en cashless 0Unité / espèce somme donnée 50Unités", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

    // sélection des articles
    const listeArticles = [{ nom: "Chimay Bleue", nb: 1, prix: 2.8 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider les achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélection cashless
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]').click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message fonds insuffisants affiché
    await expect(page.locator('.test-return-title', { hasText: insufficientFundsTrans })).toBeVisible()

    // sélectionner espèce
    await page.locator('#popup-cashless .test-fonds-insuffisants-espece').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // espèce est affiché
    await expect(page.locator('.test-return-payment-method', { hasText: cashTrans })).toBeVisible()

    // input value = 50
    await page.locator('#given-sum').fill('50')

    // valider
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total en espèce
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(cashless/${cashLowercaseTrans}) 2.80 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `CLIENT 1 - ${prePurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // complémentaire  
    await expect(page.locator('.test-return-additional', { hasText: `${additionalTrans} 2.80 ${currencySymbolTrans} ${inTrans} ${cashLowercaseTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-total-achats', { hasText: `${givenSumTrans} 50 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - ${postPurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // monnaie à rendre
    await expect(page.locator('.test-return-change', { hasText: `${changeTrans} 47.2 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')
  })

  // context complémentaire cb : vider carte cahsless client 1 = 0Unité est déjà fait 2 fois
  test("Achat 1 Chimay Bleue + paiement en cashless/cb", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

    // sélection des articles
    const listeArticles = [{ nom: "Chimay Bleue", nb: 1, prix: 2.8 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider les achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélection cashless
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]').click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message fonds insuffisants affiché
    await expect(page.locator('.test-return-title', { hasText: insufficientFundsTrans })).toBeVisible()

    // sélectionner cb
    await page.locator('#popup-cashless div[class="paiement-bt-container test-fonds-insuffisants-cb"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // moyen de paiement cb
    await expect(page.locator('.test-return-payment-method', { hasText: cbTrans })).toBeVisible()

    // valider/confirmer cb
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total en espèce
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(cashless/${cbTrans}) 2.80 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `CLIENT 1 - ${prePurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // complémentaire  
    await expect(page.locator('.test-return-additional', { hasText: `${additionalTrans} 2.80 ${currencySymbolTrans} ${inTrans} ${cbTrans}` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - ${postPurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')
  })

  test("contexte, complémentaire : vider carte client 1 et la crediter de 10", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // créditer monnaie : 1 * 10 unités
    await creditMoneyOnCardCashless(page, 'nfc-client1', 1, 'cb')

    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(cb) 10.00 "unités"' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 10.00 ${currencySymbolTrans}` })).toBeVisible()

    await page.locator('#popup-retour').click()
  })


  test("Achat 3 Gateau + paiement en cashless 10Unités / espèce somme donnée 20Unités", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')

    // sélection des articles
    const listeArticles = [{ nom: "Gateau", nb: 3, prix: 8 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider les achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélection cashless
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]').click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message fonds insuffisants affiché
    await expect(page.locator('.test-return-title', { hasText: insufficientFundsTrans })).toBeVisible()

    // sélectionner espèce
    await page.locator('#popup-cashless .test-fonds-insuffisants-espece').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // espèce est affiché
    await expect(page.locator('.test-return-payment-method', { hasText: cashTrans })).toBeVisible()

    // input value = 20
    await page.locator('#given-sum').fill('20')

    // valider
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total en espèce
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(cashless/${cashLowercaseTrans}) 24.00 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `CLIENT 1 - ${prePurchaseCardTrans} 10 ${currencySymbolTrans}` })).toBeVisible()

    // complémentaire  
    await expect(page.locator('.test-return-additional', { hasText: `${additionalTrans} 14.00 ${currencySymbolTrans} ${inTrans} ${cashLowercaseTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-total-achats', { hasText: `${givenSumTrans} 20 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - ${postPurchaseCardTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // monnaie à rendre
    await expect(page.locator('.test-return-change', { hasText: `${changeTrans} 6 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')

    // fermer navigateur / fin
    await page.close()
  })
})