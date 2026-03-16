import request from "supertest";
import app from "./app";
import datasource from "./datasource";
import { faker } from "@faker-js/faker";

describe("User Registration Validation", () => {
  beforeAll(async () => {
    if (!datasource.isInitialized) {
      await datasource.initialize();
    }
  });

  afterAll(async () => {
    if (datasource.isInitialized) {
      await datasource.destroy();
    }
  });

  test("should return 400 if email is already taken", async () => {
    const email = faker.internet.email();
    const password = "password123";

    // Create first user
    await request(app).post("/api/users").send({ email, password });

    // Try to create second user with same email
    const response = await request(app).post("/api/users").send({
      email,
      password: "differentPassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("email already taken");
  });

  test("should return 400 if email format is invalid", async () => {
    const payloads = [
      { email: "invalid-email", password: "password123" },
      { email: "test@", password: "password123" },
      { email: "@domain.com", password: "password123" },
      { email: "test@domain", password: "password123" },
    ];

    for (const payload of payloads) {
      const response = await request(app).post("/api/users").send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("invalid email format");
    }
  });
});
