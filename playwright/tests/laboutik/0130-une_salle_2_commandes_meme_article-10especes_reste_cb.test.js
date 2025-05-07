// chargement des variables d'environnement (.env)
import * as dotenv from 'dotenv'
const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

// DEBUG=1 / DEMO=1 / language = en
import { test, expect } from '@playwright/test'
import {
  connection, getTranslate, changeLanguage, goPointSale, newOrderIsShow, getStyleValue, confirmation,
  getEntity, fakeUserAgent
} from '../../mesModules/commun.js'

let page
let transactionTrans, okTrans, articlesTrans, sumTrans, validateTrans, cashTrans, paiementTypeTrans
let totalUppercaseTrans, cashLowerTrans, currencySymbolTrans
const language = "en"

// attention la taille d'écran choisie affiche le menu burger
test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true,
  userAgent: fakeUserAgent
})

test.describe("Test valeur fractionnée", () => {
  test("Salle identique, 2 commandes même article, payé une fois 10 espèces puis le tout en cb.", async ({ browser }) => {
    page = await browser.newPage()

    await connection(page)

    // changer de langue
    await changeLanguage(page, language)

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // obtenir les traductions pour ce test et tous les autres
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    currencySymbolTrans = await getEntity(page, currencySymbolTransTempo)
    transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
    okTrans = await getTranslate(page, 'ok')
    articlesTrans = await getTranslate(page, 'articles', 'capitalize')
    sumTrans = await getTranslate(page, 'sum', 'capitalize')
    validateTrans = await getTranslate(page, 'validate', 'uppercase')
    cashTrans = await getTranslate(page, 'cash', 'uppercase')
    cashLowerTrans = await getTranslate(page, 'cash')
    paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    totalUppercaseTrans = await getTranslate(page, 'total', 'uppercase')

    // aller au point de vente "Resto"
    await goPointSale(page, 'Resto')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // clique table éphémère
    await page.locator('#tables-liste .test-table-ephemere').click()

    // entrer le nom de table "ephemere5"
    await page.locator('#entree-nom-table').fill('ephemere5')

    // valider la création de la table éphémère
    await page.locator('#test-valider-ephemere').click()

    // nouvelle commande de la salle ephe1Payee du point de vente RESTO est affichée
    await newOrderIsShow(page, 'ephemere5', 'Resto')

    // sélectione article "Gateau"
    await page.locator(`#products div[data-name-pdv="Resto"] bouton-article[nom="Gateau"]`).click()

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION"
    await page.locator('#popup-cashless #test-prepa1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    let backGroundColor = await getStyleValue(page, '#popup-cashless', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // table éphémère visible
    await expect(page.locator('#tables-liste .test-table-ephemere')).toBeVisible()

    // sélectionne la table ephemere5
    await page.locator('#tables-liste .table-bouton', { hasText: 'ephemere5' }).click()

    // nouvelle commande de la salle ephe1Payee du point de vente RESTO est affichée
    await newOrderIsShow(page, 'ephemere5', 'Resto')

    // sélectione article "Gateau"
    await page.locator(`#products div[data-name-pdv="Resto"] bouton-article[nom="Gateau"]`).click()

    // valider commande
    await page.locator('#bt-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // clique sur "ENVOYER EN PREPARATION ET ALLER A LA PAGE PAIEMENT"
    await page.locator('#popup-cashless #test-prepa3').click()

    // attendre page de paiement
    await page.locator('.navbar-horizontal .titre-vue', { hasText: articlesTrans + ' ephemere5' }).waitFor({ state: 'visible' })

    // clique bouton "valeur"
    await page.locator('#commandes-table-menu div[onclick="restau.demanderValeurAdditionFractionnee()"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // popup avec le titre "Somme"
    await expect(page.locator('#popup-cashless h1', { hasText: sumTrans })).toBeVisible()

    // entrer la valeur '10'
    await page.locator('#addition-fractionnee').fill('10')

    // cliquer bouton "VALIDER"
    await page.locator('#popup-cashless bouton-basique', { hasText: validateTrans }).click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // moyens de paiement visible
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // paiement en espèces - CASH TOTAL 10 Unités
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cash"]').click()

    // confirmation espèce
    await confirmation(page, 'espece', 10)

    // VALIDER
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor2 = await page.evaluate(async () => {
      return document.querySelector('#popup-cashless').style.backgroundColor
    })
    expect(backGroundColor2).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // total commande "cash" 10.00 Unités
    await expect(page.locator('#popup-cashless .popup-msg1', { hasText: `Total (${cashTrans}) 10.00 ${currencySymbolTrans}` })).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // clique bouton "Tous"
    await page.locator('#commandes-table-menu div[onclick="restau.ajouterTousArticlesAddition()"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // moyens de paiement visible
    await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

    // paiement CB TOTAL 6 Unités
    await page.locator('#popup-cashless div[class="paiement-bt-container test-ref-cb"]').click()

    // confirmation espèce
    await confirmation(page, 'cb')

    // VALIDER
    await page.locator('#popup-confirme-valider').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor3 = await page.evaluate(async () => {
      return document.querySelector('#popup-cashless').style.backgroundColor
    })
    expect(backGroundColor3).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: 'Transaction ok' })).toBeVisible()

    // total commande cb 6.00 Unités
    await expect(page.locator('#popup-cashless .popup-msg1', { hasText: `Total (cb) 6.00 ${currencySymbolTrans}` })).toBeVisible()

    // cliquer bouton "RETOUR"
    await page.locator('#popup-cashless #popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // total de "reste à payer"
    await expect(page.locator('#addition-reste-a-payer')).toHaveText('0' + currencySymbolTrans)

    await page.close()
  })

  test("Même salle, 2 commandes, paiement fractionné 10=cash/6=cb.", async ({ browser }) => {
    page = await browser.newPage()
    await page.goto(process.env.LABOUTIK_URL)

    // permet d'attendre une fin de redirection
    await page.waitForLoadState('networkidle')

    // 2 cliques sur menu burger
    await page.locator('a[class="sidebar-header-menu sidebar-toggle"]').dblclick()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // aller menu ventes
    await page.locator('.sidebar-section a[href="/adminstaff/APIcashless/articlevendu/"]').click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // le paiement fractionné de 10,00 est en espèce et celui de 6,00 est en cb
    const tests = [{ paiementType: 'Carte bancaire', qty: '6,00' }, { paiementType: 'Espece', qty: '10,00' }]
    const list = page.locator('tr', { hasText: 'Paiement Fractionné' })
    for (let i = 0; i < tests.length; i++) {
      const item = tests[i];
      await expect(list.filter({ hasText: item.qty }).filter({ hasText: item.paiementType })).toBeVisible()
    }
    await page.close()
  })

})
