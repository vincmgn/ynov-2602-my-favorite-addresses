# Séance 6 – QR

## Question 1

> Réfléchissez à une autre fonctionnalité à qui devra être développée par un·e collègue, écrivez les tests Bruno sans développer la fonctionnalité.

---

## Collaboration et TDD API : La fonctionnalité "Tags"

Pour permettre à un·e collègue de développer la fonctionnalité de **marquage des adresses (Tags)**, j'ai préparé les tests d'intégration API (Bruno/YAML) avant même l'implémentation.

### Pourquoi cette fonctionnalité ?

L'application permet d'ajouter beaucoup d'adresses. Sans catégories (Tags), il devient difficile de s'y retrouver. Permettre d'ajouter des étiquettes comme "Favori", "À tester" ou "Pro" améliore grandement l'organisation.

### Guide pour le/la collègue (Spécification par les tests)

Les tests se trouvent dans le dossier `MFP/Tags/`. Le/la collègue devra faire passer ces deux requêtes au vert :

1. **`Add Tag.yml`** : Doit permettre d'ajouter un tag via `POST /api/addresses/:id/tags`.
2. **`Delete Tag.yml`** : Doit permettre de retirer un tag via `DELETE /api/addresses/:id/tags/:tagName`.

**Livrables attendus :**

- Mise à jour de l'entité `Address` pour stocker les tags.
- Création de la route correspondante dans `server/src/controllers/`.
- Gestion des erreurs (ex: tag déjà existant, adresse introuvable).

En fournissant les tests en amont, on s'assure que le développement respecte exactement le contrat d'interface (API Contract) défini, facilitant ainsi l'intégration future avec le frontend.

---

## Question 2

> Faites au moins 1 Codewars. Comment les tests sont utilisés dans la résolution d'algos Codewars ?

---

## Kata — "Twice as old" (8 kyu — facile)

Calculer de combien d'années le père était (ou sera) deux fois plus âgé que son fils.  
La réponse est toujours ≥ 0.

Exemples : `twiceAsOld(45, 5) → 35`, `twiceAsOld(42, 21) → 0`, `twiceAsOld(29, 0) → 29`

### 🔴 Red — tests d'abord

```typescript
import { twiceAsOld } from "./twiceAsOld";

describe("twiceAsOld", () => {
  test("45, 5  → 35", () => expect(twiceAsOld(45, 5)).toBe(35));
  test("55, 30 → 5", () => expect(twiceAsOld(55, 30)).toBe(5));
  test("42, 21 → 0", () => expect(twiceAsOld(42, 21)).toBe(0));
  test("29, 0  → 29", () => expect(twiceAsOld(29, 0)).toBe(29));
});
```

→ 4 tests en échec, la fonction n'existe pas encore.

### 🟢 Green — les tests révèlent la formule

En lisant les cas, on déduit :  
`dad - x = 2 × (son - x)` → `x = dad - 2×son` (peut être négatif → `Math.abs`)

```typescript
export function twiceAsOld(dad: number, son: number): number {
  return Math.abs(dad - 2 * son);
}
```

→ 4 tests en succès ✅ — 1 ligne, aucun over-engineering.

---

## Comment les tests guident la résolution

Sur Codewars, les tests fournis sont la **spécification exécutable** de la fonction :

1. **Lire les tests** → identifier les cas attendus et les cas limites (ici : `son = 0`, père déjà exactement 2× plus vieux)
2. **Coder** → faire passer les tests (phase "Green")
3. **Ajouter ses propres cas** → ex. valeurs négatives, grands écarts d'âge (phase "Refactor")
4. **Soumettre** → les tests cachés de Codewars valident la robustesse finale

Ici, les tests révèlent directement la formule mathématique : sans eux, on aurait pu écrire une solution naïve avec des boucles. **La solution découle des tests, pas l'inverse.**
