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

  // Second user to test cross-ownership (403 cases)
  const otherUserEmail = faker.internet.email();
  const otherUserPassword = faker.internet.password();
  let otherAuthToken: string;

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

    // Create second user
    await request(app).post("/api/users").send({
      email: otherUserEmail,
      password: otherUserPassword,
    });
    const otherLoginRes = await request(app).post("/api/users/tokens").send({
      email: otherUserEmail,
      password: otherUserPassword,
    });
    otherAuthToken = otherLoginRes.body.token;
  });

  afterAll(async () => {
    const user = await User.findOneBy({ email: userEmail });
    if (user) {
      await Address.delete({ user: { id: user.id } });
      await user.remove();
    }

    const otherUser = await User.findOneBy({ email: otherUserEmail });
    if (otherUser) {
      await Address.delete({ user: { id: otherUser.id } });
      await otherUser.remove();
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

  describe("DELETE /api/addresses/:id", () => {
    let addressToDeleteId: number;
    let addressOwnedByOtherUserId: number;

    beforeAll(async () => {
      // Create an address owned by the main user
      mockedAxios.get.mockResolvedValue({
        data: {
          features: [{ geometry: { coordinates: [2.3522, 48.8566] } }],
        },
      });

      const res = await request(app).post("/api/addresses").set("Authorization", `Bearer ${authToken}`).send({ name: "Address To Delete", searchWord: "Paris" });
      addressToDeleteId = res.body.item.id;

      // Create an address owned by the OTHER user
      const otherRes = await request(app).post("/api/addresses").set("Authorization", `Bearer ${otherAuthToken}`).send({ name: "Other User Address", searchWord: "Paris" });
      addressOwnedByOtherUserId = otherRes.body.item.id;
    });

    test("should delete an address that belongs to the current user", async () => {
      const response = await request(app).delete(`/api/addresses/${addressToDeleteId}`).set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Confirm it's really gone
      const deleted = await Address.findOneBy({ id: addressToDeleteId });
      expect(deleted).toBeNull();
    });

    test("should return 404 when deleting a non-existent address", async () => {
      const response = await request(app).delete("/api/addresses/99999").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("address not found");
    });

    test("should return 403 when deleting an address owned by another user", async () => {
      const response = await request(app).delete(`/api/addresses/${addressOwnedByOtherUserId}`).set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("forbidden");
    });
  });

  describe("PUT /api/addresses/:id", () => {
    let addressToUpdateId: number;
    let addressOwnedByOtherUserId: number;

    beforeAll(async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          features: [{ geometry: { coordinates: [2.3522, 48.8566] } }],
        },
      });

      // Create an address owned by the main user
      const res = await request(app).post("/api/addresses").set("Authorization", `Bearer ${authToken}`).send({ name: "Address To Update", searchWord: "Paris", description: "Old description" });
      addressToUpdateId = res.body.item.id;

      // Create an address owned by the OTHER user
      const otherRes = await request(app).post("/api/addresses").set("Authorization", `Bearer ${otherAuthToken}`).send({ name: "Other User Address For PUT", searchWord: "Paris" });
      addressOwnedByOtherUserId = otherRes.body.item.id;
    });

    test("should update name and description of an address that belongs to the current user", async () => {
      const response = await request(app).put(`/api/addresses/${addressToUpdateId}`).set("Authorization", `Bearer ${authToken}`).send({ name: "Updated Name", description: "New description" });

      expect(response.status).toBe(200);
      expect(response.body.item.name).toBe("Updated Name");
      expect(response.body.item.description).toBe("New description");
    });

    test("should return 404 when updating a non-existent address", async () => {
      const response = await request(app).put("/api/addresses/99999").set("Authorization", `Bearer ${authToken}`).send({ name: "Whatever" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("address not found");
    });

    test("should return 403 when updating an address owned by another user", async () => {
      const response = await request(app).put(`/api/addresses/${addressOwnedByOtherUserId}`).set("Authorization", `Bearer ${authToken}`).send({ name: "Hacked name" });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("forbidden");
    });

    test("should return 400 when body has no valid fields to update", async () => {
      const response = await request(app).put(`/api/addresses/${addressToUpdateId}`).set("Authorization", `Bearer ${authToken}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("at least one field (name or description) is required");
    });
  });
});
