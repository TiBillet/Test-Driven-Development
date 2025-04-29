import { test, expect } from '@playwright/test'

/**
 * Detect Lespass language
 * @param {*} page 
 * @returns {String} - 'fr' or 'en'
 */
export const detectLanguage = async function (page) {
  return await page.evaluate(async () => {
    let retour = 'fr'
    try {
      retour = document.querySelector('html').getAttribute('lang')
    } catch (error) {
      retour = "???"
      console.log('DetectLanguage, error; language = ???')
    }
    return retour
  })
}

const lespassTransList = [
  {
    key: 'LinkingPassCard',
    fr: 'Liaison de ma carte Pass',
    en: 'Linking my Pass card'
  },
  {
    key: 'validateEmailForAccessprofile',
    fr: 'Merci de valider votre adresse mail pour accéder à toutes les fonctionnalités de votre compte.',
    en: 'Please validate your email to access all the features of your profile area.'
  },
  {
    key: 'fullyLoggedIn',
    fr: 'Vous êtes correctement identifié·e. Bienvenue !',
    en: 'You are fully logged in. Welcome!'
  },
  {
    key: 'validateEmailToLogin',
    fr: 'Pour accéder à votre espace, merci de valider votre adresse mail. Pensez à vérifier les spams !',
    en: "To access your space, please validate your email address. Don't forget to check your spam!"
  }
]

/**
 * 
 * @param {String} key - key property in the list of translation
 * @param {String} language - 'fr' or 'en'
 * @returns {String} - translation
 */
export function lespassTranslate(key, language) {
  try {
    const trans = lespassTransList.find(item => item.key === key)
    return trans[language]
  } catch (error) {
    console.log('-> lespassTranslate : unknown key')
    return '??? unknown key ???'
  }
}


/**
 * Connexion lespass
 * @param {object} page page html en cours
 */
export const lespassClientConnection = async function (page, email) {
  await test.step('Connexion Lespass', async () => {
    // aller à la page lespass
    await page.goto(process.env.LESPASS_URL)

    // détecter le langage
    const language = await detectLanguage(page)

    // le titre de la page est bien affichée.
    await page.waitForSelector('main h1', { hasText: "Le Tiers-Lustre", state: "visible" })

    // cliquer bt "Me connecter"
    await page.locator('#mainMenu button[data-bs-target="#loginPanel"]').click()

    // le formulaire "Connexion" est vivisible
    await page.waitForSelector('#loginPanelLabel', { state: "visible" })

    // entrer email
    await page.fill('#loginEmail', email)

    // url à attendre
    const responseConnection = page.waitForRequest('**/connexion/')

    // valider 
    await page.locator('#loginForm button[type="submit"]').click()

    // attend la fin du chargement de l'url
    await responseConnection

    // attendre affichage message "Info"
    await page.waitForSelector('#toastContainer div', { hasText: "Info", state: "visible" })

    // url: attendre confirmation email
    const responseEmailConfirmation = page.waitForRequest('**/emailconfirmation/**')

    // cliquer bt "TEST MODE"
    await page.locator('#toastContainer .toast-body a', { hasText: 'TEST MODE' }).click()

    // attend la fin du chargement de l'url de confirmation d'email
    await responseEmailConfirmation

    // login ok
    const loginOkText = lespassTranslate('fullyLoggedIn', language)
    await expect(page.locator('#toastContainer div[class="toast-body"]', { hasText: loginOkText })).toBeVisible()
  })
}
