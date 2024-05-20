// cashless_demo1.env DEBUG=True / DEMO=True / language = fr
import { test, devices, expect } from '@playwright/test'
import {
  connectionAdmin, changeLanguage, goPointSale, selectArticles,
  checkBillDirectService, getBackGroundColor, getTranslate,
  newOrderIsShow, goTableOrder, articlesListIsVisible,
  bigToFloat, totalListeArticles, getLocale
} from '../../mesModules/commun_sua.js'
import { env } from '../../mesModules/env_sua.js'


// attention la taille d'écran choisie affiche le menu burger
let page
const language = "en"
const listeArticles = [
  { nom: "Pression 33", nb: 2, prix: 2 },
  { nom: "CdBoeuf", nb: 1, prix: 25 },
  { nom: "Gateau", nb: 1, prix: 8 }
]

test.use({
  viewport: { width: 375, height: 800 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true
})

test.describe("Commandes", () => {
  test("Connexion", async ({ browser }) => {
    page = await browser.newPage()
    await connectionAdmin(page)

    // dev changer de langue
    await changeLanguage(page, language)
  })
  /*
    test("PV Resto, status : 11 tables minimum dont la table éphémère.", async () => {
      // aller au point de vente RESTO
      await goPointSale(page, 'RESTO')
  
      // attendre fin utilisation réseau
      await page.waitForLoadState('networkidle')
  
      // Attente liste tables pour sélection
      const selTableTrans = await getTranslate(page, 'selectTable', 'capitalize')
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
      // dev, pour casser le test
      //await page.locator('#products div[data-name-pdv="Resto"] bouton-article[nom="Pression 33"]').click()
      await expect(page.locator('#achats-liste')).toBeEmpty()
  
      // total addition = 0
      await expect(page.locator('#bt-valider-total')).toHaveText('TOTAL 0 €')
    })
  
    test('Liste addition conforme + bouton retour ok + validation achats.', async () => {
      // sélection des articles
      await selectArticles(page, listeArticles, "Resto")
  
      // l'addition est conforme à la sélection
      await checkBillDirectService(page, listeArticles)
  
      // valider commande
      await page.locator('#bt-valider').click()
  
      // BOUTON RETOUR
      await expect(page.locator('#popup-cashless #popup-retour')).toBeVisible()
  
      // Clique BOUTON RETOUR
      await page.locator('#popup-cashless #popup-retour').click()
  
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
      let backGroundColor = await getBackGroundColor(page, '#popup-cashless')
      expect(backGroundColor).toEqual('rgb(51, 148, 72)')
  
      // 'Transaction ok' est affiché
      const transaction = await getTranslate(page, 'transaction', 'capitalize')
      const ok = await getTranslate(page, 'ok')
      await expect(page.locator('.test-return-title-content', { hasText: transaction + ' ' + ok })).toBeVisible()
  
      // Envoyée en préparation.
      const sendPrepaTrans = await getTranslate(page, 'sentInPreparation', 'capitalize')
      await expect(page.locator('.test-return-msg-prepa', { hasText: sendPrepaTrans })).toBeVisible()
  
      // sortir de "popup-cashless"
      await page.locator('#popup-retour').click()
  
      // #popup-cashless éffacé
      await expect(page.locator('#popup-cashless')).toBeHidden()
  
      // table éphémère visible
      await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()
  
      // visuel table1 à une commande/préparation = 'rgb(255, 0, 0)'
      backGroundColor = await getBackGroundColor(page, '#tables-liste div[data-id-table="1"] .table-etat')
      expect(backGroundColor).toEqual('rgb(255, 0, 0)')
  
    })
  */
  test('Etat commande table S01 (non payée).', async () => {
    // Aller à la table S01
    await goTableOrder(page, 'S01')

    // attente affichage de la commande
    const titleTrans = `${await getTranslate(page, 'articles', 'capitalize')} S01`
    await page.locator('.navbar-horizontal .titre-vue', { hasText: titleTrans }).waitFor({ state: 'visible' })

    //bouton Tout, Valeur et Prépara. présents
    const allTrans = await getTranslate(page, 'all', 'capitalize')
    const valueTrans = await getTranslate(page, 'value', 'capitalize')
    const prepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    await expect(page.locator(`#commandes-table-menu div >> text=${allTrans}`)).toBeVisible()
    await expect(page.locator(`#commandes-table-menu div >> text=${valueTrans}`)).toBeVisible()
    await expect(page.locator(`#commandes-table-menu div >> text=${prepaTrans}`)).toBeVisible()

    // Liste d'articles complète
    await articlesListIsVisible(page, listeArticles)

    // Déjà payé vide
    await expect(page.locator('#addition-liste-deja-paye')).toBeEmpty()

    // Addition vide
    await expect(page.locator('#addition-liste')).toBeEmpty()

    // total de "reste à payer" = 37
    const typeMonnaie = await getTranslate(page, 'currencySymbol')
    const resteApayer = bigToFloat(totalListeArticles(listeArticles)).toString() + typeMonnaie
    await expect(page.locator('#addition-reste-a-payer')).toHaveText(resteApayer)
  })

  test('Etat page préparation = "Non servie - Non payée" pour la table S01.', async () => {
    // Clique sur "Prépara." et attend le retour des préparations pour la table S01
    const shortcutPrepaTrans = await getTranslate(page, 'shortcutPreparation', 'capitalize')
    const [response] = await Promise.all([
      page.waitForResponse(env.domain + 'wv/preparation/1'),
      page.locator(`#commandes-table-menu div >> text=${shortcutPrepaTrans}`).click()
    ])

    // statut serveur
    const status = response.status()
    expect(status).toEqual(200)

    // données de la commande pour les lieux de préparation
    const retour = await response.json()

    // get locale
    const locale = await getLocale(page)
    await page.pause()

    // titre = "Préparations"
    const prepaTrans = await getTranslate(page, 'preparations', 'capitalize')
    await expect(page.locator('.navbar-horizontal .titre-vue')).toHaveText(prepaTrans)

    // traduction statu des commandes
    const transO = await getTranslate(page, 'notServedUnpaidOrder', 'capitalize')
    const transS = await getTranslate(page, 'servedUnpaidOrder', 'capitalize')
    const transP = await getTranslate(page, 'notServedPaidOrder', 'capitalize')
    const transSP = await getTranslate(page, 'servedPaidOrder', 'capitalize')
    const transCA = await getTranslate(page, 'cancelledOrder', 'capitalize')
    let statutLisible = { "O": transO, "S": transS, "P": transP, "SP": transSP, "CA": transCA }
  

    // tous les articles sont présents
    for (let i = 0; i < retour.length; i++) {
      const lieuPrepa = retour[i]
      const commandes = lieuPrepa.commandes

      for (const commandesKey in commandes) {
        const commande = commandes[commandesKey]
        const isoTime = new Date(commande.datetime)

        // heure
        const heureTab = (new Date(commande.datetime)).toLocaleTimeString(locale, { hour12: false }).split(':')
        const heure = heureTab[0] + ':' + heureTab[1]

        // numero_du_ticket_imprime
        let infoTicket = ''
        for (const [pos, nombre] of Object.entries(commande.numero_du_ticket_imprime)) {
          infoTicket = pos + ' ' + nombre
        }

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
            // vérifeir l'affichage de l'heure
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-time-value', { hasText: heure })).toBeVisible()

            // lieu de préparation
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-location', { hasText: infoTicket })).toBeVisible()

            // nom de table
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-table-name', { hasText: tableName })).toBeVisible()

            // statut préparation
            console.log('statutLisible.O =', statutLisible.O);
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.test-ref-status-order', { hasText: statutLisible.O })).toBeVisible()

            // bt valider
            await expect(page.locator('.com-conteneur', { hasText: nomArticle }).locator('.com-articles-valider-conteneur .com-articles-valider .com-bt-valider-normal i[class="fas fa-check"]')).toBeVisible()
          }

          // présence du nombre d'article à servir
          await expect(page.locator('.com-article-infos', { hasText: nomArticle }).locator('.test-rest-serve-qty', { hasText: nombreArticles })).toBeVisible()

          // présence du nom de l'article
          await expect(page.locator('.com-article-infos', { hasText: nomArticle }).locator('.test-rest-serve-name', { hasText: nomArticle })).toBeVisible()
        }
      }
    }


  })

  test('Préparation table S01, valider "CdBoeuf et Gateau".', async () => {

  })

  test('Etat de la commande de la table S01(articles servis) et payer le reste.', async () => {

  })

  test('Préparations, état, table S01 servie et payée.', async () => {

  })

  test('Fin', async () => {
    await page.pause()
    await page.close()
  })

})