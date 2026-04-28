import express from "express";
import bcrypt from "bcrypt";
var router = express.Router();
import { pool } from "../database/database.js";

/* GET home page. */
router.get("/", async function (req, res) {
  pool.query("SELECT NOW()", (err, result) => {
    if (err) {
      console.error("Error executing query", err.stack);
      return res.status(500).json({ error: "Database query failed" });
    }
    return res.json({
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  });
});

// --- AUTHENTICATION ---

//login endpoint
router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.json({
      message: `User ${user.username} logged in successfully!`,
      success: true,
      userID: user.id,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

//registration endpoint with validation
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Email Validation (Standard format check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Requirements: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword],
    );

    const userID = result.rows[0].id;

    return res.status(201).json({
      message: `User ${username} created successfully!`,
      success: true,
      userID: userID,
      username: username,
    });
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(400).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

async function hashPassword(password) {
  const newpassword = await bcrypt.hash(password, 10);
  return newpassword;
}

// --- NOTES ---

//create note endpoint
// ***NOTE: user must create a category before creating a note ***
router.post("/notes", async (req, res) => {
  //user must create a category before creating a note, so we can check if the categoryID exists in the database before creating the note
  const { userID, categoryID, title, content, color } = req.body;
  console.log(userID, categoryID, title, content, color);
  
// HERE WE HAVE TO DECIDED IF THE USER HAS TO CREATE A CATEGORY BEFORE CREATING A NOTE,
// OR IF THEY CAN CREATE A NOTE WITHOUT A CATEGORY, AND THEN LATER ASSIGN IT TO A CATEGORY, 
// OR IF WE CAN JUST ASSIGN IT TO A DEFAULT CATEGORY (LIKE "Uncategorized") IF THEY DON'T SPECIFY ONE. 
// FOR NOW, I'LL ASSUME THEY HAVE TO CREATE A CATEGORY FIRST, BUT THIS CAN BE CHANGED LATER IF WE DECIDE TO ALLOW NOTES WITHOUT CATEGORIES. **
  
const requiredFields = ['userID', 'categoryID', 'title', 'content', 'color'];

for (const field of requiredFields) {
  if (!req.body[field]) {
    return res.status(400).json({ error: `Missing required field: ${field}` });
  }
}

  // in case the frontend does not validate the categoryID,
  // we can check if the categoryID exists in the database before creating the note,
  // if it does not exist, we can return an error message
  try {
    await pool.query("SELECT * FROM categories WHERE id = $1", [categoryID]);
    if (categoryID.length === 0) {
      return res.status(400).json({ error: "Category does not exist" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    await pool.query(
      "INSERT INTO notes (user_id, category_id, title, content, color) VALUES ($1, $2, $3, $4, $5)",
      [userID, categoryID, title, content, color],
    );
    return res.status(201).json({
      message: `Note ${title} created successfully!`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notes/:userID", async (req, res) => {
  // JOINs with categories to get the name instead of just the ID
  const query = `
    SELECT n.*, c.name as category_name 
    FROM notes n 
    LEFT JOIN categories c ON n.category_id = c.id 
    WHERE n.user_id = $1
  `;
  const result = await pool.query(query, [req.params.userID]);
  res.json(result.rows);
});

router.put("/notes/:id", async (req, res) => {
  const { userID, title, content, color, categoryID, is_pinned } = req.body;
  const result = await pool.query(
    "UPDATE notes SET title=$1, content=$2, color=$3, category_id=$4, is_pinned=$5 WHERE id=$6 AND user_id=$7 RETURNING *",
    [title, content, color, categoryID, is_pinned, req.params.id, userID],
  );
  res.json(result.rows[0]);
});

router.delete("/notes/:id", async (req, res) => {
  const { userID } = req.body;
  if (!userID) {
    return res.status(400).json({ error: "Missing userID" });
  }
  await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
    req.params.id,
    userID,
  ]);
  res.json({ message: "Note deleted", success: true });
});

//create category endpoint
router.post("/categories", async (req, res) => {
  const { userID, name } = req.body;
  console.log(userID, name);

  if (!userID || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await pool.query("INSERT INTO categories (user_id, name) VALUES ($1, $2)", [
      userID,
      name,
    ]);
    return res.status(201).json({
      message: `Category ${name} created successfully!`,
      success: true,
    });
  } catch (error) {
    console.log(error.detail);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const { userID } = req.body; // userID to ensure they own it
  if (!userID) {
    return res.status(400).json({ error: "Missing userID" });
  }
  await pool.query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [
    req.params.id,
    userID,
  ]);
  res.json({ message: "Deleted", success: true });
});

// --- TAGS ---

router.post("/tags", async (req, res) => {
  const { userID, name } = req.body;

  if (!userID || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await pool.query("INSERT INTO tags (user_id, name) VALUES ($1, $2)", [
      userID,
      name,
    ]);
    return res.status(201).json({
      message: `Tag ${name} created successfully!`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notes/tag", async (req, res) => {
  const { noteID, tagID } = req.body;
  if (!noteID || !tagID) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await pool.query("INSERT INTO note_tag (note_id, tag_id) VALUES ($1, $2)", [
      noteID,
      tagID,
    ]);
    res.json({ message: "Tag linked to note", success: true });
  } catch (error) {
    res.status(400).json({ error: "Already tagged" });
  }
});

// --- SETTINGS ---

router.get("/settings/:userID", async (req, res) => {
  const result = await pool.query("SELECT * FROM settings WHERE user_id = $1", [
    req.params.userID,
  ]);
  res.json(result.rows[0]);
});

router.put("/settings/:userID", async (req, res) => {
  const { theme, default_color, ai_enabled } = req.body;
  const result = await pool.query(
    "UPDATE settings SET theme=$1, default_color=$2, ai_enabled=$3 WHERE user_id=$4 RETURNING *",
    [theme, default_color, ai_enabled, req.params.userID],
  );
  res.json(result.rows[0]);
});

export default router;
