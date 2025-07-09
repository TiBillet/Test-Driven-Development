/* attention tests spécifiques à la db utilisée pour le cashless;
nom monnaie, valeur des articles: 5, 10, ...
*/

import { test, expect, chromium } from '@playwright/test'
// import { env } from './env.js'
import Big from './big.js'


// user agent
export const fakeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'

/**
 * Clients list object 
 */
export const clients = {
  primaire: {
    id: 'nfc-primaire',
    tagId: process.env.DEMO_TAGID_CM
  },
  client1: {
    id: 'nfc-client1',
    tagId: process.env.DEMO_TAGID_CLIENT1
  },
  client2: {
    id: 'nfc-client2',
    tagId: process.env.DEMO_TAGID_CLIENT2
  },
  client3: {
    id: 'nfc-client3',
    tagId: process.env.DEMO_TAGID_CLIENT3
  },
  unknown: {
    id: 'nfc-unknown',
    tagId: 'XXXXXXXX'
  }

}

/**
 * Connexion laboutik, connexion admin + voir le site
 * @param {object} page page html en cours
 */
export const connection = async function (page) {
  await test.step('Connexion admin', async () => {
    // pour être sûre d'avoir l'icon hamburger
    await page.setViewportSize({ width: 550, height: 1000 });

    // go site laboutik
    await page.goto(process.env.LABOUTIK_URL)

    await page.locator('#site-name', { hasText: 'TiBillet Staff Admin' }).waitFor()

    // permet d'attendre une fin de redirection
    // await page.waitForLoadState('networkidle')

    // 2 cliques sur menu burger
    await page.locator('a[class="sidebar-header-menu sidebar-toggle"]').dblclick()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // clique sur "voir le site"
    await page.locator('.sidebar-section a[href="/wv"]').click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    // clique carte primaire
    await page.locator('#nfc-primaire').click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')
  })
}

/**
 * Aller au point de ventes
 * @param {object} page page html en cours
 * @param {string} menu Sélectionne le menu
 * @returns {Promise<void>}
 */
export const goPointSale = async function (page, menu) {
  await test.step('Aller au menu ' + menu, async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })
    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    // Clique sur le menu POINTS DE VENTES
    await page.locator('#menu-burger-conteneur div[data-i8n*="pointOfSales"]').click()

    // Clique sur le point de vente donné
    await page.locator('#menu-burger-conteneur >> text=' + menu.toUpperCase()).click()
  })
}

/**
 * Aller à la commande de la table
 * @param {object} page page html en cours
 * @param {string} table Sélectionne la table par son nom
 * @returns {Promise<void>}
 */
export const goTableOrder = async function (page, table) {
  await test.step('Aller à la table ' + table, async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    // Clique sur le menu TABLES
    await page.locator('text=TABLES').click()

    // attente affichage des tables
    const showTableOrdersTrans = await getTranslate(page, 'displayCommandsTable', 'capitalize')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: showTableOrdersTrans }).waitFor({ state: 'visible' })

    // sélectionne la table
    await page.locator('#tables-liste div[class~="table-bouton"] >> text=' + table).click()
  })
}

// dev changer de langue
export const changeLanguage = async function (page, language) {
  await test.step("changer la langue", async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    // url à attendre
    const responseSettings = page.waitForRequest('**/htmx/appsettings/**')
    // Cliquer sur SETTINGS
    await page.locator('#menu-burger-conteneur .test-action-change-settings').click()
    // attend la fin du chargement de l'url
    await responseSettings

    // url à attendre
    const responseLanguage = page.waitForRequest('**/htmx/appsettings/language/**')
    // Cliquer sur langage
    await page.locator('#service-commandes div[hx-get="/htmx/appsettings/language"]').click()
    // attend la fin du chargement de l'url
    await responseLanguage

    // langue = "en"
    await page.locator(`#settings-language-list input[value="${language}"]`).click()

    // valider
    await page.locator('#container-settings bouton-basique[onclick="changeLanguageAction();"]').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // selection carte primaire
    await page.locator('#nfc-primaire').click()
  })
}

