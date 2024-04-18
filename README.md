# Test-Driven-Development

ToDo list for dev TiBillet with us !

## Installation

First, create a folder and clone this repos :

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

Create the .env file with your own domain if needed :

```bash
cp env_example .env
```

launch the rocket !

```bash
docker compose up -d
docker compose logs -f
```