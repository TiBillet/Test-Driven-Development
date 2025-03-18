// cashless_demo1.env DEBUG=True / DEMO=True / language = en
import { test, devices, expect } from '@playwright/test'
import {
  connection, changeLanguage, goPointSale, selectArticles, checkBillDirectService, getStyleValue, getTranslate,
  newOrderIsShow, goTableOrder, articlesListIsVisible, bigToFloat, totalListeArticles, checkAlreadyPaidBill, getEntity
} from '../../mesModules/commun.js'
import { env } from '../../mesModules/env.js'

let page, selTableTrans, totalUppercaseTrans, currencySymbolTrans, returnTrans, transactionTrans, okTrans
let sendPrepaTrans, articlesTrans, allTrans, valueTrans, prepaTrans, shortcutPrepaTrans, transO, transS
let transP, transSP, transCA, additionCapitalizeTrans, paiementTypeTrans, confirmPaymentTrans, showTableOrdersTrans
const language = "en"
const listeArticles = [
  { nom: "Pression 33", nb: 2, prix: 2 },
  { nom: "CdBoeuf", nb: 1, prix: 25 },
  { nom: "Gateau", nb: 1, prix: 8 }
]

// attention la taille d'écran choisie affiche le menu burger
test.use({ viewport: { width: 550, height: 1000 }, ignoreHTTPSErrors: true })

