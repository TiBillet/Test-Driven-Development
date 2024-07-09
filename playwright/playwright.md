# Playwright
projet configurer pour chromium / project configure for chromium

### Dossier des tests :
./tests

### Nom des fichiers de test :
00xx-xxxxxx.test.js

## Lancer le conteneur playwright
```
cd playwright
# launch container
docker compose up -d
# use container
docker exec -ti playwright bash
```

## lancer les tests
```
npx playwright test tests/laboutik/
```
