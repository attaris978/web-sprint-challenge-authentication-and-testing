const router = require("express").Router();
require('dotenv');
const auth = require("./auth-middleware");
const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");
const iterations = process.env.HASH_ITERATIONS || 8;
const jotItUp = require('./token');


router.post("/register", auth.validateCreds, auth.checkUserViability, async (req, res, next) => {
  req.body.password = bcrypt.hashSync(req.body.password, iterations);
  try {
    const id = await db("users").insert(req.body);
    const newUser = await db("users").where({ id: id[0] });
    res.status(201).json(newUser[0]);
  } catch (err) {
    next(err);
  }
  /*
  IMPLEMENT
  You are welcome to build additional middlewares to help with the endpoint's functionality.
  DO NOT EXCEED 2^8 ROUNDS OF HASHING!

  1- In order to register a new account the client must provide `username` and `password`:
    {
      "username": "Captain Marvel", // must not exist already in the `users` table
      "password": "foobar"          // needs to be hashed before it's saved
    }

  2- On SUCCESSFUL registration,
    the response body should have `id`, `username` and `password`:
    {
      "id": 1,
      "username": "Captain Marvel",
      "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
    }

  3- On FAILED registration due to `username` or `password` missing from the request body,
    the response body should include a string exactly as follows: "username and password required".

  4- On FAILED registration due to the `username` being taken,
    the response body should include a string exactly as follows: "username taken".
*/
}
);

router.post("/login", auth.validateCreds, async (req, res, next) => {
  const {username, password} = req.body;
  try {
    const user = await db('users').where({username});
      if (user.length > 0 && bcrypt.compareSync(password, user[0].password)) {
        const confirmedUser = user[0];
        const token = jotItUp(confirmedUser);
        res.status(200).json({message: `welcome, ${confirmedUser.username}`, token})
      } else res.status(401).json({message: "invalid credentials"})
  }
  catch(err) {
    next(err)
  }  
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
