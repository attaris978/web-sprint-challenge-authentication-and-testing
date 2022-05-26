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



describe("Testing login endpoint", () => {
  it("server rejects login missing password", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "bob", password: ""})
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe("username and password required");
  });

  it("server rejects login missing username", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe("username and password required");
  });

  it("server rejects login for nonexistent username with properly ambiguous message", async () => {
    await db("users").truncate();
    await db('users').insert({username:"bobby", password:"test"});
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "bobby", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("invalid credentials");
  });

  it("server rejects login for incorrect password with properly ambiguous message", async () => {
    await db("users").truncate();
    await db('users').insert({username:"bobby", password:"test"});
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "bobby", password: "tesst" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("invalid credentials");    
  });

  it("server returns welcome message at successful login", async () => {
    await db("users").truncate();
    const passHash = await bcrypt.hashSync("test", 8);
    await db('users').insert({username:"bobby", password: passHash});
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "bobby", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("welcome, bobby");    
  });

  it("server returns welcome message and token at successful login", async () => {
    await db("users").truncate();
    const passHash = await bcrypt.hashSync("test", 8);
    await db('users').insert({username:"bobby", password: passHash});
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "bobby", password: "test" })
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("welcome, bobby");
    expect(response.body.token).not.toBeNull()    
  });
})



describe('Testing jokes endpoint', () => {
  const jot = token({id: 1, username: "bobby"});
  it("server rejects jokes access w/o authorization header", async () => {
    const response = await request(server)
    .get('/api/jokes')
    .set("Accept", "application/json")    
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("token required");
  })

  it("server rejects jokes access w/o invalid authorization header", async () => {
    const response = await request(server)
    .get('/api/jokes')
    .set("Accept", "application/json")
    .set("authorization", "ThisIsNotAValidAuthToken")
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("token invalid");
  })

  it("server returns array of 3 jokes w/ correct authorization header", async () => {
    const response = await request(server)
    .get('/api/jokes')
    .set("Accept", "application/json")
    .set("authorization", jot)
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(3);
  })

  it("server rejects jwt that is past expiration", async () => {
    const deadJot = jwt.sign({"sub":"testSubject", "exp": Date.now() / 1000}, "testSecret");
    const response = await request(server)
    .get('/api/jokes')
    .set("Accept", "application/json")
    .set("authorization", deadJot)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("token invalid")
  })
})



describe('End-to-End testing of api', () => {
  it('Registration followed by login followed by jokes endpoint access returns jokes array', async () => {
    db('users').truncate();
    await request(server)
    .post('/api/auth/register')
    .set("Accept", "application/json")
    .send({ username: "bobby", password: "test" });
    const response = await request(server)
    .post('/api/auth/login')
    .set("Accept", "application/json")
    .send({ username: "bobby", password: "test" });
    const jokes = await request(server)
    .get('/api/jokes')
    .set("Accept", "application/json")
    .set("authorization", response.body.token);
    expect(jokes.statusCode).toBe(200);
    expect(Array.isArray(jokes.body)).toBeTruthy();
    expect(jokes.body.length).toBe(3);    
  })
})