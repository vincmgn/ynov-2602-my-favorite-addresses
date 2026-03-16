# My Favorite Addresses

Application web permettant de sauvegarder et gérer ses adresses favorites avec visualisation sur carte.

## Architecture

Le projet est composé de deux parties :

- **Server** : API REST Node.js avec Express, TypeORM et SQLite
- **Client** : Application Nuxt 4 avec Vue 3, Pinia et Leaflet

## Fonctionnalités

- Authentification utilisateur (inscription/connexion) avec JWT
- Gestion des adresses favorites (CRUD)
- Géolocalisation des adresses via recherche textuelle
- Recherche d'adresses dans un rayon donné
- Visualisation des adresses sur une carte interactive (Leaflet)

## Prérequis

- Node.js >= 20
- Yarn

## Installation

### Server

```bash
cd server
yarn install
```

### Client

```bash
cd client
yarn install
```

## Lancement

### Server (mode développement)

```bash
cd server
yarn dev
```

Le serveur démarre sur `http://localhost:3000` par défaut.

### Client (mode développement)

```bash
cd client
yarn dev
```

L'application cliente démarre sur `http://localhost:3001` par défaut.

## Tests

### Lancer les tests unitaires

```bash
cd server
yarn test
```

### Lancer les tests E2E avec interface graphique (Playwright)

```bash
cd server
yarn playwright test --ui
```

## API Endpoints

### Users

| Méthode | Route             | Description                  | Auth |
|---------|-------------------|------------------------------|------|
| POST    | `/users`          | Créer un utilisateur         | Non  |
| POST    | `/users/tokens`   | Se connecter (obtenir token) | Non  |
| GET     | `/users/me`       | Récupérer l'utilisateur courant | Oui |

### Addresses

| Méthode | Route               | Description                          | Auth |
|---------|---------------------|--------------------------------------|------|
| GET     | `/addresses`        | Lister les adresses de l'utilisateur | Oui  |
| POST    | `/addresses`        | Créer une nouvelle adresse           | Oui  |
| POST    | `/addresses/searches` | Rechercher les adresses dans un rayon | Oui |

## Stack Technique

### Server

- Express 5
- TypeORM
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- Argon2 (hachage des mots de passe)
- Jest + Supertest (tests)
- TypeScript

### Client

- Nuxt 4
- Vue 3
- Pinia (state management)
- Tailwind CSS
- Leaflet (cartographie)
- TypeScript

## CI/CD

Le projet utilise GitHub Actions pour l'intégration continue :

- Exécution des tests unitaires sur chaque push/PR vers `master`
- Vérification TypeScript (typecheck)

## Structure du Projet

```
.
├── client/                 # Application Nuxt
│   ├── app/
│   │   ├── components/     # Composants Vue
│   │   ├── layouts/        # Layouts Nuxt
│   │   ├── pages/          # Pages de l'application
│   │   ├── plugins/        # Plugins Nuxt
│   │   └── stores/         # Stores Pinia
│   └── nuxt.config.ts
├── server/                 # API Express
│   ├── src/
│   │   ├── controllers/    # Controllers (routes)
│   │   ├── entities/       # Entités TypeORM
│   │   ├── utils/          # Utilitaires
│   │   ├── app.ts          # Configuration Express
│   │   ├── datasource.ts   # Configuration TypeORM
│   │   └── index.ts        # Point d'entrée
│   └── package.json
└── .github/
    └── workflows/          # GitHub Actions
```

## Licence

MIT
