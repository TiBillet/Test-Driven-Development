// cashless_demo1.env DEBUG=True / DEMO=True / language = fr
import { test, expect } from '@playwright/test'
import { connectionAdmin, goPointSale, selectArticles, checkBillDirectService, setPointSale } from '../../mesModules/commun_sua.js'


// attention la taille d'écran choisie affiche le menu burger
let page
test.use({ viewport: { width: 550, height: 1300 } })

test.describe("Status, service direct,  point de ventes 'BAR 1'", () => {

  test("Contexte: configure le point de vente 'BAR 1' en mode commandes.", async () => {
    await setPointSale('Bar 1', { directService: false, acceptsCash: true, acceptsCb: true, showPrices: true })
  })

  test("BAR 1 est en mode commandes.", async ({ browser }) => {
    page = await browser.newPage()

    await connectionAdmin(page)

    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.titre-vue')).toHaveText('Sélectionner une table : Bar 1')

    // bouton table éphémère
    await expect(page.locator('div[onclick="restau.assignerTableEphemere()"]')).toBeVisible()

    // fermer navigateur
    await page.close()

  })

  test("Contexte: 'BAR 1' en mode service directe, accepte monnaie et cb.", async () => {
    await setPointSale('Bar 1', { directService: true, acceptsCash: true, acceptsCb: true, showPrices: true })
  })

  test("BAR 1 : service directe activé, moyens de paiement présents: monnaie, cb et cashless.", async ({ browser }) => {
    page = await browser.newPage()

    await connectionAdmin(page)

    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.titre-vue')).toHaveText('Service direct -  Bar 1')

    // sélection des articles
    const listeArticles = [{ nom: "Pression 33", nb: 2, prix: 2 }, { nom: "Pression 50", nb: 1, prix: 2.5 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider achats
    await page.locator('#page-commandes-footer div:has-text("VALIDER")').first().click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // moyens de paiement présents
    await expect(page.locator('#popup-cashless bouton-basique >> text=CASHLESS')).toBeVisible()
    await expect(page.locator('#popup-cashless bouton-basique >> text=ESPÈCE')).toBeVisible()
    await expect(page.locator('#popup-cashless bouton-basique >> text=CB')).toBeVisible()
    // bouton retour
    await expect(page.locator('#popup-cashless bouton-basique >> text=RETOUR')).toBeVisible()

    // fermer navigateur
    await page.close()
  })

  test("Contexte: 'BAR 1' en mode service directe, n'accepte pas la monnaie et cb.", async () => {
    await setPointSale('Bar 1', { directService: true, acceptsCash: false, acceptsCb: false, showPrices: true })
  })

  test("BAR 1 : service directe activé, moyens de paiement désactivée: monnaie et cb, cashless présent.", async ({ browser }) => {
    page = await browser.newPage()

    await connectionAdmin(page)

    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre
    await expect(page.locator('.titre-vue')).toHaveText('Service direct -  Bar 1')

    // sélection des articles
    const listeArticles = [{ nom: "Pression 33", nb: 2, prix: 2 }, { nom: "Pression 50", nb: 1, prix: 2.5 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // valider achats
    await page.locator('#page-commandes-footer div:has-text("VALIDER")').first().click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // moyens de paiement présents
    await expect(page.locator('#popup-cashless bouton-basique >> text=CASHLESS')).toBeVisible()
    await expect(page.locator('#popup-cashless bouton-basique >> text=ESPÈCE')).not.toBeVisible()
    await expect(page.locator('#popup-cashless bouton-basique >> text=CB')).not.toBeVisible()
    // bouton retour
    await expect(page.locator('#popup-cashless bouton-basique >> text=RETOUR')).toBeVisible()

    // fermer navigateur
    await page.close()
  })

  test("Contexte: 'BAR 1' en mode service directe, accepte la monnaie et cb.", async () => {
    await setPointSale('Bar 1', { directService: true, acceptsCash: true, acceptsCb: true, showPrices: true })
  })

  test("Service direct, test présence boutons check carte, reset et valider.", async ({ browser }) => {
    // browser.args = ['--window-size=550,1300']
    page = await browser.newPage()

    await connectionAdmin(page)

    // aller au point de vente "BAR 1"
    await goPointSale(page, 'Bar 1')

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // titre = "Service Direct - Bar 1"
    await expect(page.locator('.navbar-horizontal .titre-vue >> text=Service Direct - Bar 1')).toBeVisible()

    // bouton "RESET"
    await expect(page.locator('#page-commandes-footer .test-reset .footer-bt-text div >> text=RESET')).toBeVisible()

    // bouton "CHECK CARTE"
    await expect(page.locator('#page-commandes-footer div[class~="test-check-carte"] >> text=CHECK CARTE')).toBeVisible()

    // bouton "VALIDER"
    await expect(page.locator('#bt-valider >> text=VALIDER')).toBeVisible()
  })

  test("Check carte, client 1 suite au test 0010-carte-nfc...(vérif. cumule de créditation)", async () => {
    // clique bouton check carte
    await page.locator('#page-commandes-footer div[class~="test-check-carte"] >> text=CHECK CARTE').click()

    // simuler la carte du client 1
    await page.locator('#nfc-client1').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // nom
    await expect(page.locator('.test-return-name')).toHaveText('Nom : TEST')

    // status cotisation
    await expect(page.locator('.test-return-contribution')).toHaveText('Aucune cotisation')

    // total carte
    await expect(page.locator('.test-return-total-card')).toHaveText('Sur carte : 70 €')

    // cadeau
    await expect(page.locator('.test-return-monnaie-lg')).toHaveText('- TestCoin Cadeau : 10 €')

    // cashless
    await expect(page.locator('.test-return-monnaie-le')).toHaveText('- TestCoin : 60 €')

    // sortir de "popup-cashless"
    await page.locator('#popup-retour').click()
  })

  test("Bouton reset", async () => {
    // bien sur "Bar 1"
    await expect(page.locator('text=Service Direct - Bar 1')).toBeVisible()

    // sélection des articles
    const listeArticles = [{ nom: "Pression 33", nb: 2, prix: 2 }, { nom: "Pression 50", nb: 1, prix: 2.5 }]
    await selectArticles(page, listeArticles, "Bar 1")

    // --- addition ---
    // pression 33
    await expect(page.locator('#achats-liste .achats-ligne', { hasText: 'Pression 33' }).locator('.achats-col-qte')).toHaveText('2')
    await expect(page.locator('#achats-liste .achats-ligne', { hasText: 'Pression 33' }).locator('.achats-ligne-produit-contenu')).toHaveText('Pression 33')
    await expect(page.locator('#achats-liste .achats-ligne', { hasText: 'Pression 33' }).locator('.achats-col-prix-contenu')).toHaveText('2€')

    // pression 50
    await expect(page.locator('#achats-liste .achats-ligne', { hasText: 'Pression 50' }).locator('.achats-col-qte')).toHaveText('1')
    await expect(page.locator('#achats-liste .achats-ligne', { hasText: 'Pression 50' }).locator('.achats-ligne-produit-contenu')).toHaveText('Pression 50')
    await expect(page.locator('#achats-liste .achats-ligne', { hasText: 'Pression 50' }).locator('.achats-col-prix-contenu')).toHaveText('2.5€')

    // clique sur RESET
    await page.locator('#page-commandes-footer div:has-text("RESET")').first().click()

    // liste addition vide 
    await expect(page.locator(' #achats-liste')).toBeEmpty()

    await page.close()
  })
})