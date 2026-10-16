
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Suvidha IPR Services API",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Suvidha IPR Services backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Suvidha API running at http://localhost:${PORT}`);
});
