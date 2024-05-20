// cashless_demo1.env DEBUG=1 / DEMO=1 / language = fr
import { test, expect } from '@playwright/test'
import { connectionAdmin, resetCardCashless, creditCardCashless } from '../../mesModules/commun_sua.js'
import { env } from '../../mesModules/env_sua.js'


// attention la taille d'écran choisie affiche le menu burger
let page
test.use({ 
  viewport: { width: 550, height: 1300 },
  ignoreHTTPSErrors: true
 })

test.describe("Cashless, carte client 1", () => {
  test("Connection", async ({ browser }) => {
    page = await browser.newPage()
    await connectionAdmin(page)
  })

  test("Contexte: vidage", async () => {
    // vidage carte client1
    await resetCardCashless(page, 'nfc-client1')

    // Vidage carte OK !
    await expect(page.locator('#popup-cashless .test-return-reset', { hasText: 'Vidage carte OK' })).toBeVisible()

    // clique sur bouton "RETOUR"
    await page.locator('#popup-retour').click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()
  })

  test("Check carte client 1, tests : bouton retour + sur carte = 0 + cotisation", async () => {
    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div:has-text("CHECK CARTE")').first().click()

    // text=Attente lecture carte visible
    // await page.locator('div[role="status"][aria-label="awaiting card reading"]', { hasText: 'Attente lecture carte' }).click() //).toBeVisible()
    await expect(page.getByRole('status', { name: 'awaiting card reading' })).toHaveText('Attentelecture carte')

    // #popup-retour visible
    await expect(page.locator('#popup-retour')).toBeVisible()

    // Click #popup-retour div:has-text("RETOUR") >> nth=0
    await page.locator('#popup-retour div:has-text("RETOUR")').first().click()

    // #popup-cashless éffacé
    await expect(page.locator('#popup-cashless')).toBeHidden()

    // Clique sur le bouton "CHECK CARTE")
    await page.locator('#page-commandes-footer div:has-text("CHECK CARTE")').first().click()

    // cliquer sur carte nfc simulée
    await page.locator('#nfc-client1').click()

    // 0 sur carte
    await expect(page.locator('.test-return-total-card')).toHaveText('Sur carte : 0 €')

    // pas de cotisation
    await expect(page.locator('.test-return-contribution')).toHaveText('Aucune cotisation')

    // Click #popup-retour div:has-text("RETOUR") >> nth=0
    await page.locator('#popup-retour div:has-text("RETOUR")').first().click()
  })

  test("Retour carte client 1 crédité de 40 et 10 cadeaux en cb", async () => {
    // 4 *10 + 2 * 5
    await creditCardCashless(page, 'nfc-client1', 4, 2, 'cb')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Transaction OK !
    await expect(page.locator('.test-return-title-content')).toHaveText('Transaction ok')

    // total cb
    await expect(page.locator('.test-return-total-achats')).toHaveText('Total(cb) 40.00 €')

    // total crédité sur carte
    await expect(page.locator('.test-return-total-carte')).toHaveText('TEST - carte 50 €')

    // cadeau crédité
    await expect(page.locator('.test-return-monnaie-lg')).toHaveText('- TestCoin Cadeau : 10 €')
    resetCardCashless
    // Clique bouton "RETOUR"
    await page.locator('#popup-retour div:has-text("RETOUR")').first().click()
  })

  test("Retour carte client 1 crédité de 10 en espece: somme donnée 10", async () => {
    // 4 *10 +  0* 5 -- somme donné 10
    await creditCardCashless(page, 'nfc-client1', 1, 0, 'espece', '10')

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // Transaction OK !
    await expect(page.locator('.test-return-title-content')).toHaveText('Transaction ok')

    // total espèce
    await expect(page.locator('.test-return-total-achats')).toHaveText('Total(espèce) 10.00 €')

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