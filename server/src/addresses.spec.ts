import { faker } from "@faker-js/faker";
import request from "supertest";
import app from "./app";
import datasource from "./datasource";
import { User } from "./entities/User";
import { Address } from "./entities/Address";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Addresses Controller Integration Tests", () => {
  const userEmail = faker.internet.email();
  const userPassword = faker.internet.password();
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    if (!datasource.isInitialized) {
      await datasource.initialize();
    }

    // Create a user and get a token
    await request(app).post("/api/users").send({
      email: userEmail,
      password: userPassword,
    });

    const loginRes = await request(app).post("/api/users/tokens").send({
      email: userEmail,
      password: userPassword,
    });
    authToken = loginRes.body.token;

    const user = await User.findOneBy({ email: userEmail });
    userId = user!.id;
  });

  afterAll(async () => {
    const user = await User.findOneBy({ email: userEmail });
    if (user) {
      await Address.delete({ user: { id: user.id } });
      await user.remove();
    }

    if (datasource.isInitialized) {
      await datasource.destroy();
    }
  });

  describe("POST /api/addresses", () => {
    test("should return 400 if name or searchWord is missing", async () => {
      const response = await request(app).post("/api/addresses").set("Authorization", `Bearer ${authToken}`).send({ name: "Work" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("name and search word are required");
    });

    test("should create an address successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          features: [
            {
              geometry: {
                coordinates: [2.3522, 48.8566],
              },
            },
          ],
        },
      });

      const response = await request(app).post("/api/addresses").set("Authorization", `Bearer ${authToken}`).send({ name: "Paris", searchWord: "Paris", description: "City of Light" });

      expect(response.status).toBe(200);
      expect(response.body.item.name).toBe("Paris");
      expect(response.body.item.lng).toBe(2.3522);
      expect(response.body.item.lat).toBe(48.8566);
    });

    test("should return 404 if search word not found", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { features: [] },
      });

      const response = await request(app).post("/api/addresses").set("Authorization", `Bearer ${authToken}`).send({ name: "Unknown", searchWord: "asdfghjkl" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("search word not found");
    });
  });

  describe("GET /api/addresses", () => {
    test("should retrieve user addresses", async () => {
      const response = await request(app).get("/api/addresses").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/addresses/searches", () => {
    test("should return 400 for invalid radius", async () => {
      const response = await request(app)
        .post("/api/addresses/searches")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ radius: -1, from: { lat: 48, lng: 2 } });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("radius is required, must be a positive number");
    });

    test("should return 400 for invalid from object", async () => {
      const response = await request(app)
        .post("/api/addresses/searches")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ radius: 10, from: { lat: "invalid" } });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("from object must contain lat and lng props, both numbers");
    });

    test("should find addresses within radius", async () => {
      // We already have Paris at (2.3522, 48.8566)
      const response = await request(app)
        .post("/api/addresses/searches")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          radius: 10,
          from: { lat: 48.85, lng: 2.35 },
        });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items.some((a: any) => a.name === "Paris")).toBe(true);
    });

    test("should not find addresses outside radius", async () => {
      const response = await request(app)
        .post("/api/addresses/searches")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          radius: 1,
          from: { lat: 48.0, lng: 2.0 }, // Far from Paris
        });

      expect(response.status).toBe(200);
      expect(response.body.items.filter((a: any) => a.name === "Paris").length).toBe(0);
    });
  });
});