/**
 * Sélectionne des articles
 * @param {object} page
 * @param {array} list liste d'articles avec {nom,nb,prix}
 * @param {string} pv point de ventes
 * @returns {Promise<void>}
 */
export const selectArticles = async function (page, list, pv) {
  await test.step('Sélectionner les articles.', async () => {
    for (const listKey in list) {
      const article = list[listKey]
      await page.locator(`#products div[data-name-pdv="${pv}"] bouton-article[nom="${article.nom}"]`).click({ clickCount: article.nb })
    }
  })
}

export const resetCardCashless = async function (page, carte) {
  // attente affichage menu burger
  await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

  // Clique sur le menu burger
  await page.locator('.menu-burger-icon').click()

  // Click text=POINTS DE VENTES
  const psTrans = await getTranslate(page, 'pointOfSales', 'uppercase')
  await page.locator('text=' + psTrans).click()

  // Click "CASHLESS"
  await page.locator('#menu-burger-conteneur >> text=CASHLESS').click()

  // attendre point de ventes, le titre contient "service directe" et "cashless"
  const titre = await getTranslate(page, 'directService', 'capitalize')

  await page.locator('.navbar-horizontal .titre-vue', { hasText: titre }).waitFor({ state: 'visible' })
  await page.locator('.navbar-horizontal .titre-vue', { hasText: 'Cashless' }).waitFor({ state: 'visible' })

  // ------------------ Attention "VIDER CARTE" et "VOID CARTE" ont la même méthode -------------------------
  // vider carte / clean card
  await page.locator('#products div[data-name-pdv="Cashless"] bouton-article[methode="ViderCarte"]', { hasText: 'VIDER CARTE' }).click()

  // valider vider carte
  await page.locator('#bt-valider').click()

  // attente affichage "Attente lecture carte"
  const msgAwaitingCard = await getTranslate(page, 'awaitingCardReading', 'capitalize')
  await page.locator('#popup-cashless', { hasText: msgAwaitingCard }).waitFor({ state: 'visible' })

  // cliquer sur carte nfc simulée
  await page.locator('#' + carte).click()

  // attente affichage "popup-cashless"
  await page.locator('#popup-cashless').waitFor({ state: 'visible' })

  // vidage carte ok
  const msgTrans = await getTranslate(page, 'clearingCardOk', 'capitalize')
  await expect(page.locator('#popup-cashless .test-return-reset', { hasText: msgTrans })).toBeVisible()

  // clique sur bouton "RETOUR"
  await page.locator('#popup-retour').click()

  // #popup-cashless éffacé
  await expect(page.locator('#popup-cashless')).toBeHidden()
}


/**
 * Test le popup de confirmation de type de paiement
 * @param {object} page page html en cours
 * @param {string} typePaiement le type de paiement choisi
 * @param {string} sommeDonnee - somme donnée en liquide
 * @param {boolean} complementaire paiement complémentaire ou non
 * @returns {Promise<void>}
 */
export const confirmation = async function (page, typePaiement, sommeDonnee, complementaire) {
  await test.step('confirm paiement' + typePaiement, async () => {
    let fonc, foncAttendue

    // popup de confirmation présent
    await expect(page.locator('#popup-cashless-confirm')).toBeVisible()

    // text "Confirmez le paiement" visible
    const popupTitleTrans = await getTranslate(page, 'confirmPayment', 'capitalize')
    await expect(page.locator('#popup-cashless-confirm .test-return-confirm-payment', { hasText: popupTitleTrans })).toBeVisible()

    // récupère la fonction du bouton valider
    fonc = await page.locator('#popup-cashless-confirm bouton-basique:nth-child(2)').getAttribute('onclick')

    // text contient "ESPECE" + fonction attendue
    if (typePaiement === 'espece') {
      const paymentType = await getTranslate(page, 'cash')

      await expect(page.locator('.test-return-payment-method')).toHaveText(paymentType)

      foncAttendue = 'validateGivenSum(\'vue_pv.obtenirIdentiteClientSiBesoin\')'
      //foncAttendue = "keyboard.hide();validateGivenSum('vue_pv.obtenirIdentiteClientSiBesoin');"
      if (complementaire === true) {
        foncAttendue = 'vue_pv.validerEtapeMoyenComplementaire(\'espece\')'
      }

      // innsérer la valeur "sommeDonnee"
      await page.locator('#given-sum').fill(sommeDonnee.toString())
    }

    // text contient "CB" + fonction attendue
    if (typePaiement === 'cb') {
      const paymentType = await getTranslate(page, 'cb')
      await expect(page.locator('.test-return-payment-method', { hasText: paymentType })).toBeVisible()

      foncAttendue = 'vue_pv.obtenirIdentiteClientSiBesoin(\'carte_bancaire\')'
      if (complementaire === true) {
        foncAttendue = 'vue_pv.validerEtapeMoyenComplementaire(\'carte_bancaire\')'
      }
    }

    // compare la fonction attendue avec la fonction du bouton valider
    await expect(fonc).toEqual(expect.stringContaining(foncAttendue))

    // vérifier la présence du bouton valider
    await expect(page.locator('#popup-confirme-valider')).toBeVisible()

    // vérifier la présence du bouton retour
    await expect(page.locator('#popup-confirme-retour')).toBeVisible()
  })
}

