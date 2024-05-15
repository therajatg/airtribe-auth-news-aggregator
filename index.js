const express = require("express");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Validator = require("./helpers/validator.js");
const verifyToken = require("./middleware/authJWT.js");
const { users } = require("./users.json");

dotenv.config();
const app = express();
app.use(express.json());
PORT = 8000;

app.post("/register", (req, res) => {
  try {
    const validatorResponse = Validator.validateUserInfo({
      userName: req.body.userName,
      password: req.body.password,
      preferences: req.body.preferences,
    });
    if (validatorResponse.status) {
      const user = {
        id: uuid(),
        userName: req.body.userName,
        password: bcrypt.hashSync(req.body.password, 8),
        preferences: req.body.preferences,
      };
      users.push(user);
      fs.writeFile(
        "./users.json",
        JSON.stringify({ users }),
        { encoding: "utf-8", flag: "w" },
        (err, data) => {
          if (err) {
            return res.status(500).json({ error: "Internal server error" });
          } else {
            return res
              .status(200)
              .json({ message: "User registered successfully" });
          }
        }
      );
    } else {
      return res.status(400).json({ message: validatorResponse.message });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.post("/login", (req, res) => {
  try {
    const userName = req.body.userName;
    const password = req.body.password;
    const foundUser = users.find((user) => user.userName === userName);
    if (foundUser) {
      const isPasswordValid = bcrypt.compareSync(password, foundUser.password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET, {
          expiresIn: 86400,
        });
        return res.status(200).json({
          user: { id: foundUser.id },
          message: "Login successful",
          accessToken: token,
        });
      } else {
        return res.status(401).json({ message: "Invalid Password" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // console.log("error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/preferences", verifyToken, (req, res) => {
  if (req.user) {
    return res.status(200).json({ preferences: req.user.preferences });
  } else {
    return res.status(req.status).json({ message: req.message });
  }
});

app.put("/preferences", verifyToken, (req, res) => {
  if (req.user) {
    const preferencesReceived = req.body.preferences;
    const validatePreferences =
      Validator.validatePreferences(preferencesReceived);
    if (validatePreferences.status) {
      const updatedUsers = users.map((user) =>
        user.id === req.user.id
          ? { ...user, preferences: preferencesReceived }
          : user
      );
      fs.writeFile(
        "./users.json",
        JSON.stringify({ users: updatedUsers }),
        { encoding: "utf-8", flag: "w" },
        (err) => {
          if (err) {
            // console.log("ye wala error", err);
            return res.status(500).json({ error: "Internal Server Error" });
          } else {
            return res
              .status(200)
              .json({ message: "preferences updated successfully" });
          }
        }
      );
    } else {
      return res.status(400).json({ error: validatePreferences.message });
    }
  } else {
    return res.status(req.status).json({ message: req.message });
  }
});

app.get("/news", verifyToken, (req, res) => {
  if (req.user) {
    const allEndpoints = req.user.preferences.map((preference) => {
      return `https://newsapi.org/v2/top-headlines/sources?category=${preference}&apiKey=${process.env.NEWS_API_KEY}`;
    });
    console.log("allEndpoints", allEndpoints);
    Promise.all(allEndpoints.map((endpoint) => fetch(endpoint)))
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((newsData) => res.status(200).json({ newsData }))
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
      });
  } else {
    return res.status(req.status).json({ message: req.message });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error occured cant start the server");
  } else {
    console.log("Server started successfully");
  }
});
