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