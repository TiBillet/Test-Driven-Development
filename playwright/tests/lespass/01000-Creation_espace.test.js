import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import { lespassClientConnection } from '../../mesModules/communLespass.js'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
let page
const email = process.env.TEST_EMAIL

test.use({
  viewport: { width: 2000, height: 1200 },
  ignoreHTTPSErrors: true
})

test.describe.skip("Espace pour un collectif", () => {
  // TODO: ce test est à refaire en fonction de l'application d'une traduction
  test("Espace - page visible et liens ok", async ({ browser }) => {
    page = await browser.newPage()

    // aller à la page lespass
    await page.goto(process.env.LESPASS_URL)

    // text "Je veux ouvrir un Lèspass pour mon collectif" visible
    await expect(page.locator('footer a', { hasText: 'Je veux ouvrir un Lèspass pour mon collectif' })).toBeVisible()

    // url à attendre
    let responseGoNewTenant = page.waitForRequest('**/tenant/new/')

    // cliquer bt "Je veux ouvrir un Lèspass pour mon collectif"
    await page.locator('footer a[href="https://m.tibillet.coop/tenant/new"]').click()

    // attend la fin du chargement de l'url
    await responseGoNewTenant

    // titre "Créer une nouvelle instance" visible
    await expect(page.locator('#new-tenant h1', { hasText: 'Créer une nouvelle instance' })).toBeVisible()

    // url à attendre
    const docCaisseEnregistreuseLaboutik = page.waitForRequest('https://tibillet.org/fr/docs/presentation/demonstration/')

    // cliquer le lien "caisse enregistreuse LaBoutik"
    await page.locator('#new-tenant label a[href="https://tibillet.org/fr/docs/presentation/demonstration/#caisse-enregistreuse--cashless--httpslaboutikdemotibilletorg"]').click()

    // attend la fin du chargement de l'url
    await docCaisseEnregistreuseLaboutik

    // titre 'Caisse enregistreuse / Cashless :' visible
    await expect(page.locator('#caisse-enregistreuse--cashless--httpslaboutikdemotibilletorg', { hasText: 'Caisse enregistreuse / Cashless :' })).toBeVisible()

    // ---- revenier à la page de création d'un nouvel espace pour un collectif ----
    // aller à la page lespass
    await page.goto(process.env.LESPASS_URL)

    // url à attendre
    responseGoNewTenant = page.waitForRequest('**/tenant/new/')

    // cliquer bt "Je veux ouvrir un Lèspass pour mon collectif"
    await page.locator('footer a[href="https://m.tibillet.coop/tenant/new"]').click()

    // attend la fin du chargement de l'url
    responseGoNewTenant

    // titre "Créer une nouvelle instance" visible
    await expect(page.locator('#new-tenant h1', { hasText: 'Créer une nouvelle instance' })).toBeVisible()

    const [cguCgvPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('#new-tenant label a[href="https://tibillet.org/cgucgv/"]').click()
    ])
    await cguCgvPage.waitForLoadState('networkidle')

    await expect(cguCgvPage.locator('h1', { hasText: "Conditions Générales de Vente et d'Utilisation (CGU/CGV) de TiBillet" })).toBeVisible()

    cguCgvPage.close()
  })

  test("Espace - création", async ({ browser }) => {
    // entrer email admin
    await page.locator('#new-tenant input[name="email"]').fill(process.env.ADMIN_EMAIL)

    // entrer confirmation email admin
    await page.locator('#new-tenant input[name="emailConfirmation"]').fill(process.env.ADMIN_EMAIL)

    // entrer le nom du collectif
    await page.locator('#new-tenant input[name="name"]').fill('Collectif Sisyphe')


    // accepter les conditions d'utilisation
    await page.locator('#new-tenant input[name="cgu"]').click()

    await page.pause()

    // url à attendre
    const response = page.waitForRequest('**/tenant/create_waiting_configuration/')

    // valider la création nouveau tenant/ espace collectif
    await page.locator('#new-tenant button[type="submit"]').click()

    // attend la fin du chargement de l'url
    await response

    // TODO à refaire si traduction en place
    await expect(page.locator('#new-tenant', {hasText: 'Votre mail de bienvenue a été envoyé.'})).toBeVisible()
    await expect(page.locator('#new-tenant', {hasText: "Vous trouverez à l'intérieur un lien d'invitation à créer un compte Stripe et le paramétrer pour Lèspass. Ce compte est nécessaire pour recevoir les paiements ."})).toBeVisible()
  })
})
