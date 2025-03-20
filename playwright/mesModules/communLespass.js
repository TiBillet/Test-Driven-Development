/**
 * Detect Lespass language
 * @param {*} page 
 * @returns {String} - 'fr' or 'en'
 */
export const detectLespassLanguage = async function (page) {
  return await page.evaluate(async () => {
    let retour = 'fr'
    const loginString = document.querySelector('#mainMenu button[data-bs-target="#loginPanel"]').textContent.replaceAll('\n', '').trim().toLowerCase()
    // Log in / Connexion
    if (loginString === 'log in') {
      retour = 'en'
    }
    return retour
  })
}

const lespassTransList = [
  {
    key: 'LinkingPassCard',
    fr: 'Liaison de ma carte Pass',
    en: 'Linking my Pass card'
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
    const trans  = lespassTransList.find(item => item.key === key)
    return trans[language]
  } catch (error) {
    console.log('-> lespassTranslate : unknown key')
    return '??? unknown key ???'
  }
}