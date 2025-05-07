// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// DEBUG=1 / DEMO=1 / language = fr
import { test, expect } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, selectArticles, resetCardCashless, creditMoneyOnCardCashless,
  getTranslate, getEntity, fakeUserAgent
} from '../../mesModules/commun.js'

let page, currencySymbolTrans
const language = "fr"

// attention la taille d'écran choisie affiche le menu burger
test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true,
  userAgent: fakeUserAgent
})

test.describe("Commandes, payer en une seule fois", () => {
  test("Contexte: aller point de vente 'RESTO'", async ({ browser }) => {
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

  test("contexte: vider carte client 1 et la crediter de 40Unités", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // créditer monnaie : 4 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client1', 4, 'cb')
    // Transaction OK !
    await expect(page.locator('.test-return-title-content')).toHaveText('Transaction ok')

    // total cb de 40 Unités
    await expect(page.locator('.test-return-total-achats')).toHaveText('Total(cb) 40.00 ' + currencySymbolTrans)

    // retour créditation
    await page.locator('#popup-retour').click()
  })

  test('Commande sur table 2, paiement en cashless', async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table S02 
    const table = 'S02'
    await page.locator('#tables-liste .table-bouton', { hasText: table }).click()

    // pv resto affiché S02 <-
    await expect(page.locator(`.titre-vue >> text=Nouvelle commande sur table ${table}, PV Resto`)).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText('TOTAL 0 ' + currencySymbolTrans)

    // sélection des articles
    const listeArticles = [
      { nom: "Despé", nb: 2, prix: 3.2 },
      { nom: "CdBoeuf", nb: 1, prix: 25 },
      { nom: "Café", nb: 2, prix: 1 }
    ]

    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')

    // bouton "CASHLESS" présent
    await expect(btPaiementCashless).toBeVisible()

    // total = 33.4Unités
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 33.4 ${currencySymbolTrans}` })).toBeVisible()

    // sélection du cashless comme moyen de paiement
    await btPaiementCashless.click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // méssage "Envoyée en préparation"
    await page.locator('.test-return-msg-prepa', { hasText: 'Envoyée en préparation' }).click()

    // total (moyen de paiement) valeur Unité
    await expect(page.locator('.test-return-total-achats', { hasText: `Total(cashless) 33.4 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `CLIENT 1 - carte avant achats 40.00 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - carte après achats 6.60 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })

  test("Contexte: 0 Unité sur première carte et 10 Unités pour la deuxième", async () => {
    // vidage carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // vidage carte client 2
    await resetCardCashless(page, 'nfc-client2')

    // client 2, créditer monnaie : 1 * 10
    await creditMoneyOnCardCashless(page, 'nfc-client2', 1, 'cb')

    // Transaction OK !
    await expect(page.locator('.test-return-title-content')).toHaveText('Transaction ok')

    // sur carte 10 Unités
    await expect(page.locator('.test-return-total-carte')).toHaveText(`CLIENT 2 - carte 10 ${currencySymbolTrans}`)

    // clique sur bouton "RETOUR"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()
  })

  test('Commande sur table 3, paiement en cashless, fonds insuffisant sur première carte', async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table S03
    await page.locator('#tables-liste .table-bouton', { hasText: 'S03' }).click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table S03, PV Resto')).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

    // sélection des articles
    const listeArticles = [{ nom: "Guinness", nb: 1, prix: 4.99 }, { nom: "Pression 33", nb: 1, prix: 2 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')

    // bouton "CASHLESS" présent
    await expect(btPaiementCashless).toBeVisible()

    // total = 6.99Unités
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 6.99 ${currencySymbolTrans}` })).toBeVisible()

    // sélection du cashless comme moyen de paiement
    await btPaiementCashless.click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message Fonds insuffisants affiché
    await expect(page.locator('.message-fonds-insuffisants', { hasText: 'Fonds insuffisants' })).toBeVisible()

    // il manque 6.99 Untés
    await expect(page.locator('.message-fonds-insuffisants')).toContainText(`manque 6.99 ${currencySymbolTrans}`)

    // sélection 2ème carte cashless
    await page.locator('#popup-cashless div[class="paiement-bt-container test-fonds-insuffisants-nfc"]').click()

    // sélection client 2 affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sélection client 2
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // méssage "Envoyée en préparation"
    await page.locator('.test-return-msg-prepa', { hasText: 'Envoyée en préparation' }).click()

    // total (moyen de paiement) valeur Unités
    await expect(page.locator('.test-return-total-achats', { hasText: `Total(cashless) 6.99 ${currencySymbolTrans}` })).toBeVisible()

    // total des cartes cashless
    await expect(page.locator('.test-return-purchase-cards', { hasText: `Total des cartes 10.00 ${currencySymbolTrans}` })).toBeVisible()

    // contenu 1ère carte cashless après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - carte après achats 0 ${currencySymbolTrans}` })).toBeVisible()

    // clique sur bouton "RETOUR"
    await page.locator('#popup-retour').click()
  })

  test("Contexte: 0 Unités sur première carte et 0 Unités pour la deuxième", async () => {
    // vidage carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // vidage carte client 2
    await resetCardCashless(page, 'nfc-client2')

  })

  test('Commande sur table 4, paiement en cashless, fonds insuffisant sur première et deuxième carte', async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table S04
    await page.locator('#tables-liste .table-bouton', { hasText: 'S04' }).click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table S04, PV Resto')).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

    // sélection des articles
    const listeArticles = [{ nom: "Soft P", nb: 3, prix: 1 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')

    // bouton "CASHLESS" présent
    await expect(btPaiementCashless).toBeVisible()

    // total = 3Unités
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 3 ${currencySymbolTrans}` })).toBeVisible()

    // sélection du cashless comme moyen de paiement
    await btPaiementCashless.click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message Fonds insuffisants affiché
    await expect(page.locator('.message-fonds-insuffisants', { hasText: 'Fonds insuffisants' })).toBeVisible()

    // il manque 3 Unités
    await expect(page.locator('.message-fonds-insuffisants')).toContainText(`manque 3.00 ${currencySymbolTrans}`)

    // sélection 2ème carte cashless (AUTRE CARTE)
    await page.locator('#popup-cashless div[class="paiement-bt-container test-fonds-insuffisants-nfc"]').click()

    // sélection client 2 affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sélection client 2
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 2ème carte message fonds insuffisants affiché
    await expect(page.locator('.message-fonds-insuffisants', { hasText: 'Fonds insuffisants' })).toBeVisible()

    // text "sur deuxieme carte" affichée
    await expect(page.locator('.message-fonds-insuffisants', { hasText: 'sur deuxieme carte' })).toBeVisible()

    // il manque 3 Unités
    await expect(page.locator('.message-fonds-insuffisants')).toContainText(`manque 3.00 ${currencySymbolTrans}`)

    // bouton "RETOUR" présent
    await expect(page.locator('#popup-retour')).toBeVisible()

    // clique sur bouton "RETOUR"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()
  })

  test('Commande sur table 5, paiement en cashless, fonds insuffisant sur carte, complémentaire espèce, somme donnée 10', async () => {
    // cartes vidées sur contexte précédant

    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table S05
    await page.locator('#tables-liste .table-bouton', { hasText: 'S05' }).click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table S05, PV Resto')).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

    // sélection des articles
    const listeArticles = [{ nom: "Gateau", nb: 1, prix: 8 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')

    // bouton "CASHLESS" présent
    await expect(btPaiementCashless).toBeVisible()

    // total = 8Unités
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 8 ${currencySymbolTrans}` })).toBeVisible()

    // sélection du cashless comme moyen de paiement
    await btPaiementCashless.click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message Fonds insuffisants affiché
    await expect(page.locator('.message-fonds-insuffisants', { hasText: 'Fonds insuffisants' })).toBeVisible()

    // il manque 8 Unités
    await expect(page.locator('.message-fonds-insuffisants')).toContainText(`manque 8.00 ${currencySymbolTrans}`)

    // sélection ESPÈCE
    await page.locator('#popup-cashless div[class="paiement-bt-container test-fonds-insuffisants-espece"]').click()

    // attendre confirmation paiement
    await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()

    // somme donnée premier essai 10
    await page.locator('#given-sum').fill('10')

    // valider/confirmer
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // méssage "Envoyée en préparation"
    await page.locator('.test-return-msg-prepa', { hasText: 'Envoyée en préparation' }).click()

    // total (moyen de paiement) valeur Unités
    await expect(page.locator('.test-return-total-achats', { hasText: `Total(espèce) 8.00 ${currencySymbolTrans}` })).toBeVisible()

    // première carte aprèss achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `CLIENT 1 - carte après achats 0 ${currencySymbolTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-return-given-sum')).toHaveText(`somme donnée 10 ${currencySymbolTrans}`)

    // monnaie à rendre
    await expect(page.locator('.test-return-change')).toHaveText(`Monnaie à rendre 2 ${currencySymbolTrans}`)

    // retour
    await page.locator('#popup-retour').click()
  })

  test('Commande sur table Ex01, paiement cashless, fonds insuffisant sur carte, complémentaire cb', async () => {
    // cartes vidées sur contexte précédant

    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table Ex01
    await page.locator('#tables-liste .table-bouton', { hasText: 'Ex01' }).click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table Ex01, PV Resto')).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

    // sélection des articles
    const listeArticles = [{ nom: "Despé", nb: 1, prix: 3.2 }, { nom: "Guinness", nb: 1, prix: 4.99 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement cashless
    const btPaiementCashless = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cashless"]')

    // bouton "CASHLESS" présent
    await expect(btPaiementCashless).toBeVisible()

    // total = 8.19 Unités
    await expect(btPaiementCashless.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 8.19 ${currencySymbolTrans}` })).toBeVisible()

    // sélection du cashless comme moyen de paiement
    await btPaiementCashless.click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // message Fonds insuffisants affiché
    await expect(page.locator('.message-fonds-insuffisants', { hasText: 'Fonds insuffisants' })).toBeVisible()

    // il manque 8.19 Unités
    await expect(page.locator('.message-fonds-insuffisants')).toContainText(`manque 8.19 ${currencySymbolTrans}`)

    // sélection CB
    await page.locator('#popup-cashless div[class="paiement-bt-container test-fonds-insuffisants-cb"]').click()

    // attendre confirmation paiement
    await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()

    // moyen de paiement cb affiché
    await expect(page.locator('.test-return-payment-method', { hasText: 'cb' })).toBeVisible()

    // valider/confirmer
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // méssage "Envoyée en préparation"
    await page.locator('.test-return-msg-prepa', { hasText: 'Envoyée en préparation' }).click()

    // total (moyen de paiement) valeur Unités
    await expect(page.locator('.test-return-total-achats', { hasText: `Total(cb) 8.19 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })

  test('Commande sur table Ex02: total  32.1, paiement en espèce, somme donnée 1er essai 20 et 2ème essai 50', async () => {
    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table Ex02
    await page.locator('#tables-liste .table-bouton', { hasText: 'Ex02' }).click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table Ex02, PV Resto')).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

    // sélection des articles, total 32.1
    const listeArticles = [{ nom: "Eau 1L", nb: 1, prix: 1.5 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
    { nom: "Chimay Bleue", nb: 2, prix: 2.8 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement espèce
    const btPaiementEspece = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]')

    // bouton "ESPÈCE" présent
    await expect(btPaiementEspece).toBeVisible()

    // total = 32.1Unités
    await expect(btPaiementEspece.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 32.1 ${currencySymbolTrans}` })).toBeVisible()

    // sélectionner  ESPÈCE
    await btPaiementEspece.click()

    // attendre confirmation paiement
    await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()

    // somme donnée premier essai 20
    await page.locator('#given-sum').fill('20')

    // valider/confirmer
    await page.locator('#popup-confirme-valider').click()

    // message d'erreur affiché "total = 32.1"
    await expect(page.locator('#given-sum-msg-erreur', { hasText: 'total = 32.1' })).toBeVisible()

    // somme donnée premier essai 50
    await page.locator('#given-sum').fill('50')

    // valider/confirmer
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // méssage "Envoyée en préparation"
    await page.locator('.test-return-msg-prepa', { hasText: 'Envoyée en préparation' }).click()

    // total (moyen de paiement) valeur unités
    await expect(page.locator('.test-return-total-achats', { hasText: `Total(espèce) 32.1 ${currencySymbolTrans}` })).toBeVisible()

    // somme donnée
    await expect(page.locator('.test-return-given-sum')).toHaveText(`somme donnée 50 ${currencySymbolTrans}`)

    // monnaie à rendre
    await expect(page.locator('.test-return-change')).toHaveText(`Monnaie à rendre 17.9 ${currencySymbolTrans}`)

    // retour
    await page.locator('#popup-retour').click()
  })

  test('Commande sur table Ex03, paiement en cb', async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table Ex03
    await page.locator('#tables-liste .table-bouton', { hasText: 'Ex03' }).click()

    // pv resto affiché
    await expect(page.locator('.titre-vue >> text=Nouvelle commande sur table Ex03, PV Resto')).toBeVisible()

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total')).toHaveText(`TOTAL 0 ${currencySymbolTrans}`)

    // sélection des articles, total 5.8
    const listeArticles = [{ nom: "Despé", nb: 1, prix: 3.2 }, { nom: "Chimay Rouge", nb: 1, prix: 2.6 }]
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

    // attendre moyens de paiement
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // bouton paiement CB
    const btPaiementCb = page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]')

    // bouton "CB" présent
    await expect(btPaiementCb).toBeVisible()

    // total = 5.8Unités
    await expect(btPaiementCb.locator('div[class="paiement-bt-total"]', { hasText: `TOTAL 5.8 ${currencySymbolTrans}` })).toBeVisible()

    // clique sur cb
    await btPaiementCb.click()

    // attendre confirmation paiement
    await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()

    // type de paiement cb affiché
    await expect(page.locator('.test-return-payment-method', { hasText: 'cb' })).toBeVisible()

    // valider/confirmer
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // méssage "Envoyée en préparation"
    await page.locator('.test-return-msg-prepa', { hasText: 'Envoyée en préparation' }).click()

    // total (moyen de paiement) valeur Unités
    await expect(page.locator('.test-return-total-achats', { hasText: `Total(cb) 5.8 ${currencySymbolTrans}` })).toBeVisible()

    await page.close()
  })
})
