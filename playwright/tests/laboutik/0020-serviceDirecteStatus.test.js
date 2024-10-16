// cashless_demo1.env DEBUG=True / DEMO=True / language = fr
import { test, expect } from '@playwright/test'
import { connection, getTranslate, changeLanguage, goPointSale, selectArticles, checkBillDirectService, setPointSale } from '../../mesModules/commun.js'


// attention la taille d'écran choisie affiche le menu burger
let page

let directServiceTrans, cashTrans, cbTrans, paiementTypeTrans, returnTrans, currencySymbolTrans, totalTrans, selectTableTrans, validateTrans, nameTrans
let anonymousCardTrans
const language = "en"

test.use({
	viewport: { width: 550, height: 1000 },
	ignoreHTTPSErrors: true
})

test.describe("Status, service direct,  point de ventes 'BAR 1'", () => {

	test("Contexte: configure le point de vente 'BAR 1' en mode commandes.", async () => {
		await setPointSale('Bar 1', { directService: false, acceptsCash: true, acceptsCb: true, showPrices: true })
	})

	test("BAR 1 est en mode commandes.", async ({ browser }) => {
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
		cbTrans = await getTranslate(page, 'cb', 'uppercase')
		paiementTypeTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
		returnTrans = await getTranslate(page, 'return', 'uppercase')
		currencySymbolTrans = await getTranslate(page, 'currencySymbol')
		totalTrans = await getTranslate(page, 'total', 'capitalize')
		selectTableTrans = await getTranslate(page, 'selectTable', 'capitalize')
		validateTrans = await getTranslate(page, 'validate', 'uppercase')
		nameTrans = await getTranslate(page, 'name', 'capitalize')
		anonymousCardTrans = await getTranslate(page, 'anonymousCard', 'capitalize')

		// page attendue "Direct service - icon Bar 1"
		await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText(selectTableTrans)
		await expect(page.locator('.navbar-horizontal .titre-vue')).toContainText('Bar 1')

		// bouton table éphémère
		await expect(page.locator('[onclick="restau.assignerTableEphemere()"]')).toBeVisible()

		// fermer navigateur
		await page.close()
	})


	test("Contexte: 'BAR 1' en mode service directe, accepte monnaie et cb.", async () => {
		await setPointSale('Bar 1', { directService: true, acceptsCash: true, acceptsCb: true, showPrices: true })
	})


	test("BAR 1 : service directe activé, moyens de paiement présents: monnaie, cb et cashless.", async ({ browser }) => {
		page = await browser.newPage()
		await connection(page)

		// changer de langue
		await changeLanguage(page, language)

		// aller au point de vente "BAR 1"
		await goPointSale(page, 'Bar 1')

		// attendre fin utilisation réseau
		await page.waitForLoadState('networkidle')

		// titre
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

		// sélection des articles
		const listeArticles = [{ nom: "Pression 33", nb: 2, prix: 2 }, { nom: "Pression 50", nb: 1, prix: 2.5 }]
		await selectArticles(page, listeArticles, "Bar 1")

		// valider achats
		await page.locator('#bt-valider').click()

		// attente affichage "popup-cashless"
		await page.locator('#popup-cashless').waitFor({ state: 'visible' })

		// attendre moyens de paiement
		await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

		// moyen de paiement "CASHLESS" présent
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cashless"]', { hasText: 'CASHLESS' })).toBeVisible()
		// Total pour moyen de paiement "CASHLESS" 6.5 €|$
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cashless"]', { hasText: `${totalTrans} 6.5 ${currencySymbolTrans}` })).toBeVisible()

		// moyen de paiement "ESPECE" présent
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cash"]', { hasText: cashTrans })).toBeVisible()
		// Total pour moyen de paiement "ESPECE" 6.5 €|$
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cash"]', { hasText: `${totalTrans} 6.5 ${currencySymbolTrans}` })).toBeVisible()

		// moyen de paiement "CB" présent
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cb"]', { hasText: cbTrans })).toBeVisible()
		// Total pour moyen de paiement "CB" 6.5 €|$
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cb"]', { hasText: `${totalTrans} 6.5 ${currencySymbolTrans}` })).toBeVisible()

		// bouton retour
		await expect(page.locator('#popup-cashless bouton-basique >> text=' + returnTrans)).toBeVisible()

		// fermer navigateur
		await page.close()
	})

	test("Contexte: 'BAR 1' en mode service directe, n'accepte pas la monnaie et cb.", async () => {
		await setPointSale('Bar 1', { directService: true, acceptsCash: false, acceptsCb: false, showPrices: true })
	})

	test("BAR 1 : service directe activé, moyens de paiement désactivée: monnaie et cb, cashless présent.", async ({ browser }) => {
		page = await browser.newPage()
		await connection(page)

		// changer de langue
		await changeLanguage(page, language)

		// aller au point de vente "BAR 1"
		await goPointSale(page, 'Bar 1')

		// attendre fin utilisation réseau
		await page.waitForLoadState('networkidle')

		// titre
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

		// sélection des articles
		const listeArticles = [{ nom: "Pression 33", nb: 2, prix: 2 }, { nom: "Pression 50", nb: 1, prix: 2.5 }]
		await selectArticles(page, listeArticles, "Bar 1")

		// valider achats
		await page.locator('#bt-valider').click()

		// attente affichage "popup-cashless"
		await page.locator('#popup-cashless').waitFor({ state: 'visible' })

		// attendre moyens de paiement
		await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

		// moyens de paiement présents
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cashless"]', { hasText: 'CASHLESS' })).toBeVisible()
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cash"]', { hasText: cashTrans })).not.toBeVisible()
		await expect(page.locator('#popup-cashless bouton-basique[class="test-ref-cb"]', { hasText: cbTrans })).not.toBeVisible()

		// bouton retour
		await expect(page.locator('#popup-cashless bouton-basique >> text=' + returnTrans)).toBeVisible()

		// fermer navigateur
		await page.close()
	})

	test("Contexte: 'BAR 1' en mode service directe, accepte la monnaie et cb.", async () => {
		await setPointSale('Bar 1', { directService: true, acceptsCash: true, acceptsCb: true, showPrices: true })
	})

	test("Service direct, test présence boutons check carte, reset et valider.", async ({ browser }) => {
		page = await browser.newPage()

		await connection(page)

		// changer de langue
		await changeLanguage(page, language)

		// aller au point de vente "BAR 1"
		await goPointSale(page, 'Bar 1')

		// attendre fin utilisation réseau
		await page.waitForLoadState('networkidle')

		// titre
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

		// bouton "RESET"
		await expect(page.locator('#page-commandes-footer div[onclick="vue_pv.rezet_commandes();"]')).toBeVisible()

		// bouton "CHECK CARTE"
		await expect(page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]')).toBeVisible()

		// bouton "VALIDER"
		await expect(page.locator('#bt-valider', { hasText: validateTrans })).toBeVisible()
	})


	test("Check carte, client 1 suite au test 0010-carte-nfc...(vérif. cumule de créditation)", async () => {
		// clique bouton check carte
		await page.locator('#page-commandes-footer div[onclick="vue_pv.check_carte()"]').click()

		// simuler la carte du client 1
		await page.locator('#nfc-client1').click()

		// attente affichage "popup-cashless"
		await page.locator('#popup-cashless').waitFor({ state: 'visible' })

		// "type carte"
		await expect(page.locator('.test-return-card-type', { hasText: anonymousCardTrans })).toBeVisible()

		// 70 sur carte
		await expect(page.locator('.test-return-total-card', { hasText: '70.00' })).toBeVisible()

		// assets = 60 et 10 cadeau
		const assets = [
			{ name: 'TestCoin', value: 60.00, place: 'Lespass' },
			{ name: 'TestCoin Cadeau', value: 10.00, place: 'Lespass' }
		]
		for (let index = 0; index < assets.length; index++) {
			await expect(page.locator('.test-return-monnaie-item-name' + (index + 1), { hasText: assets[index].name })).toBeVisible()
			await expect(page.locator('.test-return-monnaie-item-value' + (index + 1), { hasText: assets[index].value })).toBeVisible()
			await expect(page.locator('.test-return-monnaie-item-place' + (index + 1), { hasText: assets[index].place })).toBeVisible()
		}

		const adhesions = [
			{ name: 'Adhésion associative L’interrupteur', activation: 'today', place: 'Lespass' },
			{ name: 'Panier AMAP L’interrupteur', activation: 'today', place: 'Lespass' },
		]
		for (let index = 0; index < adhesions.length; index++) {
			await expect(page.locator('.test-return-membership-item-name' + (index + 1), { hasText: adhesions[index].name })).toBeVisible()
			await expect(page.locator('.test-return-membership-item-activation' + (index + 1), { hasText: adhesions[index].activation })).toBeVisible()
			await expect(page.locator('.test-return-membership-item-place' + (index + 1), { hasText: adhesions[index].place })).toBeVisible()
		}

		// sortir de "popup-cashless"
		await page.locator('#popup-retour').click()
	})

	test("Bouton reset", async () => {
		// bien sur "Bar 1"
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: directServiceTrans })).toBeVisible()
		await expect(page.locator('.navbar-horizontal .titre-vue', { hasText: 'Bar 1' })).toBeVisible()

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
		await page.locator('#page-commandes-footer div[onclick="vue_pv.rezet_commandes();"]').click()

		// liste addition vide 
		await expect(page.locator(' #achats-liste')).toBeEmpty()

		await page.close()
	})
})