// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect, chromium } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, newOrderIsShow, selectArticles, checkBill,
  getTranslate, managerMode, goTableOrder, checkAlreadyPaidBill, gridIsTestable
} from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page
const language = "en"
let additionCapitalizeTrans, paiementTypeTrans, confirmPaymentTrans, transactionTrans, okTrans, returnTrans
let articles, currencySymbolTrans, shortcutPrepaTrans, transP, validatePrepaUppercaseTrans, deleteArticlesUppercaseTrans
let noArticleCapitalizeTrans, hasBeenSelectedTrans, preparationsCapitalizeTrans, transSP
// la liste d'articles
const listeArticles = [{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
{ nom: "Café", nb: 2, prix: 1 }]

test.use({ viewport: { width: 375, height: 800 }, ignoreHTTPSErrors: true })

test.describe('Préparation "Non Servie - Payée": une suppression et une validation en mode gérant.', () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // obtenir les traductions pour ce test et tous les autres
    additionCapitalizeTrans = await getTranslate(page, 'addition', 'capitalize')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    articles = await getTranslate(page, 'articles', 'capitalize')
    currencySymbolTrans = await getTranslate(page, 'currencySymbol')
    shortcutPrepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    transP = await getTranslate(page, 'notServedPaidOrder', 'capitalize')
    transSP = await getTranslate(page, 'servedPaidOrder', 'capitalize')
    validatePrepaUppercaseTrans = await getTranslate(page, 'validatePreparation', 'uppercase')
    deleteArticlesUppercaseTrans = await getTranslate(page, 'deleteArticles', 'uppercase')
    noArticleCapitalizeTrans = await getTranslate(page, 'noArticle', 'capitalize')
    hasBeenSelectedTrans = await getTranslate(page, 'hasBeenSelected')
    preparationsCapitalizeTrans = await getTranslate(page, 'preparations', 'capitalize')

  })

  test('Contexte, une commande "Non Servie - Payée"', async ({ browser }) => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // clique table éphémère
    await page.locator('#tables-liste .test-table-ephemere').click()

    // entrer le nom de table "ephemere2"
    await page.locator('#entree-nom-table').fill('ephemere2')

    // valider la création de la table éphémère
    await page.locator('#test-valider-ephemere').click()

    // nouvelle commande de la salle ephe1Payee du point de vente RESTO est affichée
    await newOrderIsShow(page, 'ephemere2', 'Resto')

    // sélection des articles
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET ALLER A LA PAGE PAIEMENT"
    await page.locator('#popup-cashless #test-prepa3').click()

    // attendre page de paiement
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ephemere2' }).waitFor({ state: 'visible' })

    // clique bouton "Tout"
    await page.locator('#commandes-table-menu div[onclick="restau.ajouterTousArticlesAddition()"]').click()

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
    await page.locator('bouton-basique[class="test-ref-cb"]').click()

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

  test('Préparations(table ephemere2), status: "Non Servie - Payée"  / mode gérant.', async () => {
    // Passage en mode gérant
    await managerMode(page, 'on')

    // Aller à la table ephemere2
    await goTableOrder(page, 'ephemere2')

    // attendre page de paiement
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ephemere2' }).waitFor({ state: 'visible' })

    // clique bt "Adition"
    await page.locator(`#commandes-table-menu div >> text=${additionCapitalizeTrans}`).click()

    // vérifier addition payée ok
    await checkAlreadyPaidBill(page, listeArticles)

    // reste à payer 0€
    await expect(page.locator('#addition-reste-a-payer', { hasText: `0${currencySymbolTrans}` })).toBeVisible()

    // Clique sur "Prépara." 
    await page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    const blocks = [
      { ref: 'CdBoeuf', articles: [{ nom: "CdBoeuf", nb: 1, prix: 25 }] },
      { ref: 'Despé', articles: [{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 2, prix: 1 }] }
    ]

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      // "locator" de la commande
      const loc = page.locator('.com-conteneur', { hasText: block.ref })
      // non servie - payé
      await expect(loc.locator('.test-ref-status-order', { hasText: transP })).toBeVisible()
      // fond de la commande non grisé
      await expect(loc).not.toHaveCSS('opacity', '0.5')
      // bouton grille si nb articles supérieurs à 1 ou total d'un articles upérieurs à 1 
      const result = gridIsTestable(blocks, block.ref)
      if (result === true) {
        await expect(loc.locator('.test-return-icon-grid')).toBeVisible()
      }
      // bouton reset présent
      await expect(loc.locator('.test-return-action-reset')).toBeVisible()
      // bouton supprimer articles présent
      await expect(loc.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans })).toBeVisible()
      // bouton valider présent
      await expect(loc.locator('.test-action-validate-article', { hasText: validatePrepaUppercaseTrans })).toBeVisible()


      // articles
      for (let j = 0; j < block.articles.length; j++) {
        const article = block.articles[j]
        // locator ligne
        const locLine = page.locator('.com-article-ligne', { hasText: article.nom })
        // bouton plus présent
        await expect(locLine.locator('.com-bt .test-return-icon-plus')).toBeVisible()
        // le nombre articles sélectioné présent
        await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '0' })).toBeVisible()
        // quantité article présente
        await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: article.nb })).toBeVisible()
        // nom article présent
        await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()
      }
    }
  })

  test('Préparations(table ephemere2), bouton "grille"(tout sélectioner) et "RESET".', async () => {
    const block = { ref: 'Despé', articles: [{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 2, prix: 1 }] }

    // cliquer sur bt grille de la commande incluant l'article 'Despé'
    const loc = page.locator('.com-conteneur', { hasText: block.ref })
    await loc.locator('.test-return-icon-grid').click()

    // tous les articles d'une commande sont sélectionnés
    for (let j = 0; j < block.articles.length; j++) {
      const article = block.articles[j]
      // locator ligne
      const locLine = page.locator('.com-article-ligne', { hasText: article.nom })
      // le nombre articles sélectioné présent
      await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: article.nb })).toBeVisible()
    }

    // Cliquer sur bouton "RESET"
    await loc.locator('.test-return-action-reset').click()

    // La sélection des articles est remise à l'état initial '0'
    // tous les articles d'une commande sont sélectionnés
    for (let j = 0; j < block.articles.length; j++) {
      const article = block.articles[j]
      // locator ligne
      const locLine = page.locator('.com-article-ligne', { hasText: article.nom })
      // le nombre articles sélectioné présent
      await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '0' })).toBeVisible()
    }
  })

  test("Préparations(table ephemere2), suppression d'un article mais aucun article sélectionné.", async () => {
    const block = { ref: 'Despé', articles: [{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 2, prix: 1 }] }

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // cliquer sur bt "supprimer articles" de la commande incluant l'article 'Despé'
    const loc = page.locator('.com-conteneur', { hasText: block.ref })
    await loc.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // le message "Aucun article" présent
    await expect(page.locator('#popup-cashless .test-return-msg-about-article', { hasText: noArticleCapitalizeTrans })).toBeVisible()
    // le message "n'a été selectioné" présent
    await expect(page.locator('#popup-cashless .test-return-msg-about-article', { hasText: hasBeenSelectedTrans })).toBeVisible()

    // bt retour présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=' + returnTrans)).toBeVisible()

    // Cliquer bt retour
    await page.locator('#popup-retour').click()

  })

  test("Préparations(table ephemere2), un article sélectionné(Café) et supprimé.", async () => {
    const loc = page.locator('.com-conteneur', { hasText: "Despé" })
    const article = { nom: "Café", nb: 2, prix: 1 }

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // sélectionner un "Café"
    const locLine = loc.locator('.com-article-ligne', { hasText: article.nom })
    locLine.locator('.test-return-icon-plus').click()

    // le nombre articles sélectioné = 1
    await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '1' })).toBeVisible()
    // quantité article 2
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: article.nb })).toBeVisible()
    // nom article = "Café"
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()

    // Cliquer bt "SUPPRIMER ARTICLE(S)"
    await loc.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // le nombre articles sélectioné = 0
    await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '0' })).toBeVisible()
    // quantité article 1
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: (article.nb - 1) })).toBeVisible()
    // nom article = "Café"
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()
  })

  test("Préparations(table ephemere2), un article sélectionné(Despé) et validé, lieu toujours visible.", async () => {
    const loc = page.locator('.com-conteneur', { hasText: "Despé" })
    const article = { nom: "Despé", nb: 2, prix: 3.2 }

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // sélectionner une "Despé"
    const locLine = loc.locator('.com-article-ligne', { hasText: article.nom })
    locLine.locator('.test-return-icon-plus').click()

    // le nombre articles sélectioné = 1
    await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '1' })).toBeVisible()
    // quantité article 2
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: article.nb })).toBeVisible()
    // nom article = "Despé"
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()

    // Cliquer bt "VALIDER PREPARATION"
    await loc.locator('.test-action-validate-article', { hasText: validatePrepaUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // le nombre articles sélectioné = 0
    await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '0' })).toBeVisible()
    // quantité article 1
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: (article.nb - 1) })).toBeVisible()
    // nom article = "Despé"
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()
  })

  test("Préparations(table ephemere2), valider un article mais aucun article sélectionné.", async () => {
    const block = { ref: 'Despé', articles: [{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 2, prix: 1 }] }

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // cliquer sur bt "valider préparations" de la commande incluant l'article 'Despé'
    const loc = page.locator('.com-conteneur', { hasText: block.ref })
    await loc.locator('.test-action-validate-article', { hasText: validatePrepaUppercaseTrans }).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // le message "Aucun article" présent
    await page.locator('#popup-cashless .test-return-msg-about-article', { hasText: noArticleCapitalizeTrans }).click()
    // le message "n'a été selectioné" présent
    await page.locator('#popup-cashless .test-return-msg-about-article', { hasText: hasBeenSelectedTrans }).click()

    // bt retour présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=' + returnTrans)).toBeVisible()

    // Cliquer bt retour
    await page.locator('#popup-retour').click()
  })

  test("Préparations(table ephemere2), Toutes les prépartions du lieu sont validées, il n'est plus visible.", async () => {
    const loc = page.locator('.com-conteneur', { hasText: "Despé" })

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // cliquer bouton grille
    await loc.locator('.test-return-icon-grid').click()

    // cliquer sur bt "valider préparations" de la commande incluant l'article 'Despé'
    await loc.locator('.test-action-validate-article', { hasText: validatePrepaUppercaseTrans }).click()

    // le lieu de préparation contenant l'article "Café" et Despé n'est plus visible
    await expect(loc).not.toBeVisible()
  })

  test("Préparations(table ephemere2), toutes les préparations  validés, lieux grisés.", async () => {
    const blocks = [
      { ref: 'CdBoeuf', articles: [{ nom: "CdBoeuf", nb: 1, prix: 25 }] },
      { ref: 'Despé', articles: [{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 2, prix: 1 }] }
    ]
    const article = { nom: "CdBoeuf", nb: 1, prix: 25 }
    const loc = page.locator('.com-conteneur', { hasText: article.nom })

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // sélectionner une "CdBoeuf"
    const locLine = loc.locator('.com-article-ligne', { hasText: article.nom })
    locLine.locator('.test-return-icon-plus').click()

    // le nombre articles sélectioné = 1
    await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '1' })).toBeVisible()
    // quantité article 1
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: article.nb })).toBeVisible()
    // nom article = "CdBoeuf"
    await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()

    // cliquer sur bt "valider préparations" de la commande incluant l'article 'CdBoeuf'
    await loc.locator('.test-action-validate-article', { hasText: validatePrepaUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      // "locator" de la commande
      const loc = page.locator('.com-conteneur', { hasText: block.ref })
      // fond de la commande non grisé
      await expect(loc).toHaveCSS('opacity', '0.5')
      // servie - payé
      await expect(loc.locator('.test-ref-status-order', { hasText: transSP })).toBeVisible()
      // bouton grille si nb articles supérieurs à 1 ou total d'un articles upérieurs à 1 
      const result = gridIsTestable(blocks, block.ref)
      if (result === true) {
        await expect(loc.locator('.test-return-icon-grid')).toBeVisible()
      }
      // bouton reset présent
      await expect(loc.locator('.test-return-action-reset')).toBeVisible()
      // bouton supprimer articles présent
      await expect(loc.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans })).toBeVisible()
      // bouton valider présent
      await expect(loc.locator('.test-action-validate-article', { hasText: validatePrepaUppercaseTrans })).not.toBeVisible()
    }

    await page.close()
  })
})