/* a ne faire qu'une fois pour créer son login
   et récupérer le lien de confirmation
*/
import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
let domain = process.env.DOMAINTESTLESPASS, page, urlConfirmation='inconnue'
const email = process.env.EMAILTESTLOGIN

test.use({
  viewport: { width: 2000, height: 1000 },
  ignoreHTTPSErrors: true
})

test.describe("Lespass", () => {
  test("Création compte email ", async ({ browser }) => {
    page = await browser.newPage()
    // aller web mail YOPmail.com avec compte testyoyo974
    await page.goto('https://yopmail.com/')

    // consentir
    await page.locator('button[aria-label="Consent"]').click()

    // entrer email
    await page.locator('#login').fill(email)

    // soumettre l'email
    await page.locator('#refreshbut').click()

    await page.close()
  })

  test("Connexion - sans email ", async ({ browser }) => {
    page = await browser.newPage()
    // await page.goto(env.domain + env.adminLink)
    await page.goto(domain)

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
    await expect(page.locator('div[class="toast-body"]', { hasText: "To access your space, please validate your email address. Don't forget to check your spam!" })).toBeVisible()
    await page.close()
  })

  test("Confirmer  email ", async ({ browser }) => {
    page = await browser.newPage()
    await page.pause()
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

  test("Test login email ", async ({ browser }) => {
    page = await browser.newPage()
    // go lespass avec url de confirmation
    await page.goto(urlConfirmation)

    // connexion ok
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: "Vous êtes bien connecté. Bienvenue !" })).toBeVisible()

    // await page.pause()
    await page.close()
  })
})