/**
 * Créditer de la monnaie sur une carte  cashless
 * @param {object} page page html en cours
 * @param {string} carte - '#id-carte-to-click' 
 * @param {number} nbXCredit10 - fois 10 credit
 * @param {string} paiement - le moyen de paiement
 * @param {string} sommeDonnee - somme donnée en liquide
 * @returns {Promise<void>}
 */
export const creditMoneyOnCardCashless = async function (page, carte, nbXCredit10, paiement, sommeDonnee) {
  await test.step('Crediter la carte cashless.', async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    // Click text=POINTS DE VENTES
    const psTrans = await getTranslate(page, 'pointOfSales', 'uppercase')
    await page.locator('text=' + psTrans).click()

    // Click "CASHLESS"
    await page.locator('#menu-burger-conteneur >> text=CASHLESS').click()

    // attendre point de ventes, le titre contient "service directe" et "cashless"
    const titre = await getTranslate(page, 'directService', 'capitalize')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: titre }).waitFor({ state: 'visible' })
    await page.locator('.navbar-horizontal .titre-vue', { hasText: 'Cashless' }).waitFor({ state: 'visible' })

    // article 10 crédits
    await page.locator('#products div[data-name-pdv="Cashless"] bouton-article[nom="TestCoin +10"]').click({ clickCount: nbXCredit10 })

    // cliquer sur bouton "VALIDER"
    await page.locator('#bt-valider').click()

    // attente affichage "Type(s) de paiement"
    const popupTitleTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: popupTitleTrans }).waitFor({ state: 'visible' })

    // payer en espèces + confirmation -- cash-uppercase
    if (paiement === undefined || paiement === 'espece') {
      const cashPaymentTrans = await getTranslate(page, 'cash', 'uppercase')
      await page.locator(`#popup-cashless div[class="paiement-bt-container test-ref-cash"] >> text=${cashPaymentTrans}`).click()
      // confirmer sans test le choix "espèce"
      await confirmation(page, 'espece', sommeDonnee)
    }

    // payer par CB + confirmation -- cb-uppercase
    if (paiement === 'cb') {
      const creditCardPaymentTrans = await getTranslate(page, 'cb', 'uppercase')
      await page.locator(`#popup-cashless div[class="paiement-bt-container test-ref-cb"] >> text=${creditCardPaymentTrans}`).click()
      // confirmer sans test le choix "cb"
      await confirmation(page, 'cb')
    }

    // valider
    await page.locator('#popup-confirme-valider').click()

    // sélectionner la carte à créditer (simulation nfc)
    await page.locator('#' + carte).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')
  })
}

/**
 Créditer de la monnaie cadeau sur une carte  cashless
 * @param {object} page page html en cours
 * @param {string} carte - '#id-carte-to-click' 
 * @param {number} nbXCreditCadeau5 - fois 5 credit cadeau
 * @returns {Promise<void>}
 */
