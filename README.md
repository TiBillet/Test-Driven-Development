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


### Test

#### créer le réseau "frontend" pour l'environnement de dev
```bash
docker network create frontend
```

#### modifier la variable ROOT_PATH dans le script star_dev
exemple: ROOT_PATH="/media/travail/developpement/gits/Test-Driven-Development/"

#### Vérifier que vos fichiers d'env sont correctes

#### Supprimer les sessions byobu / tmux 
```bash
tmux kill-server
```

#### Lancer l'environnement de dev (dans le dossier Test-Driven-Development)
```bash
./start_dev
```

#### Playright test
This is the end to end test, with a headless chrome :
```bash
# in playwright container
docker exec -ti playwright bash
npm i
clear && npx playwright test tests/laboutik/
# think install the requested dependencies and restart the previus command
```

#### Relancer l'environnement de dev
- Ctrl + c
- tmux kill-server
- ./start_dev

#### Si problèmes docker (pour une nouvelle installation des containers de dev)
```bash
docker system prune -a
```
- Relancer l'étape Test

#### Python Test
Flush the 3 container and run `./manage.py test` on the `laboutik_django` container
