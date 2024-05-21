// cashless_demo1.env DEBUG=True / DEMO=True / language = fr
import { test, expect } from '@playwright/test'
import { connection, changeLanguage, goPointSale, getTranslate, selectArticles, checkBillDirectService, resetCardCashless, creditCardCashless } from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page, directServiceTrans, cashTrans, paiementTypeTrans, confirmPaymentTrans, transactionTrans, okTrans
let totalTrans, givenSumTrans, changeTrans, currencySymbolTrans, returnTrans, cbTrans, prePurchaseCardTrans
let postPurchaseCardTrans, onTrans, cardTrans
const language = "en"

test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true
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
    directServiceTrans = await getTranslate(page, 'directService', 'capitalize')
    cashTrans = await getTranslate(page, 'cash', 'uppercase')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    totalTrans = await getTranslate(page, 'total', 'capitalize')
    givenSumTrans = await getTranslate(page, 'givenSum')
    changeTrans = await getTranslate(page, 'change', 'capitalize')
    currencySymbolTrans = await getTranslate(page, 'currencySymbol')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    cbTrans = await getTranslate(page, 'cb')
    prePurchaseCardTrans = await getTranslate(page, 'prePurchaseCard')
    postPurchaseCardTrans = await getTranslate(page, 'postPurchaseCard')
    onTrans = await getTranslate(page, 'on', 'capitalize')
    cardTrans = await getTranslate(page, 'card')
  })

  test("Achat 2 pression 33 + 1 pression 50 + paiement en espèce(30€) + confirmation + rendu", async () => {
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
    page.locator('#popup-cashless bouton-basique[class="test-ref-cash"]').click()

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

    // 'Total(espèce) 6.50 €' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cashTrans}) 6.50 ${currencySymbolTrans}` })).toBeVisible()

    // 'somme donnée 30 €' est affiché
    await expect(page.locator('.test-return-given-sum', { hasText: `${givenSumTrans} 30 ${currencySymbolTrans}` })).toBeVisible()

    // 'Monnaie à rendre 23.5 €' est affiché
    await expect(page.locator('.test-return-change', { hasText: `${changeTrans} 23.5 ${currencySymbolTrans}` })).toBeVisible()

    // bouton retour présent
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // cliquer sur RETOUR
    page.locator('#popup-retour').click()

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
    page.locator('#popup-cashless bouton-basique[class="test-ref-cb"]').click()

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

    // 'Total(cb) 2.00 €' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 2.00 ${currencySymbolTrans}` })).toBeVisible()

    // bouton retour présent
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // cliquer sur RETOUR
    page.locator('#popup-retour').click()

    // titre visible
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(directServiceTrans)
    await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')
  })

  test("contexte: vider carte client 1 et la crediter de 10€", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // créditer de 10 €  et 0 cadeau
    // 1 * 10 + 0 * 5
    await creditCardCashless(page, 'nfc-client1', 1, 0, 'cb')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(cb) 2.00 €' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 10.00 ${currencySymbolTrans}` })).toBeVisible()

    // retour créditation
    await page.locator('#popup-retour').click()
  })

  test("Achat 1 Soft G + paiement en cashless; carte cashless client 1 = 10€", async () => {
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
    page.locator('#popup-cashless bouton-basique[class="test-ref-cashless"]').click()

    // sélection client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // total (moyen de paiement 1 / moyen de paiement 2) valeur €
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(cashless) 1.50 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 avant achats
    await expect(page.locator('.test-return-pre-purchase-card', { hasText: `ROBOCOP - ${prePurchaseCardTrans} 10 ${currencySymbolTrans}` })).toBeVisible()

    // sur carte client 1 après achats
    await expect(page.locator('.test-return-post-purchase-card', { hasText: `ROBOCOP - ${postPurchaseCardTrans} 8.5 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })

  test("contexte: vider carte cahsless client 1 = 0€ et carte cashless client 2 = 40€", async () => {
    // vider carte client 1
    await resetCardCashless(page, 'nfc-client1')

    // vider carte client 2
    await resetCardCashless(page, 'nfc-client2')

    // créditer car client 2 de 40 €  et 0 cadeau
    // 4 *10 + 0 * 5
    await creditCardCashless(page, 'nfc-client2', 4, 0, 'cb')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // 'Total(cb) 40.00 €' est affiché
    await expect(page.locator('.test-return-total-achats', { hasText: `${totalTrans}(${cbTrans}) 40.00 ${currencySymbolTrans}` })).toBeVisible()

    // retour créditation
    await page.locator('#popup-retour').click()

    // --- carte client 1, cashless = 0 € ---
    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sur carte 0 €
    await expect(page.locator('.test-return-total-card', { hasText: `${onTrans} ${cardTrans} : 0 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()

    await page.pause()

    // --- carte client 2, cashless = 40 € ---
    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client2').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // sur carte 40 €
    await expect(page.locator('.test-return-total-card', { hasText: `${onTrans} ${cardTrans} : 40 ${currencySymbolTrans}` })).toBeVisible()

    // retour
    await page.locator('#popup-retour').click()
  })
  /*  
      test("Achat 1 Guinness + 1 Soft P + paiement en cashless 0€ / cashless complémentaire client2 40€", async () => {
        // aller au point de vente "BAR 1"
        await goPointSale(page, 'Bar 1')
    
        // titre
        await expect(page.locator('.titre-vue')).toHaveText('Service direct -  Bar 1')
    
        // bien sur "Bar 1"
        await expect(page.locator('text=Service Direct - Bar 1')).toBeVisible()
    
        // sélection des articles
        const listeArticles = [{ nom: "Guinness", nb: 1, prix: 4.99 }, { nom: "Soft P", nb: 1, prix: 1 }]
        await selectArticles(page, listeArticles, "Bar 1")
    
        // valider les achats
        await page.locator('#bt-valider').click()
    
        // attente affichage "Type(s) de paiement"
        await page.locator('#popup-cashless', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })
    
        // sélection cashless
        await page.locator('#popup-cashless bouton-basique >> text=CASHLESS').click()
    
        // sélection client 1
        await page.locator('#nfc-client1').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // il manque 5.99 €
        await expect(page.locator('.message-fonds-insuffisants')).toContainText('manque 5.99 €')
    
        // sélection 2ème carte cashless
        await page.locator('#popup-cashless bouton-basique').getByText('AUTRE CARTE').click()
    
        // sélection client 2 affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // sélection client 2
        await page.locator('#nfc-client2').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // 'Transaction ok' est affiché
        await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()
    
        // total (moyen de paiement 1 / moyen de paiement 2) valeur €
        await expect(page.locator('.test-return-total-achats', { hasText: 'Total(cashless/cashless) 5.99 €' })).toBeVisible()
    
        // sur carte client 1 avant achats
        await expect(page.locator('.test-return-pre-purchase-card', { hasText: 'TEST - carte avant achats 0 €' })).toBeVisible()
    
        // complémentaire  
        await expect(page.locator('.test-return-additional', { hasText: 'Complémentaire 5.99 € en cashless' })).toBeVisible()
    
        // sur carte client 1 après achats
        await expect(page.locator('.test-return-post-purchase-card', { hasText: 'TEST - carte après achats 0 €' })).toBeVisible()
    
        // retour
        await page.locator('#popup-retour').click()
      })
    
    
      test("contexte, complémentaire espèce : vider carte cahsless client 1 = 0€ ", async () => {
        // vider carte client 1
        await resetCardCashless(page, 'nfc-client1')
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // vidage carte ok
        await expect(page.locator('.test-return-reset')).toHaveText('Vidage carte ok')
    
        // retour
        await page.locator('#popup-retour').click()
    
        // --- carte client 1, cashless = 0 € ---
        // Clique sur le bouton "CHECK CARTE")
        await page.locator('#page-commandes-footer div:has-text("CHECK CARTE")').first().click()
    
        // cliquer sur carte nfc simulée
        await page.locator('#nfc-client1').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // sur carte 0 €
        await expect(page.locator('.test-return-total-card')).toHaveText('Sur carte : 0 €')
    
        // retour
        await page.locator('#popup-retour').click()
      })
    
      test("Achat 1 Chimay Bleue + paiement en cashless 0€ / espèce somme donnée 50€", async () => {
        // aller au point de vente "BAR 1"
        await goPointSale(page, 'Bar 1')
    
        // titre
        await expect(page.locator('.titre-vue')).toHaveText('Service direct -  Bar 1')
    
        // bien sur "Bar 1"
        await expect(page.locator('text=Service Direct - Bar 1')).toBeVisible()
    
        // sélection des articles
        const listeArticles = [{ nom: "Chimay Bleue", nb: 1, prix: 2.8 }]
        await selectArticles(page, listeArticles, "Bar 1")
    
        // valider les achats
        await page.locator('#bt-valider').click()
    
        // attente affichage "Type(s) de paiement"
        await page.locator('#popup-cashless', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })
    
        // sélection cashless
        await page.locator('#popup-cashless bouton-basique').getByText('CASHLESS').click()
    
        // sélection client 1
        await page.locator('#nfc-client1').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // Fonds insuffisants
        await expect(page.locator('.message-fonds-insuffisants')).toContainText('Fonds insuffisants')
    
        // sélectionner espèce
        await page.locator('#popup-cashless bouton-basique').getByText('ESPÈCE').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // Confirmez le paiement est affiché
        await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()
    
        // espèce est affiché
        await expect(page.locator('.test-return-payment-method', { hasText: 'espèce' })).toBeVisible()
    
        // input value = 50
        await page.locator('#given-sum').fill('50')
    
        // valider
        await page.locator('#popup-confirme-valider').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // 'Transaction ok' est affiché
        await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()
    
        // total en espèce
        await expect(page.locator('.test-return-total-achats')).toHaveText('Total(cashless/espèce) 2.80 €')
    
        // sur carte client 1 avant achats
        await expect(page.locator('.test-return-pre-purchase-card', { hasText: 'TEST - carte avant achats 0 €' })).toBeVisible()
    
        // complémentaire  
        await expect(page.locator('.test-return-additional', { hasText: 'Complémentaire 2.80 € en espèce' })).toBeVisible()
    
        // somme donnée
        await expect(page.locator('.test-total-achats', { hasText: 'somme donnée 50 €' })).toBeVisible()
    
        // sur carte client 1 après achats
        await expect(page.locator('.test-return-post-purchase-card', { hasText: 'TEST - carte après achats 0 €' })).toBeVisible()
    
        // monnaie à rendre
        await expect(page.locator('.test-return-change', { hasText: 'Monnaie à rendre 47.2 €' })).toBeVisible()
    
        // retour
        await page.locator('#popup-retour').click()
      })
    
    
      // context complémentaire cb : vider carte cahsless client 1 = 0€ est déjà fait 2 fois
      test("Achat 1 Chimay Bleue + paiement en cashless/cb", async () => {
        // aller au point de vente "BAR 1"
        await goPointSale(page, 'Bar 1')
    
        // titre
        await expect(page.locator('.titre-vue')).toHaveText('Service direct -  Bar 1')
    
        // bien sur "Bar 1"
        await expect(page.locator('text=Service Direct - Bar 1')).toBeVisible()
    
        // sélection des articles
        const listeArticles = [{ nom: "Chimay Bleue", nb: 1, prix: 2.8 }]
        await selectArticles(page, listeArticles, "Bar 1")
    
        // valider les achats
        await page.locator('#bt-valider').click()
    
        // attente affichage "Type(s) de paiement"
        await page.locator('#popup-cashless', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })
    
        // sélection cashless
        await page.locator('#popup-cashless bouton-basique').getByText('CASHLESS').click()
    
        // sélection client 1
        await page.locator('#nfc-client1').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // Fonds insuffisants
        await expect(page.locator('.message-fonds-insuffisants')).toContainText('Fonds insuffisants')
    
        // sélectionner espèce
        await page.locator('#popup-cashless bouton-basique  .sous-element-texte > div').getByText('CB').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // Confirmez le paiement est affiché
        await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()
    
        // moyen de paiement cb
        await expect(page.locator('.test-return-payment-method', { hasText: 'cb' })).toBeVisible()
    
        // valider/confirmer cb
        await page.locator('#popup-confirme-valider').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // 'Transaction ok' est affiché
        await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()
    
        // total en espèce
        await expect(page.locator('.test-return-total-achats')).toHaveText('Total(cashless/cb) 2.80 €')
    
        // sur carte client 1 avant achats
        await expect(page.locator('.test-return-pre-purchase-card', { hasText: 'TEST - carte avant achats 0 €' })).toBeVisible()
    
        // complémentaire  
        await expect(page.locator('.test-return-additional', { hasText: 'Complémentaire 2.80 € en cb' })).toBeVisible()
    
        // sur carte client 1 après achats
        await expect(page.locator('.test-return-post-purchase-card', { hasText: 'TEST - carte après achats 0 €' })).toBeVisible()
    
        // retour
        await page.locator('#popup-retour').click()
      })
    
    
      test("contexte, complémentaire : vider carte client 1 et la crediter de 10€", async () => {
        // vider carte client 1
        await resetCardCashless(page, 'nfc-client1')
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // vidage carte ok
        await expect(page.locator('.test-return-reset')).toHaveText('Vidage carte ok')
    
        // retour
        await page.locator('#popup-retour').click()
    
        // créditer de 10 €  et 0 cadeau
        // 1 * 10 + 0 * 5
        await creditCardCashless(page, 'nfc-client1', 1, 0, 'cb')
    await page.pause()
        // Transaction OK !
        await expect(page.locator('.test-return-title-content')).toHaveText('Transaction ok')
    
        // total cb de 10 €
        await expect(page.locator('.test-return-total-achats')).toHaveText('Total(cb) 10.00 €')
    await page.pause()  await page.locator('#popup-retour').click()
      })
    
    
      test("Achat 3 Gateau + paiement en cashless 10€ / espèce somme donnée 20€", async () => {
        // aller au point de vente "BAR 1"
        await goPointSale(page, 'Bar 1')
    
        // titre
        await expect(page.locator('.titre-vue')).toHaveText('Service direct -  Bar 1')
    
        // bien sur "Bar 1"
        await expect(page.locator('text=Service Direct - Bar 1')).toBeVisible()
    
        // sélection des articles
        const listeArticles = [{ nom: "Gateau", nb: 3, prix: 8 }]
        await selectArticles(page, listeArticles, "Bar 1")
    
        // valider les achats
        await page.locator('#bt-valider').click()
    
        // attente affichage "Type(s) de paiement"
        await page.locator('#popup-cashless', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })
    
        // sélection cashless
        await page.locator('#popup-cashless bouton-basique').getByText('CASHLESS').click()
    
        // sélection client 1
        await page.locator('#nfc-client1').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // Fonds insuffisants
        await expect(page.locator('.message-fonds-insuffisants')).toContainText('Fonds insuffisants')
    
        // sélectionner espèce
        await page.locator('#popup-cashless bouton-basique').getByText('ESPÈCE').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // Confirmez le paiement est affiché
        await expect(page.locator('.test-return-confirm-payment', { hasText: 'Confirmez le paiement' })).toBeVisible()
    
        // espèce est affiché
        await expect(page.locator('.test-return-payment-method', { hasText: 'espèce' })).toBeVisible()
    
        // input value = 20
        await page.locator('#given-sum').fill('20')
    
        // valider
        await page.locator('#popup-confirme-valider').click()
    
        // attente affichage "popup-cashless"
        await page.locator('#popup-cashless').waitFor({ state: 'visible' })
    
        // 'Transaction ok' est affiché
        await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()
    
        // total en espèce
        await expect(page.locator('.test-return-total-achats')).toHaveText('Total(cashless/espèce) 24.00 €')
    
        // sur carte client 1 avant achats
        await expect(page.locator('.test-return-pre-purchase-card', { hasText: 'TEST - carte avant achats 10 €' })).toBeVisible()
    
        // complémentaire  
        await expect(page.locator('.test-return-additional', { hasText: 'Complémentaire 14.00 € en espèce' })).toBeVisible()
    
        // somme donnée
        await expect(page.locator('.test-total-achats', { hasText: 'somme donnée 20 €' })).toBeVisible()
    
        // sur carte client 1 après achats
        await expect(page.locator('.test-return-post-purchase-card', { hasText: 'TEST - carte après achats 0 €' })).toBeVisible()
    
        // monnaie à rendre
        await expect(page.locator('.test-return-change', { hasText: 'Monnaie à rendre 6 €' })).toBeVisible()
    
        // retour
        await page.locator('#popup-retour').click()
    
        // fermer navigateur / fin
        await page.close()
      })
      */

  test("Fin", async () => {
    await page.pause()
    await page.close()
  })
})