export const creditGiftMoneyOnCardCashless = async function (page, carte, nbXCreditCadeau5) {
  await test.step('Crediter la carte cashless.', async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    // Click text=POINTS DE VENTES
    const psTrans = await getTranslate(page, 'pointOfSales', 'uppercase')
    await page.locator('text=' + psTrans).click()

    // Click "CASHLESS"
    await page.locator('#menu-burger-conteneur >> text=CASHLESS').click()

    // attendre point de ventes, le titre contient "service directe" et "cashless"
    const titre = await getTranslate(page, 'directService', 'capitalize')
    await page.locator('.navbar-horizontal .titre-vue', { hasText: titre }).waitFor({ state: 'visible' })
    await page.locator('.navbar-horizontal .titre-vue', { hasText: 'Cashless' }).waitFor({ state: 'visible' })


    // créditer credit cadeau, nbXCreditCadeau5 x 5 crédits cadeau
    if (nbXCreditCadeau5 >= 1) {
      // article 5 crédits
      await page.locator('#products div[data-name-pdv="Cashless"] bouton-article[nom="TestCoin Cadeau +5"]').click({ clickCount: nbXCreditCadeau5 })
    }

    // cliquer sur bouton "VALIDER"
    await page.locator('#bt-valider').click()

    // sélectionner la carte à créditer (simulation nfc)
    await page.locator('#' + carte).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')

    /*
    // attente affichage "Type(s) de paiement"
    const popupTitleTrans = await getTranslate(page, 'paymentTypes', 'capitalize')
    await page.locator('#popup-cashless .selection-type-paiement', { hasText: popupTitleTrans }).waitFor({ state: 'visible' })

    // payer en espèces + confirmation -- cash-uppercase
    if (paiement === undefined || paiement === 'espece') {
      const cashPaymentTrans = await getTranslate(page, 'cash', 'uppercase')
      await page.locator(`#popup-cashless bouton-basique >> text=${cashPaymentTrans}`).click()
      // confirmer sans test le choix "espèce"
      await confirmation(page, 'espece', sommeDonnee)
    }

    // payer par CB + confirmation -- cb-uppercase
    if (paiement === 'cb') {
      const creditCardPaymentTrans = await getTranslate(page, 'cb', 'uppercase')
      await page.locator(`#popup-cashless bouton-basique >> text=${creditCardPaymentTrans}`).click()
      // confirmer sans test le choix "cb"
      await confirmation(page, 'cb')
    }

    // valider
    await page.locator('#popup-confirme-valider').click()

    // sélectionner la carte à créditer (simulation nfc)
    await page.locator('#' + carte).click()

    // attendre fin utilisation réseau
    await page.waitForLoadState('networkidle')
    */
  })
}

/**
 * Vérifier addition (check bill) service directe
 * @param {object} page
 * @param {array} list
 * @returns {Promise<void>}
 */
export const checkBillDirectService = async function (page, list) {
  await test.step('Sélectionner les articles.', async () => {
    // nombre de ligne de l'addition
    await expect(page.locator('#achats-liste .achats-ligne')).toHaveCount(list.length)

    // monnaie
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    const monnaie = await getEntity(page, currencySymbolTransTempo)

    // articles de l'addition identique à liste articles
    for (const listKey in list) {
      const article = list[listKey]
      // await page.locator('#addition-liste .test-addition-article-ligne', {hasText: article.nom}).locator('.addition-col-prix div').click()
      await expect(page.locator('#achats-liste .achats-ligne', { hasText: article.nom }).locator('.achats-col-qte')).toHaveText(article.nb.toString())
      await expect(page.locator('#achats-liste .achats-ligne', { hasText: article.nom }).locator('.achats-col-produit div')).toHaveText(article.nom)
      await expect(page.locator('#achats-liste .achats-ligne', { hasText: article.nom }).locator('.achats-col-prix div')).toHaveText(article.prix.toString() + monnaie)
    }
  })
}

/**
 * Vérifier addition (check bill)
 * @param {object} page
 * @param {array} list
 * @returns {Promise<void>}
 */
