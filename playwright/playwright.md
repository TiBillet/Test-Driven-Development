# Playwright Docker

## Lancement de l'environnement de dev / Launching the dev environment
```bash
cd playwright
./start_env
```

## Lancement des tests laboutik / Launch of laboutik tests
Dans .../Test-Driven-Development/playwright/
```bash
# lancement des tests laboutik
docker exec -ti playwright /bin/bash -c "npx playwright test tests/laboutik/"
```

# Developpement de test hors conteneur / Out-of-container test development
Dans / in .../Test-Driven-Development/playwright/

## Installer playwright
```bash
npm i
npx playwright install
```

### Tests LaBoutik (avec l'interface du navigateur / with the browser interface)
```bash
npx playwright test tests/laboutik/ --headed
```

## Attention
Avant de lancer des tests vous devez remettre à zéro les db fedow/lespass et laboutik
```bash
start_env
```


## Infos
Projet configurer pour / Project configure for : 
- chromium
- Lancer les fichiers de test par ordre croissant (nommage si-dessous)   
  Run the test files in ascending order (name given below)

### Dossier des tests / test record:
./tests

### Exemples de nommage des fichiers pour les tests / Examples of file naming for testing
0001-xxxxxxxxdddxxxxxxxxx.test.js   
0002-xxxxxxxxxxxx.test.js   
0010-xxxxxxxxvvvxxxx.test.js   