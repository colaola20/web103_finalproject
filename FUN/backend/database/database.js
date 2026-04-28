import pg from "pg";
import "dotenv/config";

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true, 
  },
};

export const pool = new pg.Pool(config);
