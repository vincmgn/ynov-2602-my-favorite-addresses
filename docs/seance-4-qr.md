# Séance 4 – QR : Code coverage de l'API lors des tests E2E

## Question

> Trouvez une solution pour obtenir le code coverage de l'API lors de l'exécution des tests E2E.

---

## Problème

Playwright et le serveur Express tournent dans des **processus séparés**. Les outils classiques (Jest `--coverage`) ne voient pas le code exécuté côté serveur. Il faut instrumenter le serveur et récupérer sa couverture depuis l'extérieur.

---

## Solution : endpoint `/__coverage__` + `nyc`

**1. Exposer les données de couverture dans `app.ts`**

```typescript
if (process.env.NODE_ENV === "e2e") {
  app.get("/__coverage__", (_, res) => res.json({ coverage: (global as any).__coverage__ ?? {} }));
}
```

**2. Démarrer le serveur instrumenté**

```bash
NODE_ENV=e2e npx nyc ts-node src/index.ts
```

**3. Collecter après les tests — `e2e/global-teardown.ts`**

```typescript
import { request } from "@playwright/test";
import * as fs from "fs";

export default async function () {
  const ctx = await request.newContext();
  const { coverage } = await (await ctx.get("http://localhost:8080/__coverage__")).json();
  fs.mkdirSync(".nyc_output", { recursive: true });
  fs.writeFileSync(".nyc_output/coverage-e2e.json", JSON.stringify(coverage));
  await ctx.dispose();
}
```

```typescript
// playwright.config.ts
globalTeardown: "./e2e/global-teardown.ts",
```

**4. Générer le rapport**

```bash
npx nyc report --reporter=html --report-dir=coverage-e2e
```

---

## Conclusion

`nyc` instrumente le serveur et stocke la couverture en mémoire via `global.__coverage__`. L'endpoint `/__coverage__` permet à Playwright de la récupérer en fin de suite. Le rapport est ensuite généré avec `nyc report`. L'endpoint est conditionné à `NODE_ENV=e2e` : il est invisible en production.
