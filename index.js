import express, { json } from "express";
import { v4 as uuid } from "uuid";
import users from "./users.json";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Validator } from "./helpers/validator";

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
        userName: req.body.name,
        password: bcrypt.hashSync(req.body.password, 8),
        preferences: req.body.preferences,
      };
      users.push(user);
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      return res.status(200).json({ message: validatorResponse.message });
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
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/preferences", (req, res) => {});

app.put("/preferences", (req, res) => {});

app.get("/news", (req, res) => {});

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error occured cant start the server");
  } else {
    console.log("Server started successfully");
  }
});
