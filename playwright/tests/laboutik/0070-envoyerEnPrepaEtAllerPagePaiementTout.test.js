// cashless_demo1.env DEBUG=True / DEMO=True / language = fr
// ne pas lancé 2 fois de suite se test, il faut un reset/init (flush) db avant
// bloquer l'actualisation de la page préparation dans restaurant.js/méthode "visualiserEtatCommandes" / window.testPagePrepa = true

import { test, expect } from '@playwright/test'
import {
  connection, goPointSale, selectArticles, getStyleValue,
  changeLanguage, newOrderIsShow, getTranslate, articlesListNoVisible,
  checkBill, checkAlreadyPaidBill, getStatePrepaByRoom
} from '../../mesModules/commun.js'


// attention la taille d'écran choisie affiche le menu burger
let page
// sélection des articles, total 5.8 €
const listeArticles = [
  { nom: "Eau 1L", nb: 1, prix: 1.5 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
  { nom: "Soft G", nb: 2, prix: 1.5 }, { nom: "Despé", nb: 1, prix: 3.2 },
  { nom: "Café", nb: 3, prix: 1 }
]

const language = "en"

test.use({
  viewport: { width: 375, height: 800 },
  ignoreHTTPSErrors: true
})

test.describe('Envoyer en préparation et aller à la page de paiement, payer "Tout".', () => {
  test("Connexion", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // dev changer de langue
    await changeLanguage(page, language)
  })

  /*
    // dev uniquement
    test('aller table Ex05', async ({ browser }) => {
      // attente affichage menu burger
      await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })
  
      // Clique sur le menu burger
      await page.locator('.menu-burger-icon').click()
  
      // Click text=TABLES
      const tables = await getTranslate(page, 'tables', 'uppercase')
      await page.locator('text=' + tables).click()
  
      // attendre liste table
      const titre = await getTranslate(page, 'displayCommandsTable', 'capitalize')
      await page.locator('.navbar-horizontal .titre-vue', { hasText: titre }).waitFor({ state: 'visible' })
  
      // sélectionne la table
      await page.locator('#tables-liste div[class~="table-bouton"] >> text=Ex05').click()
    })
  
    */
  test("Commande sur table Ex05, pv 'RESTO'", async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table Ex05
    await page.locator('#tables-liste .table-bouton', { hasText: 'Ex05' }).click()

    // nouvelle commande de la salle Ex05 du point de vente RESTO est affichée
    await newOrderIsShow(page, 'Ex05', 'Resto')

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText('TOTAL 0 €')

    // sélection des articles
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET ALLER A LA PAGE PAIEMENT"
    await page.locator('#popup-cashless #test-prepa3').click()
  })

  test('Payer tout(35.7), somme donnée 50', async () => {
    // attendre page de paiement
    const articles = await getTranslate(page, 'articles', 'capitalize')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' Ex05' }).waitFor({ state: 'visible' })

    // clique bouton "Tout" 35.7 €|$
    await page.locator('#commandes-table-menu div[onclick="restau.ajouterTousArticlesAddition()"]').click()

    // liste articles cachée
    const listeNonVisible = await articlesListNoVisible(page)
    expect(listeNonVisible).toEqual(true)

    // vérififier addition
    await checkBill(page, listeArticles)

    // VALIDER
    let indexTrans = await getTranslate(page, 'validate', 'uppercase')
    await page.locator('#table-footer-contenu .BF-ligne', { hasText: indexTrans }).click()

    // attendre moyens de paiement
    indexTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: indexTrans }).waitFor({ state: 'visible' })

    // monnaie
    const monnaie = await getTranslate(page, 'currencySymbol')
    const totalTrans = await getTranslate(page, 'total', 'uppercase')

    // moyen de paiement "CASHLESS" présent
    await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cashless"] >> text=CASHLESS')).toBeVisible()
    // Total pour moyen de paiement "CASHLESS" 35.7 €|$
    await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cashless"]').locator(`.sous-element-texte >> text=${totalTrans}`)).toHaveText(`${totalTrans} 35.7 ${monnaie}`)

    // moyen de paiement "ESPECE" présent
    const cashPaymentTrans = await getTranslate(page, 'cash', 'uppercase')
    await expect(page.locator(`#popup-cashless bouton-basique[class="test-ref-cash"] >> text=${cashPaymentTrans}`)).toBeVisible()
    // Total pour moyen de paiement "ESPECE" 35.7 €|$
    await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cash"]').locator(`.sous-element-texte >> text=${totalTrans}`)).toHaveText(`${totalTrans} 35.7 ${monnaie}`)

    // moyen de paiement "CB" présent
    const creditCardPaymentTrans = await getTranslate(page, 'cb', 'uppercase')
    await expect(page.locator(`#popup-cashless bouton-basique[class="test-ref-cb"] >> text=${creditCardPaymentTrans}`)).toBeVisible()
    // Total pour moyen de paiement "CB" 35.7 €|$
    await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cb"]').locator(`.sous-element-texte >> text=${totalTrans}`)).toHaveText(`${totalTrans} 35.7 ${monnaie}`)

    // bouton RETOUR présent
    indexTrans = await getTranslate(page, 'return', 'uppercase')
    await expect(page.locator(`#popup-cashless bouton-basique >> text=${indexTrans}`)).toBeVisible()

    // clique sur "ESPECE"
    await page.locator(`#popup-cashless bouton-basique[class="test-ref-cash"] >> text=${cashPaymentTrans}`).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Confirmez le paiement est affiché
    indexTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    await expect(page.locator('.test-return-confirm-payment', { hasText: indexTrans })).toBeVisible()

    // espèce est affiché
    indexTrans = await getTranslate(page, 'cash')
    await expect(page.locator('.test-return-payment-method', { hasText: indexTrans })).toBeVisible()

    // message somme donnée affichée
    indexTrans = await getTranslate(page, 'givenSum')
    await expect(page.locator('#given-sum-container div', { hasText: indexTrans })).toBeVisible()

    // input value = 50
    await page.locator('#given-sum').fill('50')

    // valider
    await page.locator('#popup-confirme-valider').click()
  })

  test("Retour pour le paiement en espèces.", async () => {
    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    const transaction = await getTranslate(page, 'transaction', 'capitalize')
    const ok = await getTranslate(page, 'ok')
    await expect(page.locator('.test-return-title-content', { hasText: transaction + ' ' + ok })).toBeVisible()

    // total commande
    const total = await getTranslate(page, 'total', 'capitalize')
    const monnaie = await getTranslate(page, 'cash')
    const typeMonnaie = await getTranslate(page, 'currencySymbol')
    await expect(page.locator('#popup-cashless .test-total-achats', { hasText: total })).toHaveText(`${total} (${monnaie}) 35.70 ${typeMonnaie}`)

    // somme donnée
    const givenSum = await getTranslate(page, 'givenSum', 'capitalize')
    await expect(page.locator('.test-return-given-sum', { hasText: `${givenSum} 50 ${typeMonnaie}` })).toBeVisible()

    // à rendre
    const change = await getTranslate(page, 'change', 'capitalize')
    await expect(page.locator('.test-return-change', { hasText: `${change} 14.3 ${typeMonnaie}` })).toBeVisible()

    // bouton RETOUR présent
    const retour = await getTranslate(page, 'return', 'uppercase')
    await expect(page.locator(`#popup-cashless bouton-basique >> text=${retour}`)).toBeVisible()

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()
  })

  test("Retour table après le paiement de tous les articles.", async () => {
    // attendre page de paiement
    const articles = await getTranslate(page, 'articles', 'capitalize')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' Ex05' }).waitFor({ state: 'visible' })

    // liste articles cachée
    const listeNonVisible = await articlesListNoVisible(page)
    expect(listeNonVisible).toEqual(true)

    // le bouton "Addition" est caché ----------------------a refaire -------------------
    //await expect(page.locator('#commandes-table-menu-commute-addition')).toBeVisible()

    // le bouton Prépa est présent
    const prepa = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    await expect(page.locator('#commandes-table-menu .categories-table-item .categories-table-nom', { hasText: prepa })).toBeVisible()

    // la liste d'article déjà payé contient toute la liste  -- addition-liste-deja-paye
    await checkAlreadyPaidBill(page, listeArticles)

    // addition vide
    await expect(page.locator('#addition-liste')).toBeEmpty()

    // reste à payer 0 €|$
    const typeMonnaie = await getTranslate(page, 'currencySymbol')
    await expect(page.locator('#addition-reste-a-payer')).toHaveText('0' + typeMonnaie)

    // total addition
    let total = 0
    for (let i = 0; i < listeArticles.length; ++i) {
      total = total + (listeArticles[i].nb * listeArticles[i].prix)
    }
    await expect(page.locator('#addition-total-commandes')).toHaveText(total.toString() + typeMonnaie)

    // VALIDER, total = 0
    const totalTrans = await getTranslate(page, 'total', 'uppercase')
    await expect(page.locator('#bt-valider-total-restau')).toHaveText(`${totalTrans} 0 ${typeMonnaie}`)
  })

  test('Bouton "VALIDER", total = 0.', async () => {
    // clique sur bouton "VALIDER"
    const valider = await getTranslate(page, 'validate', 'uppercase')
    await page.locator('#table-footer-contenu .fond-ok', { hasText: valider }).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Aucun article n'a été selectioné !
    const noArticle = await getTranslate(page, 'noArticle', 'capitalize')
    const selected = await getTranslate(page, 'hasBeenSelected')
    await expect(page.locator(`#popup-cashless >> text=${noArticle} ${selected}`)).toBeVisible()

    // bouton RETOUR présent
    const retour = await getTranslate(page, 'return', 'uppercase')
    await expect(page.locator(`#popup-cashless bouton-basique >> text=${retour}`)).toBeVisible()

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    await page.close()
  })
})