# Playwright Docker

## Lancement de l'environnement de dev :
 En local.   
 .../Test-Driven-Development/start_env_dev

## Lancement des tests laboutik
Dans .../Test-Driven-Development/playwright/
```
docker exec -ti playwright bash
# une dans le conteneur
# instalation des dépendences
npm i
# lancement des tests laboutik
npx playwright test tests/laboutik/
```

## Relancer de l'environnement de dev avant chaque test:
Dans l'un des terminaux de developpement:   
- ctrl + c
- tmux kill-server
- .../Test-Driven-Development/start_env_dev

# Playwright developpement de test en local

## Installer playwright
Dans .../Test-Driven-Development/playwright/
```
npm i
npx playwright install
```

### Tests LaBoutik (avec l'interface du navigateur)
```
cd playwright
npx playwright test tests/laboutik/ --headed

```

## Attention
Avant de lancer des tests vous devez remettre à zéro les db fedow/lespass et laboutik

## Infos
projet configurer pour chromium / project configure for chromium

### Dossier des tests :
./tests

### Nom des fichiers de test :
00xx-xxxxxx.test.js