// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect, chromium } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, newOrderIsShow, selectArticles, getTranslate, managerMode,
  goTableOrder, checkAlreadyPaidBill, gridIsTestable
} from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page
const language = "en"
let paiementTypeTrans, confirmPaymentTrans, transactionTrans, okTrans, returnTrans, articles
let additionCapitalizeTrans, currencySymbolTrans, shortcutPrepaTrans, preparationsCapitalizeTrans
let deleteArticlesUppercaseTrans, noArticleCapitalizeTrans, hasBeenSelectedTrans
// la liste d'articles
const listeArticles = [{ nom: "Pression 50", nb: 2, prix: 2.5 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
{ nom: "Gateau", nb: 1, prix: 8 }]

test.use({ viewport: { width: 375, height: 800 }, ignoreHTTPSErrors: true })

test.describe('Préparation: supprimer tous les articles en mode gérant.', () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // obtenir les traductions pour ce test et tous les autres
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    articles = await getTranslate(page, 'articles', 'capitalize')
    additionCapitalizeTrans = await getTranslate(page, 'addition', 'capitalize')
    currencySymbolTrans = await getTranslate(page, 'currencySymbol')
    shortcutPrepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    preparationsCapitalizeTrans = await getTranslate(page, 'preparations', 'capitalize')
    deleteArticlesUppercaseTrans = await getTranslate(page, 'deleteArticles', 'uppercase')
    noArticleCapitalizeTrans = await getTranslate(page, 'noArticle', 'capitalize')
    hasBeenSelectedTrans = await getTranslate(page, 'hasBeenSelected')
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

    // entrer le nom de table "ephemere3"
    await page.locator('#entree-nom-table').fill('ephemere3')

    // valider la création de la table éphémère
    await page.locator('#test-valider-ephemere').click()

    // nouvelle commande de la salle ephe1Payee du point de vente RESTO est affichée
    await newOrderIsShow(page, 'ephemere3', 'Resto')

    // sélection des articles
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS"
    await page.locator('#popup-cashless #test-prepa2').click()

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

  test('Préparation(table ephemere3), supprimer tous les articles du lieu contenant  "Pression 50", mode gérant.', async () => {
    // Passage en mode gérant
    await managerMode(page, 'on')

    // Aller à la table ephemere3
    await goTableOrder(page, 'ephemere3')

    // attendre page de paiement
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ephemere3' }).waitFor({ state: 'visible' })

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

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    const blockPression50 = { ref: "Pression 50", articles: [{ nom: "Pression 50", nb: 2, prix: 2.5 }] }
    // cliquer sur bt grille de la commande incluant l'article 'Pression 50'
    const loc = page.locator('.com-conteneur', { hasText: blockPression50.ref })
    await loc.locator('.test-return-icon-grid').click()

    // Cliquer bt "SUPPRIMER ARTICLE(S)"
    await loc.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // le lieu de préparation contenant l'article "Pression 50" n'est plus visible
    await expect(loc).not.toBeVisible()
  })

  test('Préparation(table ephemere3), supprimer tous les articles du lieu contenant  "CdBoeuf", mode gérant.', async () => {
    const blockPression50 = { ref: "Pression 50", articles: [{ nom: "Pression 50", nb: 2, prix: 2.5 }] }
    const blockCdBoeuf = { ref: "CdBoeuf", articles: [{ nom: "CdBoeuf", nb: 1, prix: 25 }, { nom: "Gateau", nb: 1, prix: 8 }] }

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // cliquer sur bt grille de la commande incluant l'article 'CdBoeuf'
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: blockCdBoeuf.ref })
    await locCdBoeuf.locator('.test-return-icon-grid').click()

    // Cliquer bt "SUPPRIMER ARTICLE(S)"
    await locCdBoeuf.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    const blocks = [blockPression50, blockCdBoeuf]
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      // "locator" de la commande
      const loc = page.locator('.com-conteneur', { hasText: block.ref })
      // fond de la commande grisé
      await expect(loc).toHaveCSS('opacity', '0.5')

      // articles
      for (let j = 0; j < block.articles.length; j++) {
        const article = block.articles[j]
        // locator ligne
        const locLine = loc.locator('.com-article-ligne', { hasText: article.nom })
        // le nombre articles sélectioné présent
        await expect(locLine.locator('.com-article-infos .test-return-reste-servir-modifier', { hasText: '0' })).toBeVisible()
        // quantité article présente
        await expect(locLine.locator('.com-article-infos .test-return-rest-serve-qty', { hasText: '0' })).toBeVisible()
        // nom article présent
        await expect(locLine.locator('.com-article-infos .test-return-rest-serve-name', { hasText: article.nom })).toBeVisible()
      }
    }

    // cliquer sur bt grille de la commande incluant l'article 'CdBoeuf'
    await locCdBoeuf.locator('.test-return-icon-grid').click()

    // Cliquer bt "SUPPRIMER ARTICLE(S)"
    await locCdBoeuf.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // le message "Aucun article" présent
    await expect(page.locator('#popup-cashless .test-return-msg-about-article', { hasText: noArticleCapitalizeTrans })).toBeVisible()
    // le message "n'a été selectioné" présent
    await expect(page.locator('#popup-cashless .test-return-msg-about-article', { hasText: hasBeenSelectedTrans })).toBeVisible()

    await page.close()
  })
})