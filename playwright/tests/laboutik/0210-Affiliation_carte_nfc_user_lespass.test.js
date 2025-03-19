// LaBoutik: DEBUG=1 / DEMO=1; language = en
import { test, expect } from '@playwright/test'
import { env } from '../../mesModules/env.js'

// attention la taille d'écran choisie affiche le menu burger
let page, directServiceTrans, transactionTrans, okTrans, totalTrans, currencySymbolTrans, cbTrans
let paiementTypeTrans, confirmPaymentTrans, membershipTrans, cashTrans, returnTrans
const language = "en"

test.use({ viewport: { width: 1200, height: 1200 }, ignoreHTTPSErrors: true })

// TODO: test Affiliation carte nfc avec un user de lespass à faire
test.describe.skip("Affiliation carte nfc avec un user de lespass", () => {
  // 
})
