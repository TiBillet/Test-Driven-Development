# Playwright Docker

## Lancement de l'environnement de dev :
```bash
cd playwright
./start_env
```

## Lancement des tests laboutik
Dans .../Test-Driven-Development/playwright/
```bash
# lancement des tests laboutik
docker exec -ti playwright /bin/bash -c "npx playwright test tests/laboutik/"
```

# Playwright developpement de test en local
Dans .../Test-Driven-Development/playwright/

## Installer playwright
```bash
npm i
npx playwright install
```

### Tests LaBoutik (avec l'interface du navigateur)
```bash
npx playwright test tests/laboutik/ --headed
```

## Attention
Avant de lancer des tests vous devez remettre à zéro les db fedow/lespass et laboutik
```bash
start_env
```


## Infos
projet configurer pour chromium / project configure for chromium

### Dossier des tests :
./tests

### Exemples de nommage des fichiers pour les tests :
0001-xxxxxx.test.js
0002-xxxxxx.test.js