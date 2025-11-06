// Simple demo server for testing API endpoints (ES module version)
import http from 'http';
import { URL } from 'url';

const PORT = process.env.PORT || 3000;

// Simple request handler
function handleRequest(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams);

  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Routes
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'terastudio REST API is running!',
      version: '1.0.0',
      features: ['anime', 'youtube', 'nsfw'],
      timestamp: new Date().toISOString()
    }));
  } 
  else if (path === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
  }
  else if (path === '/api/anime/search' && req.method === 'GET') {
    const { q = 'naruto' } = query;
    res.writeHead(200);
    res.end(JSON.stringify({
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
        },
        {
          id: 2,
          title: 'Naruto: Shippuden',
          synopsis: 'Naruto returns to his village after two and a half years of training.',
          image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
          score: 8.7,
          year: 2007,
          episodes: 500
        }
      ],
      query: q
    }));
  }
  else if (path === '/api/anime/trending' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
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
        },
        {
          id: 3,
          title: 'Jujutsu Kaisen',
          image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
          score: 8.6
        }
      ]
    }));
  }
  else if (path === '/api/anime/detail' && req.method === 'GET') {
    const { id = 1 } = query;
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        id: parseInt(id),
        title: 'Naruto',
        synopsis: 'A young ninja seeks recognition from his peers and dreams of becoming the Hokage.',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        score: 8.4,
        year: 2002,
        episodes: 720,
        status: 'Finished Airing',
        genres: ['Action', 'Adventure', 'Martial Arts'],
        studios: ['Pierrot']
      }
    }));
  }
  else if (path === '/api/youtube/info' && req.method === 'GET') {
    const { url: videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } = query;
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        title: 'Rick Astley - Never Gonna Give You Up',
        duration: '3:32',
        views: '1.2B',
        uploader: 'RickAstleyVEVO',
        uploadDate: '2009-10-25',
        description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: videoUrl
      }
    }));
  }
  else if (path === '/api/youtube/search' && req.method === 'GET') {
    const { q = 'anime music' } = query;
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: [
        {
          id: 'dQw4w9WgXcQ',
          title: 'Rick Astley - Never Gonna Give You Up',
          duration: '3:32',
          views: '1.2B',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        },
        {
          id: 'L_jWHffIx5E',
          title: 'Smarter Every Day',
          duration: '8:15',
          views: '15M',
          thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/maxresdefault.jpg'
        }
      ],
      query: q
    }));
  }
  else if (path === '/api/anime/random' && req.method === 'GET') {
    const animeList = [
      {
        id: 1,
        title: 'Naruto',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        score: 8.4
      },
      {
        id: 4,
        title: 'One Piece',
        image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
        score: 9.0
      },
      {
        id: 5,
        title: 'Dragon Ball Z',
        image: 'https://cdn.myanimelist.net/images/anime/1277/142421.jpg',
        score: 8.8
      }
    ];
    const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];
    
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: randomAnime
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      message: 'Endpoint not found',
      path: path,
      method: req.method
    }));
  }
}

// Create server
const server = http.createServer(handleRequest);

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log(`[READY] Server terastudio REST API started successfully`);
  console.log(`[INFO] Local: http://localhost:${PORT}`);
  console.log(`[INFO] Endpoints available:`);
  console.log(`  - GET /`);
  console.log(`  - GET /health`);
  console.log(`  - GET /api/anime/search?q=query`);
  console.log(`  - GET /api/anime/trending`);
  console.log(`  - GET /api/anime/detail?id=1`);
  console.log(`  - GET /api/anime/random`);
  console.log(`  - GET /api/youtube/info?url=...`);
  console.log(`  - GET /api/youtube/search?q=query`);
  console.log(`[INFO] Ready for connections`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;