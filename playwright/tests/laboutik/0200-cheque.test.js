// cashless_demo1.env DEBUG=True / DEMO=True / language = en
import { test, expect } from '@playwright/test'
import { connection, getTranslate, changeLanguage, goPointSale, selectArticles, checkBillDirectService, setPointSale } from '../../mesModules/commun.js'
import { env } from '../../mesModules/env.js'

// attention la taille d'écran choisie affiche le menu burger
let page

let paiementTypeTrans, chequeTrans, transactionTrans, okTrans, confirmPaymentTrans
const language = "en"
const listeArticles = [
	{ nom: "Pression 33", nb: 2, prix: 2 },
	{ nom: "CdBoeuf", nb: 1, prix: 25 }
]


test.use({
	viewport: { width: 550, height: 1000 },
	ignoreHTTPSErrors: true
})

test.describe("Test le moyen de paiement chèque.", () => {
	// contexte chèque non accepté
	test(" ", async () => {
		await setPointSale('Bar 1', { directService: true, acceptsCash: true, acceptsCb: true, acceptsCheque: false, showPrices: true })
	})

	test("Moyen de paiement chèque est non présent lors validation achats.", async ({ browser }) => {
		page = await browser.newPage()
		await connection(page)

		// changer de langue
		await changeLanguage(page, language)

		// obtenir les traductions pour ce test et tous les autres
		confirmPaymentTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
		transactionTrans = await getTranslate(page, 'transaction', 'capitalize')
		okTrans = await getTranslate(page, 'ok')

		// obtenir les traductions pour ce test et tous les autres
		chequeTrans = await getTranslate(page, 'cheque', 'capitalize')

		// aller au point de vente "BAR 1"
		await goPointSale(page, 'Bar 1')

		// attendre fin utilisation réseau
		await page.waitForLoadState('networkidle')

		// sélection des articles
		await selectArticles(page, listeArticles, "Bar 1")

		// valider commande
		await page.locator('#bt-valider').click()

		// attente affichage "popup-cashless"
		await page.locator('#popup-cashless').waitFor({ state: 'visible' })

		// attendre moyens de paiement
		await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

		// moyen de paiement "chèque" non visible
		await expect(page.locator('bouton-basique[class="test-ref-ch"]', { hasText: chequeTrans })).not.toBeVisible()

		await page.close()
	})

	// contexte chèque accepté
	test("Contexte: configure le point de vente 'BAR 1' en mode commandes.", async () => {
		await setPointSale('Bar 1', { directService: true, acceptsCash: true, acceptsCb: true, acceptsCheque: true, showPrices: true })
	})

	test("Moyen de paiement chèque accepté pour les achats.", async ({ browser }) => {
		page = await browser.newPage()
		await connection(page)

		// changer de langue
		await changeLanguage(page, language)

		// aller au point de vente "BAR 1"
		await goPointSale(page, 'Bar 1')

		// attendre fin utilisation réseau
		await page.waitForLoadState('networkidle')

		// sélection des articles
		await selectArticles(page, listeArticles, "Bar 1")

		// valider commande
		await page.locator('#bt-valider').click()

		// attente affichage "popup-cashless"
		await page.locator('#popup-cashless').waitFor({ state: 'visible' })

		// attendre moyens de paiement
		await expect(page.locator('#popup-cashless .selection-type-paiement', { hasText: paiementTypeTrans })).toBeVisible()

		// moyen de paiement "chèque" visible
		await expect(page.locator('bouton-basique[class="test-ref-ch"]', { hasText: chequeTrans })).toBeVisible()

		// sélectionner moyen de paiement chèque
		await page.locator('bouton-basique[class="test-ref-ch"]').click()

		 // attente affichage "popup-cashless"
		 await page.locator('#popup-cashless').waitFor({ state: 'visible' })

		 // Confirmez le paiement est affiché
		 await expect(page.locator('.test-return-confirm-payment', { hasText: confirmPaymentTrans })).toBeVisible()
 
		 // valider/confirmer chéque
		 await page.locator('#popup-confirme-valider').click()
 
		 // attente affichage "popup-cashless"
		 await page.locator('#popup-cashless').waitFor({ state: 'visible' })
 
		 // 'Transaction ok' est affiché
		 await expect(page.locator('.test-return-title-content', { hasText: transactionTrans + ' ' + okTrans })).toBeVisible()
		await page.close()
	})

	// vérifier le moyen de paiement dans le menu ventes de l'admin
	test("Moyen de paiement chèque est présent lors validation achats.", async ({ browser }) => {
		// connexion admin
		page = await browser.newPage()
		await page.goto(env.domain)

		// permet d'attendre la fin des processus réseau
		await page.waitForLoadState('networkidle')

		// cliques sur menu burger
		await page.locator('a[class="sidebar-header-menu sidebar-toggle"]').dblclick()

		// sélectionner le menu ventes
		await page.locator('a[href="/adminstaff/APIcashless/articlevendu/"]').click()

		// permet d'attendre la fin des processus réseau
		await page.waitForLoadState('networkidle')

		// le moyen d'achat de la Pression 33 est un chèque
		await expect(page.locator('#result_list tbody tr', { hasText: listeArticles[0].nom }).locator('nth=0').locator('td[class~="field-moyen_paiement"]', { hasText: 'Chèque' })).toBeVisible()

		// le moyen d'achat du CdBoeuf est un chèque		
		await expect(page.locator('#result_list tbody tr', { hasText: listeArticles[1].nom }).locator('nth=0').locator('td[class~="field-moyen_paiement"]', { hasText: 'Chèque' })).toBeVisible()

		await page.close()
	})

})