// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, newOrderIsShow, selectArticles, getTranslate, managerMode,
  goTableOrder, getEntity
} from '../../mesModules/commun.js'

// attention la taille d'écran choisie affiche le menu burger
let page
const language = "en"
let articles, additionCapitalizeTrans, currencySymbolTrans, shortcutPrepaTrans, preparationsCapitalizeTrans
let transO, deleteArticlesUppercaseTrans, noArticleCapitalizeTrans, hasBeenSelectedTrans
// la liste d'articles
const listeArticles = [{ nom: "Eau 1L", nb: 1, prix: 1.5 }, { nom: "CdBoeuf", nb: 2, prix: 25 }, { nom: "Chimay Rouge", nb: 2, prix: 2.6 }, { nom: "Soft G", nb: 1, prix: 1.5 }]
const blockEau1L = { ref: "Eau 1L", articles: [{ nom: "Eau 1L", nb: 1, prix: 1.5 }, { nom: "Chimay Rouge", nb: 2, prix: 2.6 }, { nom: "Soft G", nb: 1, prix: 1.5 }] }
const blockCdBoeuf = { ref: "CdBoeuf", articles: [{ nom: "CdBoeuf", nb: 2, prix: 25 }] }
const blocks = [blockEau1L, blockCdBoeuf]


test.use({ viewport: { width: 375, height: 800 }, ignoreHTTPSErrors: true })

test.describe('Préparation: supprimer tous les articles en mode gérant, commande "Non Servie - Non Payée".', () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // obtenir les traductions pour ce test et tous les autres
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    articles = await getTranslate(page, 'articles', 'capitalize')
    additionCapitalizeTrans = await getTranslate(page, 'addition', 'capitalize')
    shortcutPrepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    preparationsCapitalizeTrans = await getTranslate(page, 'preparations', 'capitalize')
    transO = await getTranslate(page, 'notServedUnpaidOrder', 'capitalize')
    deleteArticlesUppercaseTrans = await getTranslate(page, 'deleteArticles', 'uppercase')
    noArticleCapitalizeTrans = await getTranslate(page, 'noArticle', 'capitalize')
    hasBeenSelectedTrans = await getTranslate(page, 'hasBeenSelected')
  })

  //
  test('Contexte, une commande "Non Servie - Non Payée"', async ({ browser }) => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // clique table éphémère
    await page.locator('#tables-liste .test-table-ephemere').click()

    // entrer le nom de table "ephemere4"
    await page.locator('#entree-nom-table').fill('ephemere4')

    // valider la création de la table éphémère
    await page.locator('#test-valider-ephemere').click()

    // nouvelle commande de la salle ephe1Payee du point de vente RESTO est affichée
    await newOrderIsShow(page, 'ephemere4', 'Resto')

    // sélection des articles
    await selectArticles(page, listeArticles, "Resto")

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET ALLER A LA PAGE DE PAIEMENT"
    await page.locator('#popup-cashless #test-prepa3').click()

    // attendre page de paiement
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ephemere4' }).waitFor({ state: 'visible' })

    // clique bt "Addition"
    await page.locator(`#commandes-table-menu div >> text=${additionCapitalizeTrans}`).click()

    // non payé - reste à payé = total commande = 58.2Unités
    await expect(page.locator('#addition-reste-a-payer', { hasText: `58.2${currencySymbolTrans}` })).toBeVisible()
    await expect(page.locator('#addition-total-commandes', { hasText: `58.2${currencySymbolTrans}` })).toBeVisible()

    // Clique sur "Prépara." 
    await page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // toutes les commandes sont non servies et non payées
    const locEau1L = page.locator('.com-conteneur', { hasText: blockEau1L.ref })
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: blockCdBoeuf.ref })
    await expect(locEau1L.locator('.test-ref-status-order', { hasText: transO })).toBeVisible()
    await expect(locCdBoeuf.locator('.test-ref-status-order', { hasText: transO })).toBeVisible()

  })
  //

  test('Préparation(table ephemere4), supprimer tous les articles du lieu contenant  "Eau 1L", mode gérant.', async () => {
    // Passage en mode gérant
    await managerMode(page, 'on')

    // Aller à la table ephemere4
    await goTableOrder(page, 'ephemere4')

    // attendre page de paiement
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articles + ' ephemere4' }).waitFor({ state: 'visible' })

    // Clique sur "Prépara." 
    await page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    const locEau1L = page.locator('.com-conteneur', { hasText: blockEau1L.ref })
    // cliquer sur bt grille de la commande incluant l'article "Eau 1L"
    await locEau1L.locator('.test-return-icon-grid').click()

    // Cliquer bt "SUPPRIMER ARTICLE(S)"
    await locEau1L.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // fond de la commande grisé
    await expect(locEau1L).toHaveCSS('opacity', '0.5')
  })

  test('Préparation(table ephemere4), supprimer tous les articles du lieu contenant  "CdBoeuf", mode gérant.', async () => {
    // titre "Préparations" visible
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: preparationsCapitalizeTrans })).toBeVisible()

    // cliquer sur bt grille de la commande incluant l'article 'CdBoeuf'
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: blockCdBoeuf.ref })
    await locCdBoeuf.locator('.test-return-icon-grid').click()

    // Cliquer bt "SUPPRIMER ARTICLE(S)"
    await locCdBoeuf.locator('.test-action-delete-article', { hasText: deleteArticlesUppercaseTrans }).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

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