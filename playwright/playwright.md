# Playwright

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
# launch container
docker compose up -d
# use container
docker exec -ti playwright bash
```