export const checkBill = async function (page, list) {
  await test.step('Sélectionner les articles.', async () => {
    // nombre de ligne de l'addition
    await expect(page.locator('#addition-liste .test-addition-article-ligne')).toHaveCount(list.length)

    // monnaie
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    const monnaie = await getEntity(page, currencySymbolTransTempo)

    // articles de l'addition identique à liste articles
    for (const listKey in list) {
      const article = list[listKey]
      await expect(page.locator('#addition-liste .test-addition-article-ligne', { hasText: article.nom }).locator('.addition-col-qte')).toHaveText(article.nb.toString())
      await expect(page.locator('#addition-liste .test-addition-article-ligne', { hasText: article.nom }).locator('.addition-col-produit div')).toHaveText(article.nom)
      await expect(page.locator('#addition-liste .test-addition-article-ligne', { hasText: article.nom }).locator('.addition-col-prix div')).toHaveText(article.prix.toString() + monnaie)
    }
  })
}

/**
 * Vérifier articles déjà payés dans l'addition
 * @param {object} page
 * @param {array} list
 * @returns {Promise<void>}
 */
export const checkAlreadyPaidBill = async function (page, list) {
  await test.step('Sélectionner les articles.', async () => {
    // monnaie
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    const monnaie = await getEntity(page, currencySymbolTransTempo)

    // nombre de ligne de l'addition
    await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb')).toHaveCount(list.length)
    // articles de l'addition identique à liste articles
    for (const listKey in list) {
      const article = list[listKey]
      await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: article.nom }).locator('.addition-col-qte')).toHaveText(article.nb.toString())
      await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: article.nom }).locator('.addition-col-produit div')).toHaveText(article.nom)
      await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: article.nom }).locator('.addition-col-prix div')).toHaveText(article.prix.toString() + ' ' + monnaie)
    }
  })
}

/**
 * Article is not visible
 * @param page
 * @param {string} articleName name of the article
 * @returns {Promise<void>}
 */
export const articleIsNotVisible = async function (page, articleName) {
  return await page.evaluate(async ([articleName]) => {
    let retour = true
    const article = document.querySelector(`#commandes-table-articles bouton-commande-article[data-nom="${articleName}"]`)
    if (article.style.display !== 'none') {
      retour = false
    }
    return retour
  }, [articleName])
}

/**
 * Article is visible
 * @param page
 * @param {string} articleName name of the article
 * @returns {Promise<void>}
 */
export const articleIsVisible = async function (page, articleName) {
  return await page.evaluate(async ([articleName]) => {
    let retour = true
    const article = document.querySelector(`#commandes-table-articles bouton-commande-article[data-nom="${articleName}"]`)
    if (article.style.display !== 'block') {
      retour = false
    }
    return retour
  }, [articleName])
}

/**
 * Configure un point de ventes
 * @param {object} browser 
 * @param {*} pointSale 
 * @param {*} options 
 */
