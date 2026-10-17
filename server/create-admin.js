
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid ADMIN_EMAIL is required.");
  }

  if (!password || password.length < 12) {
    throw new Error("Admin password must be at least 12 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email, passwordHash]
  );

  console.log("Administrator created successfully.");
  console.log("Admin ID:", result.rows[0].id);
  console.log("Admin email:", result.rows[0].email);
  console.log("Created at:", result.rows[0].created_at);
}

createAdmin()
  .catch((error) => {
    if (error.code === "23505") {
      console.error("An administrator with this email already exists.");
    } else {
      console.error("Could not create administrator:", error.message);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