test.describe("Commandes", () => {
  test("Connexion", async ({ browser }) => {
    page = await browser.newPage()
    await connection(page)

    // dev changer de langue
    await changeLanguage(page, language)

    // obtenir les traductions pour ce test et tous les autres
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    selTableTrans = await getTranslate(page, 'selectTable', 'capitalize')
    totalUppercaseTrans = await getTranslate(page, 'total', 'uppercase')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    sendPrepaTrans = await getTranslate(page, 'sentInPreparation', 'capitalize')
    articlesTrans = await getTranslate(page, 'articles', 'capitalize')
    allTrans = await getTranslate(page, 'all', 'capitalize')
    valueTrans = await getTranslate(page, 'value', 'capitalize')
    prepaTrans = await getTranslate(page, 'preparations', 'capitalize')
    shortcutPrepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    transO = await getTranslate(page, 'notServedUnpaidOrder', 'capitalize')
    transS = await getTranslate(page, 'servedUnpaidOrder', 'capitalize')
    transP = await getTranslate(page, 'notServedPaidOrder', 'capitalize')
    transSP = await getTranslate(page, 'servedPaidOrder', 'capitalize')
    transCA = await getTranslate(page, 'cancelledOrder', 'capitalize')
    additionCapitalizeTrans = await getTranslate(page, 'addition', 'capitalize')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    showTableOrdersTrans = await getTranslate(page, 'displayCommandsTable', 'capitalize')
  })

  test("PV Resto, status : 11 tables minimum dont la table éphémère.", async () => {
    // aller au point de vente RESTO
    await goPointSale(page, 'RESTO')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // Attente liste tables pour sélection
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: `${selTableTrans} : Resto` })).toBeVisible()

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // au moins, 11 tables présentes
    const nbTables = await page.evaluate(async () => {
      // dev enlève la première table
      // document.querySelector('#tables-liste div[class~="table-bouton"]').remove()
      const liste = document.querySelectorAll('#tables-liste div[class~="table-bouton"]').length
      return liste >= 11 ? true : false
    })
    await expect(nbTables).toEqual(true)
  })

  test('PV = resto, addition vide.', async () => {
    // sélectionne la première table
    await page.locator('#tables-liste .table-bouton', { hasText: 'S01' }).click()

    // nouvelle commande de la salle Ex04 du point de vente RESTO est affichée
    await newOrderIsShow(page, 'S01', 'Resto')

    // addition vide
    await expect(page.locator('#achats-liste')).toBeEmpty()

    // total addition = 0
    await expect(page.locator('#bt-valider-total', { hasText: `${totalUppercaseTrans} 0 ${currencySymbolTrans}` })).toBeVisible()
  })

  test('Liste addition conforme + bouton retour ok + validation achats.', async () => {
    // sélection des articles
    await selectArticles(page, listeArticles, "Resto")

    // l'addition est conforme à la sélection
    await checkBillDirectService(page, listeArticles)

    // valider commande
    await page.locator('#bt-valider').click()

    // bouton RETOUR visible
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // Clique BOUTON RETOUR
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()

    // Retour sur la commande S01
    await newOrderIsShow(page, 'S01', 'Resto')

    // valider commande
    await page.locator('#bt-valider').click()
  })

  test(`Présence des différents types d'envois en préparation + validation "ENVOYER EN PREPARATIONS"`, async () => {
    // ENVOYER EN PREPARATION
    await expect(page.locator('#popup-cashless #test-prepa1')).toBeVisible()

    // ENVOYER EN PREPARATION ET PAYER EN UNE SEULE FOIS
    await expect(page.locator('#popup-cashless #test-prepa2')).toBeVisible()

    // ENVOYER EN PREPARATION ET ALLER A LA PAGE PAIEMENT
    await expect(page.locator('#popup-cashless #test-prepa3')).toBeVisible()

    // clique sur "ENVOYER EN PREPARATION"
    await page.locator('#popup-cashless #test-prepa1').click()
  })

  test("Retour de l'envoi en préparation.", async () => {
    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    let backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // Envoyée en préparation.
    await expect(page.locator('.test-return-msg-prepa', { hasText: sendPrepaTrans })).toBeVisible()

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // visuel table1 à une commande/préparation = 'rgb(255, 0, 0)'
    backGroundColor = await getStyleValue(page, '#tables-liste div[data-id-table="1"] .table-etat', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(255, 0, 0)')
  })

  test('Etat commande table S01 (non payée).', async () => {
    // Aller à la table S01
    await goTableOrder(page, 'S01')

    // attente affichage de la commande
    await page.locator('.navbar-horizontal .titre-vue', { hasText: `${articlesTrans} S01` }).waitFor({ state: 'visible' })

    //bouton Tout, Valeur et Prépara. présents
    await expect(page.locator(`#commandes-table-menu div >> text=${allTrans}`)).toBeVisible()
    await expect(page.locator(`#commandes-table-menu div >> text=${valueTrans}`)).toBeVisible()
    await expect(page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`)).toBeVisible()

    // Liste d'articles complète
    await articlesListIsVisible(page, listeArticles)

    // clique bt "Adition"
    await page.locator(`#commandes-table-menu div >> text=${additionCapitalizeTrans}`).click()

    // Déjà payé vide
    await expect(page.locator('#addition-liste-deja-paye')).toBeEmpty()

    // Addition vide
    await expect(page.locator('#addition-liste')).toBeEmpty()

    // total de "reste à payer" = 37
    const resteApayer = bigToFloat(totalListeArticles(listeArticles)).toString() + currencySymbolTrans
    console.log('resteApayer =', resteApayer);
    await expect(page.locator('#addition-reste-a-payer', { hasText: resteApayer })).toBeVisible()
  })

  test('Etat page préparation = "Non servie - Non payée" pour la table S01.', async () => {
    // Clique sur "Prépara." et attend le retour des préparations pour la table S01
    const [response] = await Promise.all([
      page.waitForResponse(env.domain + 'wv/preparation/1'),
      page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()
    ])
    // statut serveur
    const status = response.status()
    expect(status).toEqual(200)

    // données de la commande pour les lieux de préparation
    const retour = await response.json()

    // titre = "Préparations"
    await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: prepaTrans })).toBeVisible()

    // traduction statu des commandes
    let statutLisible = { "O": transO, "S": transS, "P": transP, "SP": transSP, "CA": transCA }

    // tous les articles sont présents
    for (let i = 0; i < retour.length; i++) {
      const lieuPrepa = retour[i]

      const commandes = lieuPrepa.commandes

      for (const commandesKey in commandes) {
        const commande = commandes[commandesKey]
        const isoTime = new Date(commande.datetime)
        // heure
        const heureTab = (commande.datetime.split('T')[1]).split(':')
        const heure = heureTab[0] + ':' + heureTab[1]

        // nom de la table
        const tableName = commande.table_name

        // articles [ {.article.name, .qty, .reste_a_payer, .reste_a_servir } ...]
        const articles = commande.articles
        for (let j = 0; j < articles.length; j++) {
          const article = articles[j]
          // nom de l'article
          const nomArticle = article.article.name

          // nombre d'articles
          const nombreArticles = bigToFloat(article.qty).toString()

          // pour chaque lieu de préparation (cuisine, bar, ...) tester une fois seulement la présence(visibilitée) de éléments si-dessous dans le bloque
          if (j === 0) {
            // prendre une capture d'écran, fonctionne aussi en tests non visuels
            await page.screenshot({ path: 'prepa-' + j + '.png', fullPage: true })
            // vérifeir l'affichage de l'heure
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-time-value', { hasText: heure })).toBeVisible()

            // lieu de préparation
            await expect(page.locator('.com-conteneur .test-ref-preparation-place', { hasText: lieuPrepa.name })).toBeVisible()

            // nom de table
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-table-name', { hasText: tableName })).toBeVisible()

            // statut préparation
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-status-order', { hasText: statutLisible.O })).toBeVisible()

            // bt valider
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.com-articles-valider-conteneur .com-articles-valider .com-bt-valider-normal i[class="fas fa-check"]')).toBeVisible()
          }

          // présence du nombre d'article à servir
          await expect(page.locator('.com-article-infos', { hasText: nomArticle }).locator('.test-return-rest-serve-qty', { hasText: nombreArticles })).toBeVisible()

          // présence du nom de l'article
          await expect(page.locator('.com-article-infos', { hasText: nomArticle }).locator('.test-return-rest-serve-name', { hasText: nomArticle })).toBeVisible()
        }
      }
    }
  })

  test('Préparation table S01, 2 commandes, valider une commande(CdBoeuf et Gateau); status: non servie et non payé  ', async () => {
    // valider la préparation de la commande contenant 'CdBoeuf' et attend le retour des préparations
    const [response] = await Promise.all([
      page.waitForResponse(env.domain + 'wv/preparation'),
      page.locator('.com-conteneur', { hasText: 'CdBoeuf' }).locator('.test-action-validate-prepa').click()
    ])

    // "locator" de la commande validé contenant 'CdBoeuf'
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: 'CdBoeuf' })
    // fond de la commande contenant 'CdBoeuf' grisé
    await expect(locCdBoeuf).toHaveCSS('opacity', '0.5')
    // non servie - non payé pour la commande contenant  'CdBoeuf'
    await expect(locCdBoeuf.locator('.test-ref-status-order', { hasText: transO })).toBeVisible()
    // plus de bouton valider pour la commande contenant  'CdBoeuf'
    await expect(locCdBoeuf.locator('.test-action-validate-prepa')).not.toBeVisible()

    // "locator" de la commande validé contenant 'Pression 33'
    const locPression33 = page.locator('.com-conteneur', { hasText: 'Pression 33' })
    // fond de la commande contenant 'Pression 33' non grisé
    await expect(locPression33).not.toHaveCSS('opacity', '0.5')
  })


  test('Préparation table S01, 2 commandes, valider la  2ème commande(Pression 33); status: servie et non payé  ', async () => {
    // valider la préparation de la commande contenant 'Pression 33' et attend le retour des préparations
    const [response] = await Promise.all([
      page.waitForResponse(env.domain + 'wv/preparation'),
      page.locator('.com-conteneur', { hasText: 'Pression 33' }).locator('.test-action-validate-prepa').click()
    ])

    // "locator" de la commande validé contenant 'Pression 33'
    const locPression33 = page.locator('.com-conteneur', { hasText: 'Pression 33' })

    // fond de la commande contenant 'Pression 33' grisé
    await expect(locPression33).toHaveCSS('opacity', '0.5')

    // servie - non payé pour la commande contenant  'Pression 33'
    await expect(locPression33.locator('.test-ref-status-order', { hasText: transS })).toBeVisible()

    // plus de bouton valider pour la commande contenant  'Pression 33'
    await expect(locPression33.locator('.test-action-validate-prepa')).not.toBeVisible()

  })

  test('Commande table S01, payer les 2 "Pression 33"', async () => {
    // Aller à la table S01
    await goTableOrder(page, 'S01')
    // sélectionner les 2 Pression 33
    await page.locator('.bouton-commande-article[data-nom="Pression 33"]').click({ clickCount: 2 })

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

    // retour
    await page.locator('#popup-retour').click()

    // clique bt "Adition" -> aller dans l'addition
    await page.locator(`#commandes-table-menu div >> text=${additionCapitalizeTrans}`).click()


    // 2 pression 33 bien présentes dans l'addition
    const listeArticlesDejaPayes = [{ nom: "Pression 33", nb: 2, prix: 2 }]
    await checkAlreadyPaidBill(page, listeArticlesDejaPayes)

    // reste à payer 33€
    await expect(page.locator('#addition-reste-a-payer', { hasText: `33${currencySymbolTrans}` })).toBeVisible()
  })

  test('Commande table S01, payer les 2 "Pression 33"; status: servie et non payé ', async () => {
    // Aller à la table S01
    await goTableOrder(page, 'S01')

    // Clique sur "Prépara." et attend le retour des préparations pour la table S01
    const [response] = await Promise.all([
      page.waitForResponse(env.domain + 'wv/preparation/1'),
      page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()
    ])

    // "locator" de la commande validé contenant 'CdBoeuf'
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: 'CdBoeuf' })

    // servie - non payé pour la commande contenant  'CdBoeuf'
    await expect(locCdBoeuf.locator('.test-ref-status-order', { hasText: transS })).toBeVisible()

    // fond de la commande contenant 'CdBoeuf' grisé
    await expect(locCdBoeuf).toHaveCSS('opacity', '0.5')

    // "locator" de la commande validé contenant 'Pression 33'
    const locPression33 = page.locator('.com-conteneur', { hasText: 'Pression 33' })

    // servie - non payé pour la commande contenant  'Pression 33'
    await expect(locPression33.locator('.test-ref-status-order', { hasText: transS })).toBeVisible()

    // fond de la commande contenant 'Pression 33' grisé
    await expect(locPression33).toHaveCSS('opacity', '0.5')
  })

  test('Commande table S01, payer tout le reste', async () => {
    // Aller à la table S01
    await goTableOrder(page, 'S01')

    // clique bouton Tout, payer le reste
    await page.locator(`#commandes-table-menu div >> text=${allTrans}`).click()

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

    // retour commande 
    await page.locator('#popup-retour').click()
  })


  test('Préparation table S01, status: servie et payé', async () => {
    // Aller à la table S01
    await goTableOrder(page, 'S01')

    // Clique sur "Prépara." et attend le retour des préparations pour la table S01
    const [response] = await Promise.all([
      page.waitForResponse(env.domain + 'wv/preparation/1'),
      page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()
    ])

    // "locator" de la commande validé contenant 'CdBoeuf'
    const locCdBoeuf = page.locator('.com-conteneur', { hasText: 'CdBoeuf' })
    // servie - payé pour la commande contenant  'CdBoeuf'
    await expect(locCdBoeuf.locator('.test-ref-status-order', { hasText: transSP })).toBeVisible()
    // fond de la commande contenant 'CdBoeuf' grisé
    await expect(locCdBoeuf).toHaveCSS('opacity', '0.5')


    // "locator" de la commande validé contenant 'Pression 33'
    const locPression33 = page.locator('.com-conteneur', { hasText: 'Pression 33' })
    // servie - payé pour la commande contenant  'Pression 33'
    await expect(locPression33.locator('.test-ref-status-order', { hasText: transSP })).toBeVisible()
    // fond de la commande contenant 'Pression 33' grisé
    await expect(locPression33).toHaveCSS('opacity', '0.5')
  })

  test('Table S01 libre', async () => {
    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    // Clique sur le menu TABLES
    await page.locator('text=TABLES').click()

    // attente affichage des tables
    await page.locator('.navbar-horizontal .titre-vue', { hasText: showTableOrdersTrans }).waitFor({ state: 'visible' })

    // table S01 libre = 'rgb(57, 232, 10)'
    const backGroundColor = await getStyleValue(page, '#tables-liste div[data-id-table="1"] .table-etat', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(57, 232, 10)')

    await page.close()
  })

})