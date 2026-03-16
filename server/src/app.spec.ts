import { faker } from "@faker-js/faker";
import request from "supertest";
import app from "./app";
import datasource from "./datasource";
import { User } from "./entities/User";

describe("MFP App Integration Tests", () => {
  const userEmail = faker.internet.email();
  const userPassword = faker.internet.password();
  let authToken: string;

  beforeAll(async () => {
    if (!datasource.isInitialized) {
      await datasource.initialize();
    }
  });

  afterAll(async () => {
    const user = await User.findOneBy({ email: userEmail });
    if (user) {
      await user.remove();
    }

    if (datasource.isInitialized) {
      await datasource.destroy();
    }
  });

  test("should create a new user account successfully", async () => {
    const payload = {
      email: userEmail,
      password: userPassword,
    };

    const response = await request(app).post("/api/users").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("item");
    expect(response.body.item.email).toBe(userEmail);
    expect(response.body.item).not.toHaveProperty("hashedPassword");
  });

  test("should login successfully and return a token", async () => {
    const payload = {
      email: userEmail,
      password: userPassword,
    };

    const response = await request(app).post("/api/users/tokens").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    authToken = response.body.token;
  });

  test("should retrieve the logged in user profile", async () => {
    const response = await request(app).get("/api/users/me").set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("item");
    expect(response.body.item.email).toBe(userEmail);
  });
});
