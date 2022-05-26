const request = require("supertest");
const server = require("./server");
const bcrypt = require('bcryptjs');
const token = require('../api/auth/token');
const jwt = require('jsonwebtoken');

const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
afterAll(async () => {
  await db("users").truncate();
  await db.destroy();
});

describe("Testing registration endpoint process", () => {
  it("server rejects registration post missing password", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "bob", password: "" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe("username and password required");
  });

  it("server rejects registration post missing username", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe("username and password required");
  });

  it("properly formatted registration post returns newly created user with hashed password", async () => {
    await db("users").truncate();
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "bobby", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(201);
    expect(response.body.id).not.toBeNull();
    expect(response.body.username).toBe("bobby");
    expect(response.body.password).not.toBeNull();
    expect(response.body.password).not.toEqual("test");    
  });

  it("server trims whitespace from submitted username", async () => {
    await db("users").truncate();
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "  bobby  ", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(201);
    expect(response.body.id).not.toBeNull();
    expect(response.body.username).toBe("bobby");    
  });

  it("server rejects registration when username is already used", async () => {
    await db("users").truncate();
    await db('users').insert({username:"bobby", password:"test"});
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "  bobby  ", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("username taken");    
  });
})