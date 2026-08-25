// FUN/backend/routes/index.js
import express from "express";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import { generateToken, authenticateToken } from "./jwt/jwt.js";
import { pool } from "../database/database.js";

var router = express.Router();

// --- PUBLIC AUTH ROUTES ---

router.post("/login", async function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email" });

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid password" });

    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return res.json({
      message: `User ${user.username} logged in successfully!`,
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword],
    );

    const userID = result.rows[0].id;

    const token = generateToken({
      id: userID,
      email,
      username,
    });

    return res.status(201).json({
      message: `User ${username} created successfully!`,
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- PROTECTED ROUTES (Require Token) ---

// NOTES
router.get("/notes", authenticateToken, async (req, res) => {
  const query = `
    SELECT n.*, c.name as category_name 
    FROM notes n 
    LEFT JOIN categories c ON n.category_id = c.id 
    WHERE n.user_id = $1
  `;
  const result = await pool.query(query, [req.user.id]);
  res.json(result.rows);
});

router.post("/notes", authenticateToken, async (req, res) => {
  const { categoryID, title, content, color } = req.body;
  if (!categoryID || !title || !content || !color) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const catCheck = await pool.query(
      "SELECT * FROM categories WHERE id = $1 AND user_id = $2",
      [categoryID, req.user.id],
    );
    if (catCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Category does not exist or unauthorized" });
    }

    const result = await pool.query(
      "INSERT INTO notes (user_id, category_id, title, content, color) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [req.user.id, categoryID, title, content, color],
    );
    return res.status(201).json({
      message: `Note ${title} created successfully!`,
      success: true,
      noteID: result.rows[0].id,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/notes/:id", authenticateToken, async (req, res) => {
  const { title, content, color, categoryID, is_pinned } = req.body;
  const result = await pool.query(
    "UPDATE notes SET title=$1, content=$2, color=$3, category_id=$4, is_pinned=$5 WHERE id=$6 AND user_id=$7 RETURNING *",
    [title, content, color, categoryID, is_pinned, req.params.id, req.user.id],
  );
  res.json(result.rows[0]);
});

router.delete("/notes/:id", authenticateToken, async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ message: "Note deleted", success: true });
});

// CATEGORIES
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing required fields" });

  try {
    const existing = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
      [req.user.id, name.trim()],
    );

    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Category already exists" });

    await pool.query("INSERT INTO categories (user_id, name) VALUES ($1, $2)", [
      req.user.id,
      name.trim(),
    ]);

    return res.status(201).json({
      message: `Category ${name} created successfully!`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", authenticateToken, async (req, res) => {
  await pool.query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ message: "Deleted", success: true });
});

// TAGS
router.post("/tags", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing required fields" });

  try {
    const existing = await pool.query(
      "SELECT id FROM tags WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
      [req.user.id, name],
    );
    if (existing.rows.length > 0) {
      return res
        .status(200)
        .json({ success: true, tagID: existing.rows[0].id });
    }

    const result = await pool.query(
      "INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING id",
      [req.user.id, name],
    );
    return res.status(201).json({ success: true, tagID: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/notes/tag", authenticateToken, async (req, res) => {
  const { noteID, tagID } = req.body;
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

router.get("/notes/:noteID/tags", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.* FROM tags t JOIN note_tag nt ON t.id = nt.tag_id WHERE nt.note_id = $1`,
      [req.params.noteID],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/notes/:noteID/tags", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM note_tag WHERE note_id = $1", [
      req.params.noteID,
    ]);
    res.json({ message: "Tags cleared", success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// SETTINGS
router.get("/settings", authenticateToken, async (req, res) => {
  const result = await pool.query("SELECT * FROM settings WHERE user_id = $1", [
    req.user.id,
  ]);
  res.json(result.rows[0] || {});
});

router.put("/settings", authenticateToken, async (req, res) => {
  const { theme, default_color, ai_enabled } = req.body;
  const result = await pool.query(
    "UPDATE settings SET theme=$1, default_color=$2, ai_enabled=$3 WHERE user_id=$4 RETURNING *",
    [theme, default_color, ai_enabled, req.user.id],
  );
  res.json(result.rows[0]);
});

// AI TRANSFORM
router.post("/ai/transform", authenticateToken, async (req, res) => {
  const { content, tone } = req.body;

  if (!content || !tone)
    return res.status(400).json({ error: "Missing content or tone" });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful note-taking assistant. Rewrite the user's note to be ${tone}. Keep the core meaning but change the style. Do not include any intro text like "Here is your note".`,
        },
        { role: "user", content },
      ],
    });

    res.json({ aiText: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI transformation failed" });
  }
});

export default router;
