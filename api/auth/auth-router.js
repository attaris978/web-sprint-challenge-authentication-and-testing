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
});

module.exports = router;
