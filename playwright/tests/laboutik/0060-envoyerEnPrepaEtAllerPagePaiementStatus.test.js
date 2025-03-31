// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// DEBUG=1 / DEMO=1 / language = en
// ne pas lancé 2 fois de suite se test, il faut un reset/init (flush) db avant

import { test, expect } from '@playwright/test'
import {
  connection, goPointSale, selectArticles, checkListArticlesOk,
  changeLanguage, newOrderIsShow, getTranslate, articlesListNoVisible,
  checkBill, articlesListIsVisible, articleIsNotVisible, articleIsVisible, getEntity
} from '../../mesModules/commun.js'


let page, currencySymbolTrans
// sélection des articles, total 5.8 €
const listeArticles = [
  { nom: "Eau 1L", nb: 1, prix: 1.5 }, { nom: "CdBoeuf", nb: 2, prix: 25 },
  { nom: "Chimay Rouge", nb: 2, prix: 2.6 }, { nom: "Soft G", nb: 1, prix: 1.5 }
]
const language = "en"

test.use({
  viewport: { width: 375, height: 800 },
  ignoreHTTPSErrors: true
})

test.describe("Commandes + aller page paiement", () => {
  test("Connexion", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // dev changer de langue
    await changeLanguage(page, language)

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // traduction symbole monnaie
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
  })

  test("Commande sur table Ex04, pv 'RESTO'", async () => {
    const table = 'Ex04'
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table
    await page.locator('#tables-liste .table-bouton', { hasText: table }).click()

    // nouvelle commande de la salle du point de vente RESTO est affichée
    await newOrderIsShow(page, table, 'Resto')

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

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
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ' + table }).waitFor({ state: 'visible' })

    // liste d'articles affichées est identique à la liste d'articles à acheter
    await checkListArticlesOk(page, listeArticles)

    let total = 0
    for (let i = 0; i < listeArticles.length; ++i) {
      total = total + (listeArticles[i].nb * listeArticles[i].prix)
    }
    // const typeMonnaie = await getTranslate(page, 'currencySymbol')
    await expect(page.locator('#addition-reste-a-payer')).toHaveText(total.toString() + currencySymbolTrans)
    await expect(page.locator('#addition-total-commandes')).toHaveText(total.toString() + currencySymbolTrans)

    // déjà payé vide
    await expect(page.locator('#addition-liste-deja-paye')).toBeEmpty()

    // addition vide
    await expect(page.locator('#addition-liste')).toBeEmpty()
  })

  test('Boutons "Tout", "Reset"', async () => {
    // clique bouton "Tout"
    await page.locator('#commandes-table-menu div[onclick="restau.ajouterTousArticlesAddition()"]').click()

    // liste articles cachée
    const listeNonVisible = await articlesListNoVisible(page)
    expect(listeNonVisible).toEqual(true)

    // vérififier addition
    await checkBill(page, listeArticles)

    // clique bouton "RESET"
    await page.locator('#table-footer-contenu .fond-retour').click()

    // addition vide
    await expect(page.locator('#addition-liste')).toBeEmpty()

    // tous les articles sont affichés
    const listVisible = await articlesListIsVisible(page)
    expect(listVisible).toEqual(true)
  })

  test("Suppression d'article dans l'addition", async () => {
    // séléction des 2 "CdBoeuf"
    await page.locator(`#commandes-table-articles bouton-commande-article[data-nom="CdBoeuf"]`).click({ clickCount: 2 })

    // article "CdBoeuf" plus visible dans la liste d'articles
    const articleNonVisible = await articleIsNotVisible(page, 'CdBoeuf')
    expect(articleNonVisible).toEqual(true)

    // clique sur Adittion
    await page.locator('#commandes-table-menu-commute-addition').click()

    // 2 "CdBoeuf" attendue dans l'addition
    await expect(page.locator('#addition-liste .test-addition-article-ligne .addition-col-qte')).toHaveText('2')

    // clique sur le bouton "moins" dans l'addition (sup un coeur de boeuf)
    await page.locator('#addition-liste .test-addition-article-ligne .addition-col-bt i').click()

    // 1 "CdBoeuf" attendue dans l'addition
    await expect(page.locator('#addition-liste .test-addition-article-ligne .addition-col-qte')).toHaveText('1')

    // clique sur Adittion
    await page.locator('#commandes-table-menu-commute-addition').click()
    
    // article "CdBoeuf" visible dans la liste d'articles
    const articleVisible = await articleIsVisible(page, 'CdBoeuf')
    expect(articleVisible).toEqual(true)

    // nb article pas encore payer = 1
    await expect(page.locator('#commandes-table-articles bouton-commande-article', { hasText: "CdBoeuf" }).locator('.ele-conteneur .ele-nombre')).toHaveText('1')

    // clique sur Adittion
    await page.locator('#commandes-table-menu-commute-addition').click()

    // clique sur le bouton "moins" dans l'addition (sup un coeur de boeuf)
    await page.locator('#addition-liste .test-addition-article-ligne .addition-col-bt i').click()

    // addition vide
    await expect(page.locator('#addition-liste')).toBeEmpty()

    // clique sur Adittion
    await page.locator('#commandes-table-menu-commute-addition').click()

    // nb article pas encore payer = 2
    await expect(page.locator('#commandes-table-articles bouton-commande-article', { hasText: "CdBoeuf" }).locator('.ele-conteneur .ele-nombre')).toHaveText('2')
  })

  test('Bouton "RETOUR".', async () => {
    // clique bouton "RETOUR"
    let indexTrad = await getTranslate(page, 'return', 'uppercase')
    await page.locator('#table-footer-contenu .BF-ligne div div', { hasText: indexTrad }).click()

    // page attendue "Sélectionner une table : Resto"
    indexTrad = await getTranslate(page, 'selectTable', 'capitalize')
    await expect(page.locator('.navbar-horizontal .titre-vue')).toHaveText(indexTrad + ' : Resto')
    await page.close()
  })
})