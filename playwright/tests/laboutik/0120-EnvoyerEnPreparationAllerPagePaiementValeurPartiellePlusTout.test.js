// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

import { test, expect } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, selectArticles, confirmation, articlesListNoVisible,
  checkAlreadyPaidBill, getTranslate, getEntity
} from '../../mesModules/commun.js'

let page, currencySymbolTrans
const language = "fr"

// attention la taille d'écran choisie affiche le menu burger
test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true
})

test.describe('Envoyer en préparation et aller à la page de paiement, une "Valeur" partielle et sélectionner "Tout".', () => {
  //prise de commande
  test('Envoyer en préparation et payer une partie et le reste .', async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // traduction symbole monnaie
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)

    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // aller au point de vente "RESTO"
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')


    // clique table éphémère
    await page.locator('#tables-liste .test-table-ephemere').click()

    // entrer le nom de table "frac0"
    await page.locator('#entree-nom-table').fill('frac0')

    // valider la création de la table éphémère
    await page.locator('#test-valider-ephemere').click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table frac0, PV Resto')).toBeVisible()

    // sélection des articles = 34.4
    const listeArticles = [{ nom: "Pression 33", nb: 1, prix: 2 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
    { nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 1, prix: 1 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET ALLER A LA PAGE DE PAIEMENT"
    await page.locator('#popup-cashless #test-prepa3').click()
  })

  test('Valeur partielle, titre et bouton "RETOUR".', async () => {
    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // attendre page de paiement
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()

    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // popup avec le titre "Somme"
    await expect(page.locator('#popup-cashless h1')).toHaveText('Somme')

    // boouton "RETOUR" présent
    await expect(page.locator('#popup-cashless #popup-retour')).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle plus grande que l'addition.", async () => {
    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // champ input présent
    await expect(page.locator('#addition-fractionnee')).toBeVisible()

    // bouton "VALIDER" présent
    await expect(page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" })).toBeVisible()

    // entrer la valeur 100000
    await page.locator('#addition-fractionnee').fill('100000')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" }).click()

    // message "Valeur supérieure à l'addition !" visible
    await expect(page.locator('#addition-fractionnee-msg-erreur', { hasText: "Valeur supérieure à l'addition" })).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle = -0.1 .", async () => {
    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // entrer la valeur -0.1
    await page.locator('#addition-fractionnee').fill('-0.1')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" }).click()

    // message "Valeur plus petite ou égale à 0 !" visible
    await expect(page.locator('#addition-fractionnee-msg-erreur', { hasText: "Valeur plus petite ou égale à 0" })).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle = 0.", async () => {
    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // entrer la valeur 0
    await page.locator('#addition-fractionnee').fill('0')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" }).click()

    // message "Valeur plus petite ou égale à 0 !" visible
    await expect(page.locator('#addition-fractionnee-msg-erreur', { hasText: "Valeur plus petite ou égale à 0" })).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle, du texte est entré à la place d'un nombre.", async () => {
    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // entrer la valeur 'hahahaha'
    await page.locator('#addition-fractionnee').fill('hahahaha')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" }).click()

    // message "Vous devez entrer un nombre !" visible
    await expect(page.locator('#addition-fractionnee-msg-erreur', { hasText: "Vous devez entrer un nombre" })).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle = 5, moyens de paiement et bouton retour.", async () => {
    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // entrer la valeur '5'
    await page.locator('#addition-fractionnee').fill('5')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" }).click()

    // titre popup-cashless "Types de paiement" présent
    await expect(page.locator('#popup-cashless', { hasText: 'Types de paiement' })).toBeVisible()

    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')
    // moyen de paiement "CASHLESS" présent
    await expect(btPaiementCashless).toBeVisible()
    // Total pour moyen de paiement "CASHLESS" 5 Unités
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 5 ${currencySymbolTrans}` })).toBeVisible()

    // bouton paiement espèce
    const btPaiementEspece = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]')
    // moyen de paiement "ESPECE" présent
    await expect(btPaiementEspece).toBeVisible()
    // Total pour moyen de paiement "ESPECE" 5 Unités
    await expect(btPaiementEspece.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 5 ${currencySymbolTrans}` })).toBeVisible()

    // bouton paiement CB
    const btPaiementCb = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]')
    // moyen de paiement "CB" présent
    await expect(btPaiementCb).toBeVisible()
    // Total pour moyen de paiement "CB" 5 Unités
    await expect(btPaiementCb.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 5 ${currencySymbolTrans}` })).toBeVisible()

    // bouton RETOUR présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=RETOUR')).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle = 5, payer par espèce.", async () => {
    // clique bouton "Valeur"
    await page.locator('#commandes-table-menu .categories-table-item i[class~="fa-keyboard"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // entrer la valeur '5'
    await page.locator('#addition-fractionnee').fill('5')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: "VALIDER" }).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // cliquer bouton "ESPÈCE"
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]').click()

    // confirmation espèce
    await confirmation(page, 'espece', 5)

    // VALIDER
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await page.evaluate(async () => {
      return document.querySelector('#popup-cashless').style.backgroundColor
    })
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // total commande
    await expect(page.locator('#popup-cashless .popup-msg1', { hasText: 'Total' })).toHaveText(`Total (espèce) 5.00 ${currencySymbolTrans}`)

    // Somme donnée 5 Unités
    await expect(page.locator('.test-return-given-sum', { hasText: `Somme donnée 5 ${currencySymbolTrans}` })).toBeVisible()

    // monnaie à rendre 0
    await expect(page.locator('.test-return-change', { hasText: `Monnaie à rendre 0 ${currencySymbolTrans}` })).toBeVisible()

    // bouton "RETOUR" présent
    await expect(page.locator('#popup-cashless #popup-retour')).toBeVisible()

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle, retour après paiement en espèce d'une valeur partielle = 5", async () => {
    // une ligne seulement -- addition-liste-deja-paye .BF-ligne-deb
    await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb')).toHaveCount(1)

    // vérification de la "valeur partielle" déjà payée
    await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: 'Paiement Fractionné' }).locator('.addition-col-qte')).toHaveText('1')
    await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: 'Paiement Fractionné' }).locator('.addition-col-produit div')).toHaveText('Paiement Fractionné')
    await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: 'Paiement Fractionné' }).locator('.addition-col-prix div')).toHaveText('5' + currencySymbolTrans)

    // total de "reste à payer" et "commandes" ok
    await expect(page.locator('#addition-reste-a-payer')).toHaveText('29.4' + currencySymbolTrans)
    await expect(page.locator('#addition-total-commandes')).toHaveText('34.4' + currencySymbolTrans)

    // VALIDER, total = 0
    await expect(page.locator('#bt-valider-total-restau')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)
  })

  test(`Valeur partielle, payer le reste de l'addition, bouton "Tout".`, async () => {
    // clique bouton "Tous"
    await page.locator('#commandes-table-menu div[onclick="restau.ajouterTousArticlesAddition()"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // titre popup-cashless "Types de paiement" présent
    await expect(page.locator('#popup-cashless', { hasText: 'Types de paiement' })).toBeVisible()

    // --- vérification de la valeur du reste 29.4 Unités sur les boutons de paiement ---
    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 29.4 ${currencySymbolTrans}` })).toBeVisible()

    // bouton paiement espèce
    const btPaiementEspece = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]')
    await expect(btPaiementEspece.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 29.4 ${currencySymbolTrans}` })).toBeVisible()

    // bouton paiement CB
    const btPaiementCb = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]')
    await expect(btPaiementCb.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 29.4 ${currencySymbolTrans}` })).toBeVisible()

    // cliquer bouton "CB"
    await btPaiementCb.click()

    // confirmation cb
    await confirmation(page, 'cb')

    // VALIDER
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await page.evaluate(async () => {
      return document.querySelector('#popup-cashless').style.backgroundColor
    })
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()
    // total commande
    await expect(page.locator('#popup-cashless .popup-msg1', { hasText: 'Total' })).toHaveText(`Total (cb) 29.40 ${currencySymbolTrans}`)

    // bouton "RETOUR" présent
    await expect(page.locator('#popup-cashless #popup-retour')).toBeVisible()

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // on revient sur la table
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Articles frac0' })).toBeVisible()
  })

  test("Valeur partielle, retour après paiement du reste de l'addition.", async () => {
    // bouton "Tout" non visible
    await expect(page.locator('#commandes-table-menu div >> text=Tous')).toBeHidden()

    // bouton "Valeur" non visible
    await expect(page.locator('#commandes-table-menu div >> text=Valeur')).toBeHidden()

    // bouton "Prépara." est visible
    await expect(page.locator('#commandes-table-menu div >> text=Prépara.')).toBeVisible()

    // liste articles cachée
    const listeNonVisible = await articlesListNoVisible(page)
    expect(listeNonVisible).toEqual(true)

    // vérififier addition
    const listeArticles = [{ nom: "Pression 33", nb: 1, prix: 2 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
    { nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 1, prix: 1 }]
    await checkAlreadyPaidBill(page, listeArticles)

    // total de "reste à payer" ok
    await expect(page.locator('#addition-reste-a-payer')).toHaveText('0' + currencySymbolTrans)

    await page.close()
  })

})