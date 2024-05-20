import fetch from "node-fetch"
import { test, expect, chromium } from '@playwright/test'
import { env } from './env_sua.js'
import * as IP from "ip"
import Big from './big.js'


export const loadTrad = async function () {
  // https://cashless.filaos.re/static/webview/js/modules/i8n.js
  // https://cashless.filaos.re/static/webview/js/modules/languages/languageEn.js
}

/**
 * Connexion au serveur cashless
 * @param {object} page page html en cours
 */
export const connectionAdmin = async function (page) {
  await test.step('Connexion admin', async () => {
    // await page.goto(env.domain + env.adminLink)
    await page.goto(env.domain)

    // permet d'attendre une fin de redirection
    await page.waitForLoadState('networkidle')

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

    // Click #menu-burger-conteneur >> text=Bar 1
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

    // Clicque sur LANGUE
    await page.locator('#menu-burger-conteneur .test-action-change-language').click()

    // attente affichage "popup-cashless"
    await page.locator('#popup-cashless').waitFor({ state: 'visible' })

    // langue = "en"
    await page.locator(`#popup-cashless input[value="${language}"]`).click()

    // valider
    await page.locator('#popup-confirme-valider').click()

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
  await page.locator('text=POINTS DE VENTES').click()
  // Click #menu-burger-conteneur >> text=Bar 1
  await page.locator('#menu-burger-conteneur >> text=CASHLESS').click()

  // attente affichage menu burger
  await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

  await page.locator('#products div[data-name-pdv="Cashless"] bouton-article[nom="VIDER CARTE"]').click()
  // moyen de paiement "CASHLESS" présent
  await expect(page.locator('#popup-cashless bouton-basique >> text=CASHLESS')).toBeVisible()
  // Total pour moyen de paiement "CASHLESS" 35.7 €
  await expect(page.locator('#popup-cashless bouton-basique', { hasText: 'CASHLESS' }).locator('.sous-element-texte >> text=TOTAL')).toHaveText('TOTAL 35.7 €')

  // moyen de paiement "ESPECE" présent
  await expect(page.locator('#popup-cashless bouton-basique >> text=ESPECE')).toBeVisible()
  // Total pour moyen de paiement "ESPECE" 35.7 €
  await expect(page.locator('#popup-cashless bouton-basique', { hasText: 'ESPECE' }).locator('.sous-element-texte >> text=TOTAL')).toHaveText('TOTAL 35.7 €')

  // moyen de paiement "CB" présent
  await expect(page.locator('#popup-cashless bouton-basique >> text=CB')).toBeVisible()
  // Total pour moyen de paiement "CB" 35.7 €
  await expect(page.locator('#popup-cashless bouton-basique', { hasText: 'CB' }).locator('.sous-element-texte >> text=TOTAL')).toHaveText('TOTAL 35.7 €')

  // bouton RETOUR présent
  await expect(page.locator('#popup-cashless bouton-basique >> text=RETOUR')).toBeVisible()

  // clique sur "ESPECE"
  await page.locator('#popup-cashless bouton-basique >> text=ESPECE').click()

  // confirmation espèce
  await confirmation(page, 'espece')

  // VALIDER
  await page.locator('#popup-confirme-valider').click()

  // cliquer sur bouton "VALIDER"
  await page.locator('#bt-valider').click()

  // cliquer sur carte nfc simulée
  await page.locator('#' + carte).click()
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
    await expect(page.locator('#popup-cashless-confirm > h1 > div', { hasText: 'Confirmez le paiement' })).toBeVisible()

    // récupère la fonction du bouton valider
    fonc = await page.locator('#popup-cashless-confirm bouton-basique:nth-child(2)').getAttribute('onclick')

    // text contient "ESPECE" + fonction attendue
    if (typePaiement === 'espece') {
      await expect(page.locator('.test-return-payment-method')).toHaveText('espèce')

      foncAttendue = 'validateGivenSum(\'vue_pv.obtenirIdentiteClientSiBesoin\')'
      if (complementaire === true) {
        foncAttendue = 'vue_pv.validerEtapeMoyenComplementaire(\'espece\')'
      }

      // innsérer la valeur "sommeDonnee"
      await page.locator('#given-sum').fill(sommeDonnee)

    }

    // text contient "CB" + fonction attendue
    if (typePaiement === 'cb') {
      await expect(page.locator('.test-return-payment-method')).toHaveText('cb')

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
 * Créditer une carte de crédits et crédits cadeau
 * @param {object} page page html en cours
 * @param {string} carte - '#id-carte-to-click' 
 * @param {number} nbXCredit10 - fois 10 credit
 * @param {number} nbXCreditCadeau5 - fois 5 credit cadeau
 * @param {string} paiement - le moyen de paiement
 * @param {string} sommeDonnee - somme donnée en liquide
 * @returns {Promise<void>}
 */
export const creditCardCashless = async function (page, carte, nbXCredit10, nbXCreditCadeau5, paiement, sommeDonnee) {
  await test.step('Crediter la carte cashless.', async () => {
    // attente affichage menu burger
    await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

    // créditer credit, nbXCredit10 x 10 crédits
    if (nbXCredit10 >= 1) {
      // Clique sur le menu burger
      await page.locator('.menu-burger-icon').click()
      // Click text=POINTS DE VENTES
      await page.locator('text=POINTS DE VENTES').click()
      // Click menu CASHLESS
      await page.locator('#menu-burger-conteneur >> text=CASHLESS').click()

      // attente affichage menu burger
      await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

      // 10 crédits
      await page.locator('#products div[data-name-pdv="Cashless"] bouton-article[nom="TestCoin +10"]').click({ clickCount: nbXCredit10 })
    }

    // créditer credit cadeau, nbXCreditCadeau5 x 5 crédits cadeau
    if (nbXCreditCadeau5 >= 1) {
      // attente affichage menu burger
      await page.locator('.navbar-menu i[class~="menu-burger-icon"]').waitFor({ state: 'visible' })

      // 5 crédits
      await page.locator('#products div[data-name-pdv="Cashless"] bouton-article[nom="TestCoin Cadeau +5"]').click({ clickCount: nbXCreditCadeau5 })
    }

    // cliquer sur bouton "VALIDER"
    await page.locator('#bt-valider').click()

    // attente affichage "Type(s) de paiement"
    await page.locator('#popup-cashless', { hasText: 'Types de paiement' }).waitFor({ state: 'visible' })

    // payer en espèces + confirmation
    if (paiement === undefined || paiement === 'espece') {
      await page.locator('#popup-cashless bouton-basique >> text=ESPÈCE').click()
      await confirmation(page, 'espece', sommeDonnee)
    }

    // payer par CB + confirmation
    if (paiement === 'cb') {
      await page.locator('#popup-cashless bouton-basique >> text=CB').click()
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
    const monnaie = await getTranslate(page, 'currencySymbol')

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
    const monnaie = await getTranslate(page, 'currencySymbol')

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
    // nombre de ligne de l'addition
    await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb')).toHaveCount(list.length)
    // articles de l'addition identique à liste articles
    for (const listKey in list) {
      const article = list[listKey]
      await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: article.nom }).locator('.addition-col-qte')).toHaveText(article.nb.toString())
      await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: article.nom }).locator('.addition-col-produit div')).toHaveText(article.nom)
      await expect(page.locator('#addition-liste-deja-paye .BF-ligne-deb', { hasText: article.nom }).locator('.addition-col-prix div')).toHaveText(article.prix.toString() + '€')
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
    showPrices: boolean
  }*/

  let page
  await test.step(`Configurer point ventes:`, async () => {
    // connexion admin
    const browser = await chromium.launch()
    page = await browser.newPage()
    await page.goto(env.domain + env.adminLink)

    await page.locator('#id_password').fill(env.adminPassword)
    await page.locator('#id_username').fill(env.adminUser)
    await page.locator('input[type="submit"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // 2 cliques sur menu burger
    await page.locator('a[class="sidebar-header-menu sidebar-toggle"]').dblclick()

    // attendre fin utilisation réseau    // moyen de paiement "CASHLESS" présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=CASHLESS')).toBeVisible()
    // Total pour moyen de paiement "CASHLESS" 35.7 €
    await expect(page.locator('#popup-cashless bouton-basique', { hasText: 'CASHLESS' }).locator('.sous-element-texte >> text=TOTAL')).toHaveText('TOTAL 35.7 €')

    // moyen de paiement "ESPECE" présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=ESPECE')).toBeVisible()
    // Total pour moyen de paiement "ESPECE" 35.7 €
    await expect(page.locator('#popup-cashless bouton-basique', { hasText: 'ESPECE' }).locator('.sous-element-texte >> text=TOTAL')).toHaveText('TOTAL 35.7 €')

    // moyen de paiement "CB" présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=CB')).toBeVisible()
    // Total pour moyen de paiement "CB" 35.7 €
    await expect(page.locator('#popup-cashless bouton-basique', { hasText: 'CB' }).locator('.sous-element-texte >> text=TOTAL')).toHaveText('TOTAL 35.7 €')

    // bouton RETOUR présent
    await expect(page.locator('#popup-cashless bouton-basique >> text=RETOUR')).toBeVisible()

    // clique sur "ESPECE"
    await page.locator('#popup-cashless bouton-basique >> text=ESPECE').click()

    // confirmation espèce
    await confirmation(page, 'espece')

    // VALIDER
    await page.locator('#popup-confirme-valider').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // séléctionner le poit de ventes
    await page.locator('.results tr th[class="field-name"]').getByText(pointSale).dblclick()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    for (const key in options) {
      // afficher prix
      if (key === 'showPrices') {
        const showPricesIsChecked = await page.locator('#id_afficher_les_prix').isChecked()
        if (showPricesIsChecked !== options[key]) {
          await page.getByText('Afficher les prix').click()
        }
      }

      // Accepte especes
      if (key === 'acceptsCash') {
        const acceptsCashIsChecked = await page.locator('#id_accepte_especes').isChecked()
        if (acceptsCashIsChecked !== options[key]) {
          await page.getByText('Accepte especes').click()
        }
      }

      // Accepte carte bancaire
      if (key === 'acceptsCb') {
        const acceptsCbIsChecked = await page.locator('#id_accepte_carte_bancaire').isChecked()
        if (acceptsCbIsChecked !== options[key]) {
          await page.getByText('Accepte carte bancaire').click()
        }
      }

      // service directe
      if (key === 'directService') {
        const directServiceIsChecked = await page.locator('#id_service_direct').isChecked()
        if (directServiceIsChecked !== options[key]) {
          await page.getByText('Service direct ( vente au comptoir )').click()
        }
      }
    }

    // enregistrer
    await page.locator('input[name="_save"]').click()

    // permet d'attendre la fin des processus réseau
    await page.waitForLoadState('networkidle')

    // message de succès attendu
    await expect(page.locator('.messagelist')).toHaveText(`L'objet Point de vente « ${pointSale} » a été modifié avec succès.`)
  })
}

export const getBackGroundColor = async function (page, selector) {
  return await page.evaluate(async ([selector]) => {
    return document.querySelector(selector).style.backgroundColor
  }, [selector])
}

export const getTranslate = async function (page, indexTrad, option) {
  return await page.evaluate(async ([indexTrad, option]) => {
    return getTranslate(indexTrad, option)
  }, [indexTrad, option])
}


export const getLocale = async function (page) {
  return await page.evaluate(async () => {
    return getLanguages().find(item => item.language === localStorage.getItem("language")).locale
  })
}

export const checkListArticlesOk = async function (page, list) {
  await test.step('List articles ok.', async () => {
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
      if (compListe.nom === articleNom && compListe.nb === articleNb && (compListe.prix.toString() + ' €') === articlePrix) {
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
    return {articles, locationId}
  }, [room])
}

/**
 * Affiche la valeur d'un décimal
 * @param value un décimal Big https://github.com/MikeMcl/big.js
 * @returns {number}
 */
export function bigToFloat (value) {
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
export function totalListeArticles (list) {
  let total = new Big(0)
  for (let i = 0; i < list.length; i++) {
    const article = list[i]
    total = total.plus(new Big(article.prix).times(article.nb))
  }
  return parseFloat(total.valueOf())
}
