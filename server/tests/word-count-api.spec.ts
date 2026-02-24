import request from "supertest";
import app from "./word-count-api";

describe("Word Count API Integration Test", () => {
  test("POST /count should return the number of occurrences of a word in a text", async () => {
    const payload = {
      text: "Le chat mange la souris, le chat dort, le chat est heureux.",
      word: "chat",
    };

    const response = await request(app).post("/count").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 3 });
  });

  test("POST /count should return 0 if the word is not found", async () => {
    const payload = {
      text: "Bonjour tout le monde",
      word: "maison",
    };

    const response = await request(app).post("/count").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 0 });
  });
});

// Selon vous, pour ce cas précis, quelles sont les différences entre tester le
// controller avec un test d'intégration, ou tester la fonction de recherche avec des
// tests unitaires ? Quelle conclusion en tirez-vous ?

// Test d'intégration (Controller) : Vérifie tout le circuit (URL, parsing du JSON, status codes). C'est le plus complet pour garantir que l'API fonctionne pour le client.
// Test unitaire (Logique pure) : Vérifie uniquement l'algorithme (la regex). C'est beaucoup plus rapide et précis pour tester des cas complexes (accents, majuscules, vide).
// Conclusion : Pour cette mini API, l'intégration suffit. Dans un vrai projet, on blinde l'algorithme avec de l'unitaire et on valide le branchement avec un peu d'intégration.
