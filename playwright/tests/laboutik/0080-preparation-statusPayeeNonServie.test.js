// cashless_demo1.env DEBUG=True / DEMO=True / language = en
import { test, devices, expect } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, checkListArticlesOk,
  articlesListNoVisible, checkBill, newOrderIsShow, selectArticles,
  getTranslate, goTableOrder, getEntity
} from '../../mesModules/commun.js'
import { env } from '../../mesModules/env.js'

let page, articlesTrans, additionCapitalizeTrans, paiementTypeTrans, confirmPaymentTrans, transactionTrans
let okTrans, returnTrans, shortcutPrepaTrans, transP, currencySymbolTrans
const language = "en"
const listeArticles = [{ nom: "Pression 33", nb: 1, prix: 2 }, { nom: "CdBoeuf", nb: 1, prix: 25 },]

test.use({ viewport: { width: 375, height: 800 }, ignoreHTTPSErrors: true })

test.describe('Préparation: payée - non servie', () => {

  test("Connexion", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // dev changer de langue
    await changeLanguage(page, language)

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // obtenir les traductions pour ce test et tous les autres
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    articlesTrans = await getTranslate(page, 'articles', 'capitalize')
    additionCapitalizeTrans = await getTranslate(page, 'addition', 'capitalize')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    shortcutPrepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    transP = await getTranslate(page, 'notServedPaidOrder', 'capitalize')
  })

  test('Commande table éphémère: envoyé en prépa et tout payer', async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // clique table éphémère
    await page.locator('#tables-liste .test-table-ephemere').click()

    // entrer le nom de table "ephe1Payee"
    await page.locator('#entree-nom-table').fill('ephe1Payee')

    // valider la création de la table éphémère
    await page.locator('#test-valider-ephemere').click()

    // nouvelle commande de la salle ephe1Payee du point de vente RESTO est affichée
    await newOrderIsShow(page, 'ephe1Payee', 'Resto')

    // sélection des articles
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET ALLER A LA PAGE PAIEMENT"
    await page.locator('#popup-cashless #test-prepa3').click()

    // attendre page de paiement
    const articles = await getTranslate(page, 'articles', 'capitalize')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ephe1Payee' }).waitFor({ state: 'visible' })

    // liste d'articles affichées est identique à la liste d'articles à acheter
    await checkListArticlesOk(page, listeArticles)

    // clique bouton "Tout"
    await page.locator('#commandes-table-menu div[onclick="restau.ajouterTousArticlesAddition()"]').click()

    // liste articles cachée
    const listeNonVisible = await articlesListNoVisible(page)
    expect(listeNonVisible).toEqual(true)

    // clique bt "Adition"
    await page.locator(`#commandes-table-menu div >> text=${additionCapitalizeTrans}`).click()

    // vérififier addition
    await checkBill(page, listeArticles)

    // valider commande
    await page.locator('#bt-valider-commande').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // attendre moyens de paiement
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // sélectionner paiement cb
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()

    // valider/confirmer cb
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // Clique BOUTON RETOUR
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()
  })

  test('Préparations: satus payée - non servie', async () => {
    // Aller à la table ephe1Payee
    await goTableOrder(page, 'ephe1Payee')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: `${articlesTrans} ephe1Payee` }).waitFor({ state: 'visible' })

    // Clique sur "Prépara." 
    await page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // "locator" de la commande validé contenant 'CdBoeuf'
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: 'CdBoeuf' })
    // non servie - payé pour la commande contenant  'CdBoeuf'
    await expect(locCdBoeuf.locator('.test-ref-status-order', { hasText: transP })).toBeVisible()
    // fond de la commande contenant 'CdBoeuf' non grisé
    await expect(locCdBoeuf).not.toHaveCSS('opacity', '0.5')
    // bouton valider pour la commande contenant  'CdBoeuf' présent
    await expect(locCdBoeuf.locator('.test-action-validate-prepa')).toBeVisible()


    // "locator" de la commande validé contenant 'Pression 33'
    const locPression33 = page.locator('.com-conteneur', { hasText: 'Pression 33' })
    // non servie - payé pour la commande contenant  'Pression 33'
    await expect(locPression33.locator('.test-ref-status-order', { hasText: transP })).toBeVisible()
    // fond de la commande contenant 'Pression 33' non grisé
    await expect(locPression33).not.toHaveCSS('opacity', '0.5')
    // bouton valider pour la commande contenant  'Pression 33' présent
    await expect(locPression33.locator('.test-action-validate-prepa')).toBeVisible()

    await page.close()
  })

})