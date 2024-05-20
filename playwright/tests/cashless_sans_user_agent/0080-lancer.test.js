/*
const listeArticles = [{ nom: "Pression 33", nb: 1, prix: 2 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
{ nom: "Despé", nb: 2, prix: 3.2 }, { nom: "Café", nb: 1, prix: 1 }]
*/


import { test, expect } from '@playwright/test'
import {
  connectionAdmin, goPointSale, selectArticles, getBackGroundColor,
  changeLanguage, newOrderIsShow, getTranslate, articlesListNoVisible,
  checkBill, checkAlreadyPaidBill, getStatePrepaByRoom
} from '../../mesModules/commun_sua.js'


// attention la taille d'écran choisie affiche le menu burger
let page
// sélection des articles, total 5.8 €
const listeArticles = [
  { nom: "Eau 1L", nb: 1, prix: 1.5 }, { nom: "CdBoeuf", nb: 1, prix: 25 },
  { nom: "Soft G", nb: 2, prix: 1.5 }, { nom: "Despé", nb: 1, prix: 3.2 },
  { nom: "Café", nb: 3, prix: 1 }
]

const language = "en"

test.use({
  viewport: { width: 375, height: 800 },
  ignoreHTTPSErrors: true
})

test.describe('Envoyer en préparation et aller à la page de paiement, payer "Tout".', () => {
  test("Connexion", async ({ browser }) => {
    page = await browser.newPage()
    await connectionAdmin(page)

    // dev changer de langue
    await changeLanguage(page, language)
  })

  test('Fin', async () => {
    await page.pause()
    await page.close()
  })
})