# Séance 5 – QR : Plan de tests et critères de qualité

## Question

> Les tests doivent répondre aux critères de qualité du produit. Un plan clair doit être établi pour justifier l'usage des différents tests et les critères de validation : à quel moment considérons-nous que la qualité est assurée ?

---

## Plan de tests du projet MFA

### Pyramide des tests appliquée

| Niveau          | Outil            | Fichiers                           | Ce que ça couvre                                                    |
| --------------- | ---------------- | ---------------------------------- | ------------------------------------------------------------------- |
| **Unitaires**   | Jest             | `*.spec.ts` (utilitaires)          | Logique métier isolée : calcul de distance, validation JWT, hashage |
| **Intégration** | Jest + Supertest | `addresses.spec.ts`, `app.spec.ts` | Endpoints HTTP complets avec BDD réelle (SQLite de test)            |
| **E2E**         | Playwright       | `e2e/auth.spec.ts`                 | Parcours utilisateur réels : inscription → connexion → dashboard    |

### Déclenchement CI (`.github/workflows/tests.yml`)

Les tests d'intégration (Jest) et le typecheck TypeScript sont exécutés automatiquement à chaque **push** et **pull request** sur `master`.

---

## Critères de validation — quand la qualité est-elle assurée ?

La qualité est considérée comme assurée lorsque **les trois conditions suivantes sont réunies** :

**1. Tous les tests passent**

- `yarn test` → 0 échec (tests unitaires + intégration)
- `npx playwright test` → 0 échec (tests E2E sur le parcours authentification + adresses)

**2. Le coverage atteint les seuils définis**

- ≥ **80 % de couverture de lignes** sur le code serveur (`src/`)
- Les chemins critiques (auth, CRUD adresses, recherche par rayon) sont couverts à **100 %**

**3. Le typage est valide**

- `npx tsc --noEmit` → 0 erreur (vérification statique des types TypeScript)

---

## Justification du choix des tests

- **Tests d'intégration prioritaires** : dans une API REST simple, le controller _est_ la logique. Tester l'endpoint HTTP complet (avec BDD) donne la meilleure couverture au meilleur ratio effort/valeur.
- **Tests unitaires ciblés** : sur les fonctions pures uniquement (ex. calcul de distance haversine, helpers JWT) où les cas limites sont nombreux et ne nécessitent pas de BDD.
- **Tests E2E limités** : couvrent uniquement les scénarios utilisateur critiques (auth flow) car ils sont lents et fragiles. On évite de tester la logique métier à ce niveau.
