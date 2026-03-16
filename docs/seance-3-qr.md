# Séance 3 – QR : Tests d'intégration vs Tests unitaires

## Question

> Quelles sont les différences entre tester le controller avec un test d'intégration, ou tester la fonction de recherche avec des tests unitaires ? Quelle conclusion en tirez-vous ?

---

## Comparaison

| Critère                | Test d'intégration (controller)                   | Test unitaire (fonction de recherche)        |
| ---------------------- | ------------------------------------------------- | -------------------------------------------- |
| **Périmètre**          | Toute la stack : HTTP → auth → controller → BDD   | Uniquement la logique de calcul de distance  |
| **Dépendances**        | BDD réelle, serveur HTTP (`supertest`), token JWT | Aucune (données en dur)                      |
| **Ce qu'on vérifie**   | Status HTTP, corps de la réponse, auth            | Précision mathématique du filtrage par rayon |
| **Vitesse**            | ❌ Lent (init BDD, teardown)                      | ✅ Rapide (millisecondes)                    |
| **Précision des bugs** | ❌ "Quelque chose ne va pas"                      | ✅ "Cette formule est fausse"                |
| **Réalisme**           | ✅ Proche de la production                        | ❌ Artificiel (données mockées)              |
| **Maintenance**        | Casse si la route ou le payload change            | Reste valide si seule l'API change           |

**Exemple concret (notre `addresses.spec.ts`) :** le test d'intégration vérifie que `POST /api/addresses/searches` retourne bien un `200` et que Paris est dans les résultats. Mais si la formule de Haversine est légèrement fausse (rayon de 10 km acceptant des points à 12 km), le test passera quand même — car nos données de test tombent dans la bonne zone.

Un test unitaire sur la fonction de calcul, lui, détecterait cette erreur immédiatement.

---

## Conclusion

Les deux approches sont **complémentaires** :

- Le **test d'intégration** répond à : _"Mon endpoint fonctionne-t-il de bout en bout ?"_
- Le **test unitaire** répond à : _"Ma logique métier est-elle correcte ?"_

La stratégie optimale suit la **pyramide des tests** : beaucoup de tests unitaires (rapides, précis), quelques tests d'intégration (valident l'assemblage), peu de tests E2E (scénarios utilisateur critiques).
