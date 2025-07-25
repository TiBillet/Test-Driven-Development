/*
Attention pour tous tets:
DEBUG=1
TEST=1
DEMO=1
*/

// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

import { test, expect } from '@playwright/test'
import {
  connection, changeLanguage, resetCardCashless, creditMoneyOnCardCashless, creditGiftMoneyOnCardCashless,
  getTranslate, getStyleValue, goPointSale, selectArticles, getEntity, fakeUserAgent
} from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page, currencySymbolTrans, transactionTrans, okTrans, totalTrans, cardTrans, returnTrans, cashTrans, cbTrans
let givenSumTrans, changeTrans, msgAwaitingCard, onTrans, anonymousCardTrans, directServiceTrans
let paiementTypeTrans, confirmPaymentTrans
const language = "en"

test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true,
  userAgent: fakeUserAgent
})

test.describe("Cashless, carte client 1", () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // obtenir les traductions qui seront utilisées
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    totalTrans = await getTranslate(page, 'total', 'capitalize')
    cardTrans = await getTranslate(page, 'card')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    cashTrans = await getTranslate(page, 'cash')
    cbTrans = await getTranslate(page, 'cb')
    givenSumTrans = await getTranslate(page, 'givenSum')
    changeTrans = await getTranslate(page, 'change', 'capitalize')
    msgAwaitingCard = await getTranslate(page, 'awaitingCardReading', 'capitalize')
    onTrans = await getTranslate(page, 'on', 'capitalize')
    // noContributionTrans = await getTranslate(page, 'noContribution', 'capitalize')
    anonymousCardTrans = await getTranslate(page, 'anonymousCard', 'capitalize')
    directServiceTrans = await getTranslate(page, 'directService', 'capitalize')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
  })

  test("Check carte client 1, tests : bouton retour + sur carte = 0 + cotisation", async () => {
    // vidage carte client1
    await resetCardCashless(page, 'nfc-client1')

    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // attente affichage "Attente lecture carte"
    await expect(page.locator('#popup-cashless', { hasText: msgAwaitingCard })).toBeVisible()

    // #popup-retour visible
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // Clique sur le bouton "CHECK CARTE"
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(184, 85, 33)'
    let backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(184, 85, 33)')

    // "type carte"
    await expect(page.locator('.test-return-card-type', { hasText: anonymousCardTrans })).toBeVisible()

    // 0 sur carte
    await expect(page.locator('.test-return-total-card', { hasText: '0' })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()
  })

  test("Retour carte client 1 crédité de 40 et 10 cadeaux en cb", async () => {
    // créditer monnaie : 4 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client1', 4, 'cb')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    let backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total cb
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 40.00 ${currencySymbolTrans}` })).toBeVisible()

    // total crédité sur carte
    await expect(page.locator('#popup-cashless .test-return-total-carte', { hasText: `CLIENT 1 - ${cardTrans} 40 ${currencySymbolTrans}` })).toBeVisible()

    // crédit du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-le', { hasText: `- TestCoin : 40 ${currencySymbolTrans}` })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()

    // créditer monnaie cadeau :  2 * 5
    await creditGiftMoneyOnCardCashless(page, 'nfc-client1', 2)

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // crédit du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-le', { hasText: `- TestCoin : 40 ${currencySymbolTrans}` })).toBeVisible()

    // crédit cadeau du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-lg', { hasText: `- TestCoin Cadeau : 10 ${currencySymbolTrans}` })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()
  })

  test("Retour carte client 1 crédité de 10 en espece: somme donnée 10", async () => {
    // créditer monnaie : 1 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client1', 1, 'espece', 10)

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total espèce
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cashTrans}) 10.00 ${currencySymbolTrans}` })).toBeVisible()

    // total crédité sur carte
    await expect(page.locator('#popup-cashless .test-return-total-carte', { hasText: `CLIENT 1 - ${cardTrans} 60 ${currencySymbolTrans}` })).toBeVisible()

    // crédit du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-le', { hasText: `- TestCoin : 50 ${currencySymbolTrans}` })).toBeVisible()

    // crédit cadeau du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-lg', { hasText: `- TestCoin Cadeau : 10 ${currencySymbolTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-return-given-sum', { hasText: `${givenSumTrans} 10 ${currencySymbolTrans}` })).toBeVisible()

    // monnaie à rendre
    await expect(page.locator('.test-return-change', { hasText: `${changeTrans} 0 ${currencySymbolTrans}` })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()
  })

  test("Retour carte client 1 crédité de 10 en espece: somme donnée 50", async () => {
    // créditer monnaie : 1 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client1', 1, 'espece', 50)

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total espèce
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cashTrans}) 10.00 ${currencySymbolTrans}` })).toBeVisible()

    // total crédité sur carte
    await expect(page.locator('#popup-cashless .test-return-total-carte', { hasText: `CLIENT 1 - ${cardTrans} 70 ${currencySymbolTrans}` })).toBeVisible()

    // crédit du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-le', { hasText: `- TestCoin : 60 ${currencySymbolTrans}` })).toBeVisible()

    // crédit cadeau du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-lg', { hasText: `- TestCoin Cadeau : 10 ${currencySymbolTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-return-given-sum', { hasText: `${givenSumTrans} 50 ${currencySymbolTrans}` })).toBeVisible()
    // monnaie à rendre
    await expect(page.locator('.test-return-change', { hasText: `${changeTrans} 40 ${currencySymbolTrans}` })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()

  })

  test("Client 1 - prise de 2 adhésions", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Adhésions')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Adhésions' })).toBeVisible()

    // sélection de 2 adhésions
    const listeArticles = [{ nom: "Adhésion (Le Tiers-Lustre) Annuelle", nb: 1, prix: 20 }, { nom: "Panier AMAP (Le Tiers-Lustre) Annuelle", nb: 1, prix: 400 }]
    await selectArticles(page, listeArticles, "Adhésions")

    // valider achats
    await page.locator('#bt-valider').click()

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // paiement par cb
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]', { hasText: cbTrans }).click()

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

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    let backGroundColorReturn = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColorReturn).toEqual('rgb(51, 148, 72)')

    // total cb
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 420.00 ${currencySymbolTrans}` })).toBeVisible()

    // cliquer sur RETOUR
    await page.locator('#popup-retour').click()
  })

  test("Check carte - vérification assets client 1", async () => {
    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Adhésions')

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Adhésions' })).toBeVisible()

    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // attente affichage "Attente lecture carte"
    await expect(page.locator('#popup-cashless', { hasText: msgAwaitingCard })).toBeVisible()

    // url à attendre
    // const responseCheckCarte = page.waitForRequest('**/check_carte/**')
    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()
    // attend la fin du chargement de l'url
    // await responseCheckCarte

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(184, 85, 33)'
    let backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(184, 85, 33)')

    // "type carte"
    await expect(page.locator('.test-return-card-type', { hasText: anonymousCardTrans })).toBeVisible()

    // 70 sur carte
    await expect(page.locator('.test-return-total-card', { hasText: '70.00' })).toBeVisible()

    // assets = 60 et 10 cadeau
    const assets = [
      { name: 'TestCoin', value: 60.00, place: 'Lespass' },
      { name: 'TestCoin Cadeau', value: 10.00, place: 'Lespass' }
    ]
    for (let index = 0; index < assets.length; index++) {
      await expect(page.locator('.test-return-monnaie-item-name' + (index + 1), { hasText: assets[index].name })).toBeVisible()
      await expect(page.locator('.test-return-monnaie-item-value' + (index + 1), { hasText: assets[index].value })).toBeVisible()
      await expect(page.locator('.test-return-monnaie-item-place' + (index + 1), { hasText: assets[index].place })).toBeVisible()
    }

    // TODO: pour dépanner, changera dans le futur
    // attention pour activation: 'today' devra être une variable traduite 
    const adhesions = [
      { name: "Adhésion (Le Tiers-Lustre)", activation: 'today', place: 'Lespass' },
      { name: "Panier AMAP (Le Tiers-Lustre)", activation: 'today', place: 'Lespass' },
    ]
    for (let index = 0; index < adhesions.length; index++) {
      await expect(page.locator('.test-return-membership-item-name' + (index + 1), { hasText: adhesions[index].name })).toBeVisible()
      await expect(page.locator('.test-return-membership-item-activation' + (index + 1), { hasText: adhesions[index].activation })).toBeVisible()
      await expect(page.locator('.test-return-membership-item-place' + (index + 1), { hasText: adhesions[index].place })).toBeVisible()
    }

    await page.close()
  })

})