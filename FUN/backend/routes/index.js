import express from 'express';
var router = express.Router();
import { pool } from '../database/database.js';

/* GET home page. */
router.get('/', async function(req, res, next) {
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return res.status(500).json({ error: 'Database query failed' });
    }
    return res.json({ message: 'Database connection successful', time: result.rows[0].now });
  })
});

router.get('/hello', function(req, res, next) {
  return res.json({message: `Hello from the backend!`});
});


export default router;