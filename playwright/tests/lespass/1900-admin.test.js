import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'

const root = process.cwd()
dotenv.config({ path: root + '/../.env' })
const domain = process.env.DOMAINTESTLESPASS + process.env.DOMAINTESTADMIN
console.log('domain =', domain)

let page, admin

// taille navigateur
test.use({
  viewport: { width: 2000, height: 1300 },
  ignoreHTTPSErrors: true
})

// attention test ignorer 
test.describe.skip("Admin tets", () => {
  test("Création d'un espace", async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  
    await page.goto(domain)

    // pour attendre le nouvel onglet
    const pagePromise = context.waitForEvent('page')

    // cliquer sur Administration
    await page.locator('.nav .nav-item a[href="/admin/"]').click()

    // attend le nouvel onglet
    admin = await pagePromise

    await admin.locator('div', {hasText: 'Informations générales'}).locator('#nav-sidebar ol a[href="/admin/BaseBillet/configuration/"]').click()
  
  })

  test("Fin", async ({ browser }) => {

    await page.pause()
    await page.close()
  })

})
