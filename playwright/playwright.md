# Playwright

## Installer playwright
Dans le dossier playwright
```
npx playwright install
npm install @playwright/test
```

## Lancer les tests avec le visuel du navigateur(sans docker/conteneur) 

### Tests LaBoutik
```
 npx playwright test tests/laboutik/ --headed

```

### Sortie console, Demande d'installation; réponder "y"
```
Need to install the following packages:
playwright@1.51.1
Ok to proceed? (y) y
```


## Docker

### Lancer le conteneur playwright
```
cd playwright
# launch container
docker compose up -d
# use container
docker exec -ti playwright bash
```

### lancer les tests
```
npx playwright test tests/laboutik/
```

## Infos
projet configurer pour chromium / project configure for chromium

### Dossier des tests :
./tests

### Nom des fichiers de test :
00xx-xxxxxx.test.js

## Tests "LesPass" avec le visuel du navigateur(sans docker/conteneur) 
```
npx playwright test tests/lespass/ --headed

```
