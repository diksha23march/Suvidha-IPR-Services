
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

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

app.get("/api/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection successful",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const allowedStatuses = [
  "new",
  "under_review",
  "awaiting_information",
  "in_progress",
  "completed",
  "closed",
];

function validateEnquiry(req, res, fields) {
  const values = {};

  for (const field of fields) {
    const value = req.body?.[field];

    if (typeof value !== "string" || !value.trim()) {
      res.status(400).json({
        success: false,
        message: `${field} is required and must be text.`,
      });
      return null;
    }

    values[field] = value.trim();
  }

  const email = values.email;

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
    return null;
  }

  const limits = {
    applicant_name: 150,
    email: 254,
    phone: 30,
    organization: 200,
    invention_title: 250,
    work_title: 250,
  };

  for (const [field, maxLength] of Object.entries(limits)) {
    const value = req.body?.[field];

    if (
      value !== undefined &&
      value !== null &&
      (typeof value !== "string" || value.length > maxLength)
    ) {
      res.status(400).json({
        success: false,
        message: `${field} must be text with at most ${maxLength} characters.`,
      });
      return null;
    }
  }

  if (
    req.body.phone !== undefined &&
    req.body.phone !== null &&
    typeof req.body.phone !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Phone must be text.",
    });
    return null;
  }

  if (
    req.body.organization !== undefined &&
    req.body.organization !== null &&
    typeof req.body.organization !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Organization must be text.",
    });
    return null;
  }

  return values;
}

app.post("/api/enquiries/patent", async (req, res) => {
  const values = validateEnquiry(req, res, [
    "applicant_name",
    "email",
    "invention_title",
    "invention_summary",
  ]);

  if (!values) return;

  const disclosure = req.body.public_disclosure ?? "unsure";

  if (!["yes", "no", "unsure"].includes(disclosure)) {
    return res.status(400).json({
      success: false,
      message: "Invalid public disclosure selection.",
    });
  }

  if (
    values.applicant_name.length > 150 ||
    values.invention_title.length > 250 ||
    values.invention_summary.length > 10000
  ) {
    return res.status(400).json({
      success: false,
      message: "One or more fields exceed the allowed length.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO patent_enquiries
        (applicant_name, email, phone, organization,
         invention_title, invention_summary, public_disclosure)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status, created_at`,
      [
        values.applicant_name,
        values.email,
        req.body.phone?.trim() || null,
        req.body.organization?.trim() || null,
        values.invention_title,
        values.invention_summary,
        disclosure,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Patent enquiry received successfully.",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Patent enquiry database error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your enquiry right now.",
    });
  }
});

app.post("/api/enquiries/copyright", async (req, res) => {
  const values = validateEnquiry(req, res, [
    "applicant_name",
    "email",
    "work_title",
    "work_type",
    "work_description",
  ]);

  if (!values) return;

  const allowedWorkTypes = [
    "literary",
    "artistic",
    "musical",
    "software",
    "cinematograph",
    "sound_recording",
    "other",
  ];

  if (!allowedWorkTypes.includes(values.work_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid copyright work type.",
    });
  }

  if (values.work_description.length > 10000) {
    return res.status(400).json({
      success: false,
      message: "Work description must be at most 10000 characters.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO copyright_enquiries
        (applicant_name, email, phone, organization,
         work_title, work_type, work_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status, created_at`,
      [
        values.applicant_name,
        values.email,
        req.body.phone?.trim() || null,
        req.body.organization?.trim() || null,
        values.work_title,
        values.work_type,
        values.work_description,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Copyright enquiry received successfully.",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Copyright enquiry database error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your enquiry right now.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Suvidha API running at http://localhost:${PORT}`);
});
