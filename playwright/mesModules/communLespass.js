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
      console.log('Language = ???')
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
    const trans = lespassTransList.find(item => item.key === key)
    return trans[language]
  } catch (error) {
    console.log('-> lespassTranslate : unknown key')
    return '??? unknown key ???'
  }
}