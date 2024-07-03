# Playwright

## Installation nodejs (par volta)
. Installation de volta

```
curl https://get.volta.sh | bash
```
. Sortir du terminal et relancer le   
. Aller à la racine du projet
```
volta pin node@18.12.1
```


## Configuration (playwright.config.js)
Configurer pour lancer les tests les uns après les autres (0010-xxx.test.js puis 0020-xxx.test.js puis ...)

### Dossier des tests :
./tests

### Nom des fichiers de test :
00xx-xxxxxx.test.js

## Autoriser docker à utiliser x11 :
```
sudo xhost +local:docker
```

## Lancer le conteneur playwright
```
cd playwright
# launch container
docker compose up -d
# use container
docker exec -ti playwright bash
```

## lancer un test
```
npx playwright test tests/cashless_sans_user_agent/0010-carte-nfc.test.js
```

Utiliser X11 de l'hote (npx ... --headed):
```
sudo xhost +local:docker
```
