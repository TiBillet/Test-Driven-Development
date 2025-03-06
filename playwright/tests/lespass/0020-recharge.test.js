// La partie stripe(création de compte + validation)  n'est pas testée
import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })

let domain = process.env.DOMAINTESTLESPASS, page, context, urlConfirmation = 'inconnue'
const email = process.env.EMAILTESTLOGIN
console.log('domain =', domain)

test.use({
  viewport: { width: 1920, height: 1300 },
  ignoreHTTPSErrors: true
})

test.describe("Créer instance", () => {

  test("Recuperation  login", async ({ browser }) => {
    page = await browser.newPage()
    // aller web mail YOPmail.com avec compte testyoyo974
    await page.goto('https://yopmail.com/')

    // consentir
    await page.locator('button[aria-label="Consent"]').click()

    // entrer email
    await page.locator('#login').fill(email)

    // soumettre l'email
    await page.locator('#refreshbut').click()

    // récupération url mail de confirmation
    urlConfirmation = await page.locator('iframe[name="ifmail"]').contentFrame().getByRole('link', { name: 'Confirmer' }).getAttribute('href')

    expect(urlConfirmation).toContain('https://lespass.demo.tibillet.org/emailconfirmation')
    await page.close()
  })

  test("Connexion", async ({ browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
    // go lespass avec url de confirmation
    await page.goto(urlConfirmation)

    // connexion ok
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: "Vous êtes bien connecté. Bienvenue !" })).toBeVisible()
  })

  test("Création sans nom", async ({ browser }) => {
    // url à attendre
    const response = page.waitForRequest('**/tenant/new/')
    // créer son espace
    await page.locator('a[href="/tenant/new"]', { hasText: 'Je crée un espace pour mon collectif' }).click()
    // attend la fin du chargement de l'url
    await response

    // email utilisateur présent
    await expect(page.locator('#new-tenant input[name="email"]')).toHaveValue(email)

    // email confirmation utilisateur présent
    await expect(page.locator('#new-tenant input[name="emailConfirmation"]')).toHaveValue(email)

    // nom du collectif
    const nomCollectif = page.locator('#new-tenant input[name="name"]')

    // valider
    await page.locator('#new-tenant button[type="submit"]').click()

    const validationMessage = await nomCollectif.evaluate((element) => {
      return element.validationMessage
    })

    expect(validationMessage).toContain("Veuillez renseigner ce champ.")

  })

  test("Création sans accepter les conditions", async ({ browser }) => {
    // nom du collectif
    await page.locator('#new-tenant input[name="name"]').fill('Lémienne')

    // conditions
    const conditions = page.locator('#new-tenant input[name="cgu"]')

    // valider
    await page.locator('#new-tenant button[type="submit"]').click()

    const validationMessage = await conditions.evaluate((element) => {
      return element.validationMessage
    })

    expect(validationMessage).toContain("Veuillez cocher cette case si vous souhaitez continuer.")

  })

  // TODO: vérifier le lien "Je veux utiliser une caisse enregistreuse LaBoutik"

  test("Conditions affichées", async ({ browser }) => {
    // pour attendre le nouvel onglet
    const pagePromise = context.waitForEvent('page');

    // cliquer lien cgu
    await page.locator('#new-tenant a[href="https://tibillet.org/cgucgv/"]').click()

    // attend le nouvel onglet
    const pageCgu = await pagePromise

    await expect(pageCgu.locator('article h1', { hasText: "Conditions Générales de Vente et d'Utilisation (CGU/CGV) de TiBillet" })).toBeVisible()
    await pageCgu.close()
  })

  test("Valider la Création", async ({ browser }) => {
    // activer conditions lues
    await page.locator('#new-tenant input[name="cgu"]').click()

    // url à attendre
    const response = page.waitForRequest('**/tenant/create_waiting_configuration/')

    // valider
    await page.locator('#new-tenant button[type="submit"]').click()

    // attend la fin du chargement de l'url
    await response

    await expect(page.locator('#new-tenant', {
      hasText: `Un email de bienvenue vous a été envoyé.
      Vous trouverez dans cet email un lien d'invitation à créer et lier un compte Stripe pour recevoir les paiements.
      Une fois votre compte vérifié par un vrai nos soins, nous vous contacterons (pendant un jour ouvré) pour finaliser votre inscription.
      Merci et bienvenue dans notre aventure coopérative !`}
    )).toBeVisible()

    await page.pause()
    await page.close()
  })
})