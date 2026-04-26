import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


import indexRouter from './routes/index.js';


var app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/data', indexRouter);

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}


export default app;
