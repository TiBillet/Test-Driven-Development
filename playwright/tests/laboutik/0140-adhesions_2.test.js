// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect, chromium } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, getTranslate, getStyleValue, getEntity
} from '../../mesModules/commun.js'

let page, directServiceTrans, transactionTrans, okTrans, totalTrans, currencySymbolTrans, cbTrans
let paiementTypeTrans, confirmPaymentTrans, membershipTrans, cashTrans, returnTrans, cashLowercaseTrans
let givenSumCapitalizeTrans, changeCapitalizeTrans
const language = "en"

// attention la taille d'écran choisie affiche le menu burger
test.use({ viewport: { width: 375, height: 800 }, ignoreHTTPSErrors: true })

test.describe("Prise de deux adhésions", () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // obtenir les traductions pour ce test et tous les autres
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    directServiceTrans = await getTranslate(page, 'directService', 'capitalize')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    totalTrans = await getTranslate(page, 'total', 'capitalize')
    cbTrans = await getTranslate(page, 'cb')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    membershipTrans = await getTranslate(page, 'membership', 'capitalize')
    cashTrans = await getTranslate(page, 'cash', 'uppercase')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    cashLowercaseTrans = await getTranslate(page, 'cash')
    givenSumCapitalizeTrans = await getTranslate(page, 'givenSum', 'capitalize')
    changeCapitalizeTrans = await getTranslate(page, 'change', 'capitalize')
  })


  test("Adhesion Panier AMAP Mensuel 40 Unités, paiement cb, email non lié", async () => {
    // aller au point de vente Adhésions
    await goPointSale(page, 'Adhésions')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Adhésions')

    // sélectionner adhésion "Panier AMAP Mensuel"
    await page.locator(`#products div[data-name-pdv="Adhésions"] bouton-article[nom="Panier AMAP (Le Tiers-Lustre) Mensuelle"]`).click()

    // valider achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // moyen de paiement "CASHLESS" non présent
    await expect(page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')).not.toBeVisible()

    // bouton paiement espèce
    const btPaiementEspece = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]')
    // moyen de paiement "ESPECE" présent
    await expect(btPaiementEspece).toBeVisible()
    // Total pour moyen de paiement "ESPECE" 40 Unités
    await expect(btPaiementEspece.locator('div[class="paiement-bt-total"]', { hasText: `${totalTrans} 40 ${currencySymbolTrans}` })).toBeVisible()

    // bouton paiement CB
    const btPaiementCb = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]')
    // moyen de paiement "CB" présent
    await expect(btPaiementCb).toBeVisible()
    // Total pour moyen de paiement "CB" 40 Unités
    await expect(btPaiementCb.locator('div[class="paiement-bt-total"]', { hasText: `${totalTrans} 40 ${currencySymbolTrans}` })).toBeVisible()

    // sélection cb
    await btPaiementCb.click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // valider
    await page.locator('#popup-confirme-valider').click()

    // sélection client 2
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Adhésion' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: membershipTrans })).toBeVisible()

    // nom du membre = "CLIENT 2" / anonyme
    await expect(page.locator('.test-return-membre-name', { hasText: 'CLIENT 2' })).toBeVisible()

    //  Total(cb) 40.00 "Unités" est affiché
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 40.00 ${currencySymbolTrans}` })).toBeVisible()

    // bouton retour présent
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // cliquer sur RETOUR
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Adhésions')
  })


  test("Adhésion (Le Tiers-Lustre) Annuelle 20 Unités, paiement espèce, email non lié", async () => {
    // aller au point de vente Adhésions
    await goPointSale(page, 'Adhésions')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Adhésions')

    // sélectionner adhésion "Adhésion associative Annuelle" 20
    await page.locator(`#products div[data-name-pdv="Adhésions"] bouton-article[nom="Adhésion (Le Tiers-Lustre) Annuelle"]`).click()

    // valider achats
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélection espèce
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]').click()

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

    // sélection client 2
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Adhésion' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: membershipTrans })).toBeVisible()

    // nom du membre = "CLIENT 2" / anonyme
    await expect(page.locator('.test-return-membre-name', { hasText: 'CLIENT 2' })).toBeVisible()

    //  Total(espèce) 20.00 Unités est affiché
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${totalTrans}(${cashLowercaseTrans}) 20.00 ${currencySymbolTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-return-given-sum', { hasText: `${givenSumCapitalizeTrans} 50 ${currencySymbolTrans}` })).toBeVisible()

    // à rendre
    await expect(page.locator('.test-return-change', { hasText: `${changeCapitalizeTrans} 30 ${currencySymbolTrans}` })).toBeVisible()

    // bouton retour présent
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // cliquer sur RETOUR
    await page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Adhésions')

    await page.close()
  })

})
