// FUN/backend/routes/jwt/jwt.js
import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "6h",
    issuer: process.env.ISSUER,
  });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.ISSUER,
    });
    return { valid: true, token: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Express Middleware to protect routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  const result = verifyToken(token);
  if (!result.valid) {
    return res.status(403).json({ 
      error: "Invalid or expired token",
      code: 7026
     });
  }

  req.user = result.token; // Contains { id, email }
  next();
};