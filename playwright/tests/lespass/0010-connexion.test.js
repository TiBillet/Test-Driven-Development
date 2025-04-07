/* a ne faire qu'une fois pour créer son login
   et récupérer le lien de confirmation
*/
import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import { detectLanguage, lespassTranslate } from '../../mesModules/communLespass.js'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
let page, urlConfirmation = 'inconnue', language
const email = process.env.TEST_EMAIL

test.use({
  viewport: { width: 2000, height: 1000 },
  ignoreHTTPSErrors: true
})

test.describe("Lespass", () => {
  test("Connexion - sans entrer l'email", async ({ browser }) => {
    page = await browser.newPage()
    // aller à la page lespass
    await page.goto(process.env.LESPASS_URL)

    // détecter le langage
    language = await detectLanguage(page)

    // clique bt "Me connecter"
    await page.locator('nav button[aria-controls="loginPanel"]').click()

    const inputEmail = page.locator('#loginEmail')

    // valider 
    await page.locator('#loginForm button[type="submit"]').click()

    const validationMessage = await inputEmail.evaluate((element) => {
      return element.validationMessage
    })

    expect(validationMessage).toContain("Veuillez renseigner ce champ.")
  })

  test("Connexion - avec email ", async () => {
    // entrer email
    await page.fill('#loginEmail', email)

    // url à attendre
    const response = page.waitForRequest('**/connexion/')

    // valider 
    await page.locator('#loginForm button[type="submit"]').click()

    // attend la fin du chargement de l'url
    await response

    // message success
    const successMsg = lespassTranslate('validateEmailToLogin', language)
    await expect(page.locator('div[class="toast-body"]', { hasText: successMsg })).toBeVisible()

    // await page.close()
  })

  test("Test login email ", async ({ browser }) => {
    // url à attendre
    const response = page.waitForRequest('**/lespass.tibillet.localhost/emailconfirmation/**')

    // cliquer bt "TEST MODE"
    await page.locator('a', { hasText: 'TEST MODE' }).click()

    // attend la fin du chargement de l'url
    await response

    // titre "Le Tiers-Lustre" visible
    await expect(page.locator('h1', { hasText: 'Le Tiers-Lustre' })).toBeVisible()

    const loginOkText = lespassTranslate('fullyLoggedIn', language)
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: loginOkText })).toBeVisible()

    await page.close()
  })
})