// D:\ITTSPACE\backend\src\app.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import { mongoose } from './config/database.config';

//Edu.v: imports Routes
import routeAPI from './api/v1/routes/index';
import config from './config/config';
import cookieParser from 'cookie-parser';

const app = express();

app.set('port', config.PORT);

app.use(cookieParser());
app.use(helmet());

app.set('trust proxy', 1);

//el mugre cors >:v
const corsOptions = {
  origin: ['http://localhost:3001', 'https://notifinance-es.netlify.app', 'http://localhost:8000', 'http://localhost:3000'],
  credentials: true,
};
// Aplicamos el middleware de CORS con las opciones configuradas
app.use(cors(corsOptions));

app.use(morgan('dev'));



// Aceptar JSONsñ
app.use(express.json({ limit: '11mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes


routeAPI(app);

const api = config.API_URL;



// Endpoint para mantener vivo el servicio y verificar salud
app.get(`${api}/ping`, (req, res) => {
  try {
    const dbStatus = (mongoose && mongoose.connection && mongoose.connection.readyState === 1) ? 'Connected' : 'Disconnected';
    res.status(200).json({
      status: 'pong',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Ping error:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get(`${api}`, (req, res) => {
  res.send(
    `<h1>Tribuna MX API</h1> <p>Status: Running</p><p>Documentación: <b>${api}/api-docs</b></p>`
  );
})

// Swagger Docs




// Middleware para el manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong!');
});

// Export App
export default app;
