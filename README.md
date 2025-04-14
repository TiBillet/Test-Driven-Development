# Test-Driven-Development

Dev environement installation

## Installation

### First, clone this repos in the same folder :

- https://github.com/TiBillet/Lespass
- https://github.com/TiBillet/Fedow
- https://github.com/TiBillet/LaBoutik
- https://github.com/TiBillet/Test-Driven-Development

```bash
git clone git@github.com:TiBillet/Test-Driven-Development.git
git clone git@github.com:TiBillet/Lespass.git
git clone git@github.com:TiBillet/LaBoutik.git
git clone git@github.com:TiBillet/Fedow.git
```
### Create and fill the .env file on each repo :

```bash
cp env_example .env
```
### Go to Test Drived Development folder and run the main compose

```bash
docker compose up -d
docker compose logs -f # to see the logs
```

### Manual start

Enter on each django container to start the dev server
exemple with Fedow :

```bash
# on host :
docker exec -ti fedow_django bash
# inside the containe :
poetry shell # enter the python venv
./flush.sh # to start from scratch with demo/test data
# or
rsp # alias for python manage.py runserver 0.0.0.0:8000, to start the server if you don't want to flush
```

You have to do the same with : `lespass_django` and `laboutik_django`

## Python Test
Flush the 3 container and run `./manage.py test` on the `laboutik_django` container

## Create network "frontend"
```bash
docker network create frontend
```

## Test Playwright

### Prérequis

#### Vérifier que vos fichiers .env sont correctes

#### Vérifier chaque conteneur(Fedow, Lespass, LaBoutik) est bien construit(build) et se lance correctement
```bash
docker compose build
docker compose up -d
docker compose down
```

#### Ajouter vos dossiers de tests
Dans la méthode all_tests du fichier ./dev_environment_auto/launch_all_tests; exemple :
```bash
echo "- Lancement des test du dossier tests/laboutik/" 
docker exec -ti playwright /bin/bash -c "npx playwright test tests/laboutik/"
# ajouter ici vos dossiers de tests / add your test files here
echo "Lancement tests lespass :"
docker exec -ti playwright /bin/bash -c "npx playwright test tests/lespass/"
```

#### Lancer les tests (dossier racine Test-Driven-Development)
Appliquer la commande "chmod +x" à chaque fichier du dossier ./dev_environment_auto/.  
Faire de même pour ./playwright/start_all_tests, ./playwright/start_env et ./playwright/stop_env 
```bash
cd playwright
# lancement de l'environnement de tests
./start_env
# lance les tests
./start_all_tests
```

#### Si problèmes docker (pour une nouvelle installation des containers de dev)
```bash
docker system prune -a
```
- Relancer l'étape Test Playwright
