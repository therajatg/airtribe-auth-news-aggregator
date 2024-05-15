// import users from "../users.json";
// import jwt from "jsonwebtoken";
const jwt = require("jsonwebtoken");
const { users } = require("../users.json");

const verifyToken = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    jwt.verify(
      req.headers.authorization,
      process.env.API_SECRET,
      (err, decoded) => {
        if (err) {
          req.user = undefined;
          req.message = "Header verification failed";
          req.status = 403;
          next();
        } else {
          const user = users.find((user) => (user.id = decoded.id));
          req.user = user;
          req.message =
            "Found the user successfully, user has valid login token";
          req.status = 200;
          next();
        }
      }
    );
  } else {
    req.user = undefined;
    req.message = "authorization header not found";
    req.status = 401;
    next();
  }
};

module.exports = verifyToken;
