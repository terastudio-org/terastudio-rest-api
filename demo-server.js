import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Basic routes for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'terastudio REST API is running!',
    version: '1.0.0',
    features: ['anime', 'youtube', 'nsfw'],
    timestamp: new Date().toISOString()
  });
});

// Anime endpoints (mock data for testing)
app.get('/api/anime/search', (req, res) => {
  const { q = 'naruto' } = req.query;
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Naruto',
        synopsis: 'A young ninja seeks recognition from his peers and dreams of becoming the Hokage.',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        score: 8.4,
        year: 2002,
        episodes: 720
      }
    ],
    query: q
  });
});

app.get('/api/anime/trending', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Attack on Titan',
        image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        score: 9.0
      },
      {
        id: 2,
        title: 'Demon Slayer',
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        score: 8.7
      }
    ]
  });
});

// YouTube endpoints (mock data for testing)
app.get('/api/youtube/info', (req, res) => {
  const { url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } = req.query;
  res.json({
    success: true,
    data: {
      title: 'Rick Astley - Never Gonna Give You Up',
      duration: '3:32',
      views: '1.2B',
      uploader: 'RickAstleyVEVO',
      url: url
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

export default app;