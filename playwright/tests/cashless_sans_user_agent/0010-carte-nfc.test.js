// cashless_demo1.env DEBUG=1 / DEMO=1 / language = fr
import { test, expect } from '@playwright/test'
import { connectionAdmin, resetCardCashless, creditCardCashless, getTranslate, getBackGroundColor } from '../../mesModules/commun.js'
import { env } from '../../mesModules/env.js'


// attention la taille d'écran choisie affiche le menu burger
let page, currencySymbol, transaction, ok, total, cardTrans, returnTrans
test.use({
  viewport: { width: 550, height: 1000 },
  ignoreHTTPSErrors: true
})

test.describe("Cashless, carte client 1", () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connectionAdmin(page)

    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // obtenir les traductions qui seront utilisées
    currencySymbol = await getTranslate(page, 'currencySymbol')
    transaction = await getTranslate(page, 'transaction', 'capitalize')
    ok = await getTranslate(page, 'ok')
    total = await getTranslate(page, 'total', 'capitalize')
    cardTrans = await getTranslate(page, 'card')
    returnTrans = await getTranslate(page, 'return', 'uppercase')
  })

  test("Check carte client 1, tests : bouton retour + sur carte = 0 + cotisation", async () => {
    // vidage carte client1
    await resetCardCashless(page, 'nfc-client1')

    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // attente affichage "Attente lecture carte"
    const msgAwaitingCard = await getTranslate(page, 'awaitingCardReading', 'capitalize')
    await expect(page.locator('#popup-cashless', { hasText: msgAwaitingCard })).toBeVisible()

    const returnTrans = await getTranslate(page, 'return', 'uppercase')
    // #popup-retour visible
    await expect(page.locator('#popup-retour', { hasText: returnTrans })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // 0 sur carte
    const onTrans = await getTranslate(page, 'on', 'capitalize')
    await expect(page.locator('.test-return-total-card', { hasText: onTrans + ' ' + cardTrans + ' : 0 ' + currencySymbol })).toBeVisible()

    // TODO: à traduire "Aucune cotisation"
    await expect(page.locator('.test-return-contribution')).toHaveText('Aucune cotisation')

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()
  })

  test("Retour carte client 1 crédité de 40 et 10 cadeaux en cb", async () => {
    // 4 *10 + 2 * 5
    await creditCardCashless(page, 'nfc-client1', 4, 2, 'cb')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getBackGroundColor(page, '#popup-cashless')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transaction + ' ' + ok })).toBeVisible()

    // total cb
    const monnaie = await getTranslate(page, 'cb')
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${total}(${monnaie}) 40.00 ${currencySymbol}` })).toBeVisible()

    // total crédité sur carte
    await expect(page.locator('#popup-cashless .test-return-total-carte'), { hasText: `ROBOCOP - ${cardTrans} 50 ${currencySymbol}` }).toBeVisible()

    // crédit du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-le', { hasText: `- TestCoin : 40 ${currencySymbol}` })).toBeVisible()

    // crédit cadeau du lieu
    await expect(page.locator('#popup-cashless .test-return-monnaie-lg', { hasText: `- TestCoin Cadeau : 10 ${currencySymbol}` })).toBeVisible()

    // Clique bt "RETOUR"
    await page.locator(`#popup-retour div:has-text("${returnTrans}")`).first().click()
  })

  test("Retour carte client 1 crédité de 10 en espece: somme donnée 10", async () => {
    // 4 *10 +  0* 5 -- somme donné 10
    await creditCardCashless(page, 'nfc-client1', 1, 0, 'espece', 10)

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // fond d'écran =  'rgb(51, 148, 72)'
    const backGroundColor = await getBackGroundColor(page, '#popup-cashless')
    expect(backGroundColor).toEqual('rgb(51, 148, 72)')

    // 'Transaction ok' est affiché
    await expect(page.locator('.test-return-title-content', { hasText: transaction + ' ' + ok })).toBeVisible()

    await page.pause()
    // total espèce
    const monnaie = await getTranslate(page, 'cash')
    await expect(page.locator('#popup-cashless .test-return-total-achats', { hasText: `${total}(${monnaie}) 10.00 ${currencySymbol}` })).toBeVisible()



    // total crédité sur carte
    await expect(page.locator('.test-return-total-carte')).toHaveText('TEST - carte 60 €')

    // cadeau crédité
    await expect(page.locator('.test-return-monnaie-lg')).toHaveText('- TestCoin Cadeau : 10 €')

    // cashless crédité
    await expect(page.locator('.test-return-monnaie-le')).toHaveText('- TestCoin : 50 €')

    // somme donnée
    await expect(page.locator('.test-return-given-sum')).toHaveText('somme donnée 10 €')

    // monnaie à rendre
    await expect(page.locator('.test-return-change')).toHaveText('Monnaie à rendre 0 €')

    // Clique bouton "RETOUR"
    await page.locator('#popup-retour div:has-text("RETOUR")').first().click()
  })

  test("Retour carte client 1 crédité de 10 en espece: somme donnée 50", async () => {
    // 4 *10 +  0* 5 -- somme donné 10
    await creditCardCashless(page, 'nfc-client1', 1, 0, 'espece', '50')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Transaction OK !
    await expect(page.locator('.test-return-title-content')).toHaveText('Transaction ok')

    // total espèce
    await expect(page.locator('.test-return-total-achats')).toHaveText('Total(espèce) 10.00 €')

    // total crédité sur carte
    await expect(page.locator('.test-return-total-carte')).toHaveText('TEST - carte 70 €')

    // cadeau crédité
    await expect(page.locator('.test-return-monnaie-lg')).toHaveText('- TestCoin Cadeau : 10 €')

    // cashless crédité
    await expect(page.locator('.test-return-monnaie-le')).toHaveText('- TestCoin : 60 €')

    // somme donnée
    await expect(page.locator('.test-return-given-sum')).toHaveText('somme donnée 50 €')

    // monnaie à rendre
    await expect(page.locator('.test-return-change')).toHaveText('Monnaie à rendre 40 €')

    // Clique bouton "RETOUR"
    await page.locator('#popup-retour div:has-text("RETOUR")').first().click()

    await page.close()
  })
})