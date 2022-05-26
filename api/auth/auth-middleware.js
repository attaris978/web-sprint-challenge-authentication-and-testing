const db = require("../../data/dbconfig");

const checkUserViability = async (req, res, next) => {
  const { username } = req.body;  
  try {
    const userSearch = await db("users").where({ username: username.trim() });
    if (userSearch.length === 0) {
      req.body.username = username.trim();
      next();
    } else {
      res.status(409).json({ message: "username taken" });
    }
  } catch (err) {
    next(err);
  }
};

const validateCreds = async (req, res, next) => {
  if (!req.body.username?.length > 0 || !req.body.password?.length > 0) {
    res.status(422).json({ message: "username and password required" });
  } else {
    next();
  }
};

module.exports = {
  checkUserViability,
  validateCreds
};