export const setPointSale = async function (pointSale, options) {
  /* options = {
    directService: boolean,
    acceptsCash: boolean,
    acceptsCb: boolean,
    showPrices: boolean,
    acceptsCheque: boolean
  }*/

  let page
  await test.step(`Configurer point ventes:`, async () => {
    // connexion admin
    const browser = await chromium.launch()
    page = await browser.newPage()
    await page.goto(process.env.LABOUTIK_URL)

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // cliques sur menu burger
    await page.locator('a[class="sidebar-header-menu sidebar-toggle"]').dblclick()

    // aller menu points de ventes
    await page.locator('a[href="/adminstaff/APIcashless/pointdevente/"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // séléctionner le point de ventes
    await page.locator('.results tr th[class="field-name"]').getByText(pointSale).dblclick()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    for (const key in options) {
      // afficher prix
      if (key === 'showPrices') {
        const showPricesIsChecked = await page.locator('#id_afficher_les_prix').isChecked()
        if (showPricesIsChecked !== options[key]) {
          await page.locator('label[for="id_afficher_les_prix"]').click()
        }
      }

      // Accepte especes
      if (key === 'acceptsCash') {
        const acceptsCashIsChecked = await page.locator('#id_accepte_especes').isChecked()
        if (acceptsCashIsChecked !== options[key]) {
          await page.locator('label[for="id_accepte_especes"]').click()
        }
      }

      // Accepte carte bancaire
      if (key === 'acceptsCb') {
        const acceptsCbIsChecked = await page.locator('#id_accepte_carte_bancaire').isChecked()
        if (acceptsCbIsChecked !== options[key]) {
          await page.locator('label[for="id_accepte_carte_bancaire"]').click()
        }
      }

      // Accepte chèque
      if (key === 'acceptsCheque') {
        const acceptsCChequeIsChecked = await page.locator('#id_accepte_cheque').isChecked()
        if (acceptsCChequeIsChecked !== options[key]) {
          await page.locator('label[for="id_accepte_cheque"]').click()
        }
      }

      // service directe
      if (key === 'directService') {
        const directServiceIsChecked = await page.locator('#id_service_direct').isChecked()
        if (directServiceIsChecked !== options[key]) {
          await page.locator('label[for="id_service_direct"]').click()
        }
      }
    }

    // enregistrer
    await page.locator('input[name="_save"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // message succès =  'rgb(196, 236, 197)'
    const backGroundColor = await getStyleValue(page, '.messagelist .success', 'backgroundColor')
    expect(backGroundColor).toEqual('rgb(196, 236, 197)')
    await page.close()
  })
}

export const getStyleValue = async function (page, selector, property) {
  return await page.evaluate(async ([selector, property]) => {
    const propertys = document.defaultView.getComputedStyle(document.querySelector(selector))
    return propertys[property]
  }, [selector, property])
}

export const getStyleValueFromLocator = async function (locator, property) {
  return await locator.evaluate(async (element, [property]) => {
    const propertys = document.defaultView.getComputedStyle(element)
    return propertys[property]
  }, [property])
}

export const getTranslate = async function (page, indexTrad, option, method) {
  return await page.evaluate(async ([indexTrad, option, method]) => {
    // attenttion supprimer tous les "\n"  de la traductuion
    return getTranslate(indexTrad, option, method).replace(/\n/g, "")
  }, [indexTrad, option, method])
}

export const getEntity = async function (page, htmlEntity) {
  return await page.evaluate(async ([htmlEntity]) => {
    const ele = document.createElement("ele");
    ele.innerHTML = htmlEntity;
    return ele.textContent;
  }, [htmlEntity])
}

export const getLocale = async function (page) {
  return await page.evaluate(async () => {
    return getLanguages().find(item => item.language === localStorage.getItem("language")).locale
  })
}

export const checkListArticlesOk = async function (page, list) {
  await test.step('List articles ok.', async () => {
    // monnaie
    const currencySymbolTransTempo = await getTranslate(page, 'currencySymbol', null, 'methodCurrency')
    const monnaie = await getEntity(page, currencySymbolTransTempo)

    const articles = page.locator('#commandes-table-articles bouton-commande-article .ele-conteneur')
    const count = await articles.count()
    let listArticlesOk
    for (let i = 0; i < count; ++i) {
      listArticlesOk = false
      const articleNom = (await articles.nth(i).locator('.ele-nom').textContent()).toString().trim()
      const articlePrix = (await articles.nth(i).locator('.ele-prix').textContent()).toString().trim()
      const articleNbRaw = await articles.nth(i).locator('.ele-nombre > span').textContent()
      const articleNb = parseInt(articleNbRaw.trim())
      const compListe = list.find(ele => ele.nom === articleNom)
      if (compListe.nom === articleNom && compListe.nb === articleNb && (compListe.prix.toString() + ' ' + monnaie) === articlePrix) {
        listArticlesOk = true
      }
    }
    await expect(listArticlesOk).toEqual(true)
  })
}

/**
 * The new order of the room xxx of point sale yyy is show
 * @param {object} page 
 * @param {string} room - name of the room 
 * @param {string} ps - name of point sales 
 */
export const newOrderIsShow = async function (page, room, ps) {
  // nouvelle commande
  const partTitle1 = await getTranslate(page, "newTableOrder", "capitalize")
  // point de vente
  const partTitle2 = await getTranslate(page, "ps", "uppercase")
  // pv resto affiché
  await expect(page.locator(`.titre-vue >> text=${partTitle1} ${room}, ${partTitle2} ${ps}`)).toBeVisible()
}

/**
 * Tous les articles de la liste ne sont pas visibles
 * @param page
 * @returns {Promise<void>}
 */
export const articlesListNoVisible = async function (page) {
  return await page.evaluate(async () => {
    let retour = true
    const liste = document.querySelectorAll('#commandes-table-articles bouton-commande-article')
    for (let i = 0; i < liste.length; i++) {
      if (liste[i].style.display !== 'none') {
        retour = false
        break
      }
    }
    return retour
  })
}

/**
 * Tous les articles de la liste sont visibles
 * @param page
 * @returns {Promise<*>}
 */
export const articlesListIsVisible = async function (page) {
  return await page.evaluate(async () => {
    let retour = true
    const liste = document.querySelectorAll('#commandes-table-articles bouton-commande-article')
    for (let i = 0; i < liste.length; i++) {
      if (liste[i].style.display !== 'block') {
        retour = false
        break
      }
    }
    return retour
  })
}

export const getStatePrepaByRoom = async function (page, room) {
  // attention - attendre fin utilisation réseau
  await page.waitForLoadState('networkidle')
  return await page.evaluate(([room]) => {
    articles = [], locationId = []
    // bar, cuisine, resto, ...
    const lieux = document.querySelectorAll('.com-conteneur')
    // compare les articles
    lieux.forEach(lieu => {
      // appartient à room
      if (lieu.innerText.includes(room)) {
        // id lieu de préparations
        locationId.push(lieu.id)

        // les articles
        lieu.querySelectorAll('.com-articles-conteneur .com-article-infos').forEach(item => {
          const uuid = crypto.randomUUID()
          let qty = item.querySelector('.test-rest-serve-qty')
          qty.setAttribute('test-qty-id', uuid)
          const nb = parseInt(qty.innerText)
          let name = item.querySelector('.test-rest-serve-name')
          name.setAttribute('test-name-id', uuid)
          const nom = name.innerText
          articles.push({ nom, nb, uuid })
        })
      }
    })
    return { articles, locationId }
  }, [room])
}

/**
 * Affiche la valeur d'un décimal
 * @param value un décimal Big https://github.com/MikeMcl/big.js
 * @returns {number}
 */
export function bigToFloat(value) {
  try {
    return parseFloat(new Big(value).valueOf())
  } catch (error) {
    console.log('-> bigToFloat de sys, ', error)
  }
}

/**
 * Retour le total de la liste d'articles
 * @param {array.<object>} list liste(objet) d'articles
 * @returns {number}
 */
export function totalListeArticles(list) {
  let total = new Big(0)
  for (let i = 0; i < list.length; i++) {
    const article = list[i]
    total = total.plus(new Big(article.prix).times(article.nb))
  }
  return parseFloat(total.valueOf())
}

/**
 * Activation/Désactivation mode gérant
 * @param {object} page page html en cours
 * @param {string} status on/off
 * @returns {Promise<void>}
 */
export const managerMode = async function (page, status) {
  await test.step('Activation/Désactivation mode gérant.', async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })
    // Clique sur le menu burger
    await page.locator('.menu-burger-icon').click()

    const managerModeON = await page.evaluate(async () => {
      if (document.querySelector('#conteneur-menu-mode-gerant i[class="fas fa-lock"]') !== null) {
        return false
      } else {
        return true
      }
    })

    if ((status === 'on' && managerModeON === false) || (status === 'off' && managerModeON === true)) {
      // Clique sur mode gérant
      await page.locator('#conteneur-menu-mode-gerant').click()
    } else {
      // clique sur le titre de la navbarre pour sortir du menu
      await page.locator('.navbar-horizontal .titre-vue').click()
    }
  })
}

export const gridIsTestable = function (sites, ref) {
  const site = sites.find(site => site.ref === ref)
  if (site.articles.length > 1) {
    return true
  }
  for (let i = 0; i < site.articles.length; i++) {
    const article = site.articles[i]
    if (article.nb > 1) {
      return true
    }
  }
  return false
}