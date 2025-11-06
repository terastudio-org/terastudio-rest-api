## terastudio REST API

A powerful, enhanced REST API built with Express.js featuring **anime scraping**, **YouTube downloader**, and **content metadata scraper**. Auto-loading endpoints with elegant documentation and advanced features.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/terastudio-org/terastudio-rest-api)

## Overview

terastudio REST API is a modern REST API implementation that automatically loads endpoints from the api/ directory. It features a clean documentation interface, automatic endpoint registration, and a service-layer architecture for better code organization.

## ✨ Features

### Core Features
- 🔄 Auto-Loading Endpoints: Automatically registers API endpoints from file structure
- 📚 Beautiful Documentation: Interactive API documentation with search functionality
- 🎨 Consistent Styling: Elegant UI with gradient themes and responsive design
- 🔧 Service Layer Architecture: Separated business logic for maintainability
- 📊 Request Logging: Automatic API request logging with response times
- 🚀 Error Handling: Custom 404 and 500 error pages with helpful UX
- ⚡ Lightweight: Minimal dependencies and fast performance

### 🎌 Anime Features
- **Multi-Source Scraping**: Support untuk Jikan API (MyAnimeList) dan Kitsu API
- **Advanced Search**: Search dengan genre, type, status, year, score filtering
- **Trending & Seasonal**: Dapatkan anime trending dan seasonal terbaru
- **Smart Caching**: Cache otomatis untuk performa optimal
- **Random Recommendations**: Rekomendasi anime random dengan filter

### 📹 YouTube Downloader
- **Video/Audio Download**: Support berbagai format (MP4, WebM, MP3, M4A)
- **Quality Selection**: Multiple quality options (720p, 480p, 360p, 144p)
- **Playlist Support**: Download entire playlists dengan progress tracking
- **Search Integration**: Search YouTube videos tanpa download
- **Progress Tracking**: Real-time download progress dengan estimated time

### 🔍 Content Metadata Scraper
- **Multi-Platform Support**: Rule34, Gelbooru, XNXX, XVideos
- **Metadata Extraction**: Tags, resolusi, durasi, rating, dan informasi lainnya
- **Search & Filter**: Pencarian konten dengan berbagai parameter
- **Random Content**: Dapatkan konten random dari berbagai platform
- **Rate Limiting**: Rate limiting ketat untuk menghormati server sumber
- **Anti-Detection**: User-agent rotation dan random delays
- **Legal Compliance**: HANYA ekstraksi metadata, tidak download konten

## 🏗️ Project Structure

```
terastudio-rest-api/
├── api/                           # API endpoints (auto-loaded)
│   ├── ai/                       # AI-related endpoints
│   │   ├── gpt.js               # GPT chat endpoint
│   │   └── write-cream.js       # Content writing endpoint
│   ├── anime/                   # 🎌 Anime endpoints
│   │   ├── search.js           # Anime search
│   │   ├── detail.js           # Anime details
│   │   ├── trending.js         # Trending anime
│   │   ├── seasonal.js         # Seasonal anime
│   │   ├── random.js           # Random anime
│   │   └── advanced.js         # Advanced search
│   ├── youtube/                 # 📹 YouTube endpoints
│   │   ├── info.js             # Video info
│   │   ├── download.js         # Video/audio download
│   │   ├── progress.js         # Download progress
│   │   ├── playlist.js         # Playlist support
│   │   └── search.js           # Video search
│   ├── content/                 # 🔍 Content Scraper endpoints
│   │   └── scraper.js          # Multi-platform metadata scraper
│   ├── random/                  # Random data endpoints
│   │   └── bluearchive.js      # Blue Archive related data
│   └── canvas/                  # Canvas/image endpoints
├── src/
│   ├── app/                     # Application configuration
│   │   ├── index.js            # Main app setup
│   │   ├── middleware.js       # Middleware configuration
│   │   └── responseFormatter.js # Response formatting
│   ├── services/                # Business logic layer
│   │   ├── ai/
│   │   │   └── gptService.js   # GPT service logic
│   │   ├── anime/
│   │   │   └── animeService.js # 🎌 Anime scraping service
│   │   └── content/
│   │       └── contentScraperService.js  # 🔍 Content scraper service
│   └── utils/                   # Utility functions
│       ├── loader.js           # Auto-loading utility
│       ├── logger.js           # Logging utility
│       ├── color.js            # Console colors
│       └── logApiRequest.js    # Request logging
├── scripts/                     # Setup and maintenance scripts
│   ├── setup-youtube-tools.js  # YouTube tools setup
│   ├── setup-anime-data.js     # Anime data setup
│   ├── cleanup-cache.js        # Cache cleanup
│   └── health-check.js         # System health check
├── data/                        # Data storage
│   ├── cache/                   # Cached data
│   ├── downloads/               # Downloaded files
│   └── logs/                    # Application logs
├── public/                       # Static files
│   ├── index.html              # API documentation
│   ├── 404.html                # Custom 404 error page
│   └── 500.html                # Custom 500 error page
├── docs/                        # Documentation
│   └── API_DOCUMENTATION.md    # Complete API docs
├── index.js                     # Application entry point
├── package.json
└── vercel.json                  # Vercel deployment config
```


## 🌐 API Endpoints

### Available Endpoints

#### 🎌 Anime API
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `GET /api/anime/search` | GET | Search anime dengan multiple filters |
| `GET /api/anime/detail` | GET | Get detailed anime information |
| `GET /api/anime/trending` | GET | Get trending/popular anime |
| `GET /api/anime/seasonal` | GET | Get seasonal anime (winter/spring/summer/fall) |
| `GET /api/anime/random` | GET | Get random anime recommendations |
| `GET /api/anime/advanced` | GET | Advanced search dengan multiple criteria |

#### 📹 YouTube API
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `GET /api/youtube/info` | GET | Get video information tanpa download |
| `GET /api/youtube/download` | GET, POST | Download video/audio dalam berbagai format |
| `GET /api/youtube/progress` | GET | Check download progress |
| `GET /api/youtube/playlist` | GET, POST | Get playlist info dan download |
| `GET /api/youtube/search` | GET | Search YouTube videos |

#### 🔍 Content Scraper API
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `GET /api/content/scraper?platform=rule34&action=search&query=anime` | GET, POST | Search metadata dari Rule34 |
| `GET /api/content/scraper?platform=gelbooru&action=random` | GET, POST | Random content dari Gelbooru |
| `GET /api/content/scraper?platform=xnxx&action=search&query=hd` | GET, POST | Search metadata dari XNXX |
| `GET /api/content/scraper?platform=xvideos&action=tags&tag=popular` | GET, POST | Tag-based search dari XVideos |
| `GET /api/content/scraper?platform=rule34&action=info&id=12345` | GET, POST | Get info spesifik by ID |

#### 🔧 Other API
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `GET /api/ai/gpt` | GET, POST | GPT chat completion endpoint |
| `GET /api/ai/write-cream` | GET, POST | Content writing assistance |
| `GET /api/random/bluearchive` | GET | Blue Archive related data |
| `POST /files/upload` | POST | Upload files ke server |
| `GET /files/:filename` | GET | Access uploaded files |
| `GET /api/openapi.json` | GET | API specification |
| `GET /` | GET | Web interface |

## Endpoint Structure

Each endpoint file follows this structure:

```javascript
export default {
    name: "Endpoint Name",
    description: "Endpoint description",
    category: "Category",
    methods: ["GET", "POST"], // Supported HTTP methods
    params: ["param1", "param2"], // Expected parameters
    paramsSchema: { // Optional parameter validation
        param1: { type: "string", required: true }
    },
    
    async run(req, res) {
        try {
            // Your endpoint logic here
            const result = await someService.process(req.query);
            
            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
```

## Example: GPT Endpoint

File: api/ai/gpt.js

```javascript
import GptService from '../../src/services/ai/gptService.js';

export default {
    name: "GPT Chat",
    description: "Chat completion using GPT models",
    category: "AI",
    methods: ["GET", "POST"],
    params: ["message", "model"],
    
    async run(req, res) {
        try {
            const { message, model = "gpt-3.5-turbo" } = req.method === 'GET' ? req.query : req.body;
            
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: "Message parameter is required"
                });
            }
            
            const result = await GptService.process(message, { model });
            
            res.json({
                success: true,
                data: result
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
```

## Service Layer Example

File: src/services/ai/gptService.js

```javascript
export class GptService {
    static async process(message, options = {}) {
        // Business logic implementation
        return {
            response: `Processed: ${message}`,
            model: options.model || 'default',
            timestamp: new Date().toISOString()
        };
    }
}

export default GptService;
```

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/terastudio-org/terastudio-rest-api.git
cd terastudio-rest-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup tools and data
```bash
# Setup YouTube tools (yt-dlp, ffmpeg)
npm run setup:youtube

# Setup anime data sources
npm run setup:anime

# Health check system
npm run health:check
```

### 4. Configure environment
Buat file `.env`:
```env
PORT=3000
NODE_ENV=production
ADMIN_KEY=your_admin_key_here
```

### 5. Start the development server
```bash
npm run dev
```

### 6. Access the API
- **API Documentation**: http://localhost:3000
- **Anime Search**: http://localhost:3000/api/anime/search?q=Naruto
- **YouTube Download**: http://localhost:3000/api/youtube/info?url=YOUTUBE_URL
- **Content Scraper**: http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime
- **OpenAPI Spec**: http://localhost:3000/api/openapi.json

## 📖 Examples

### Search Anime
```bash
curl "http://localhost:3000/api/anime/search?q=Naruto&source=jikan&page=1"
```

### Download YouTube Video
```bash
curl "http://localhost:3000/api/youtube/download?url=YOUTUBE_URL&format=mp4&quality=720p"
```

### Scrape Content Metadata
```bash
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=5"
```

## 📚 Complete Documentation

Untuk panduan lengkap penggunaan API, silakan lihat dokumentasi berikut:

### 📖 Main Documentation
- **[API Usage Guide](docs/API_USAGE_GUIDE.md)** - Panduan lengkap semua endpoint dengan contoh
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Panduan testing dan troubleshooting
- **[Content Scraper API](docs/CONTENT_SCRAPER_API.md)** - Dokumentasi khusus Content Scraper
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Panduan deploy dan setup production

### 🎯 Quick Reference

| Feature | Endpoint | Example |
|---------|----------|---------|
| **Anime Search** | `GET /api/anime/search` | `?q=Naruto&type=TV&score_min=7.0` |
| **YouTube Download** | `GET /api/youtube/download` | `?url=VIDEO_URL&format=mp4&quality=720p` |
| **Content Scraper** | `GET /api/content/scraper` | `?platform=rule34&action=search&query=anime` |
| **GPT Chat** | `GET /api/ai/gpt` | `?message=Hello&model=gpt-3.5-turbo` |
| **Random Data** | `GET /api/random/bluearchive` | `?type=character` |

### 🧪 Testing Resources
- **Health Check Script**: `bash scripts/health-check.sh`
- **Full Test Suite**: Lihat [Testing Guide](docs/TESTING_GUIDE.md#complete-api-test-script)
- **Performance Monitoring**: Lihat [Testing Guide](docs/TESTING_GUIDE.md#performance-testing)
- **Load Testing**: Lihat [Testing Guide](docs/TESTING_GUIDE.md#load-testing)

## Vercel Deployment

The project includes vercel.json for zero-config deployment:

```bash
npm i -g vercel
vercel
```

Environment Variables

Create a .env file for environment-specific configurations:

```env
PORT=3000
NODE_ENV=production
```

Adding New Endpoints

1. Create Endpoint File

Create a new JavaScript file in the api/ directory:

```javascript
// api/weather/forecast.js
export default {
    name: "Weather Forecast",
    description: "Get weather forecast for a location",
    category: "Weather",
    methods: ["GET"],
    params: ["city", "days"],
    
    async run(req, res) {
        try {
            const { city, days = 7 } = req.query;
            
            // Your implementation here
            const forecast = await WeatherService.getForecast(city, days);
            
            res.json({
                success: true,
                data: forecast
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
```

2. The endpoint will be automatically available at:

- GET /api/weather/forecast?city=London&days=5

## API Response Format
All successful responses follow this format:

```json
{
    "statusCode": 200,
    "success": true,
    "data": {
        "response": "Your data here"
    },
    "timestamp": "2023-01-01T00:00:00.000Z",
    "attribution": "@terastudio-org"
}
```

Error responses:

```json
{
    "statusCode": 400,
    "success": false,
    "error": "Error message description"
}
```

## Error Handling
The API includes comprehensive error handling:

- 400 Bad Request: Invalid parameters
- 404 Not Found: Endpoint not found
- 500 Internal Server Error: Server-side errors

Custom error pages are served for web requests.

## 🧪 Testing

### ✅ Status: All Tests Passed
**Testing Date:** November 6, 2025  
**Server Status:** Running on port 3000

### Test Results Summary
- ✅ **Health Check**: Server responding normally
- ✅ **Anime Endpoints**: 6/6 endpoints working (search, detail, trending, random, seasonal, advanced)
- ✅ **YouTube Endpoints**: 5/5 endpoints working (info, download, search, playlist, progress)
- ✅ **Content Scraper**: Multi-platform metadata extraction (Rule34, Gelbooru, XNXX, XVideos)

### Quick Test Commands
```bash
# Test main API
curl http://localhost:3000/

# Test anime search
curl "http://localhost:3000/api/anime/search?q=naruto"

# Test anime trending  
curl http://localhost:3000/api/anime/trending

# Test YouTube info
curl "http://localhost:3000/api/youtube/info?url=https://youtube.com/watch?v=dQw4w9WgXcQ"

# Test random anime
curl http://localhost:3000/api/anime/random
```

### Demo Server Available
A demo server (`simple-server.js`) is available for testing without installing heavy dependencies. It provides mock data for all endpoints.

```bash
# Run demo server
node simple-server.js
```

For production testing with real scraping and ML features, install all dependencies:
```bash
npm install --production
npm start
```

## 📚 Documentation Structure

### 🎯 Core Documentation
- **[📖 API Usage Guide](docs/API_USAGE_GUIDE.md)** - Comprehensive guide with step-by-step examples for all 20+ endpoints
- **[🧪 Testing Guide](docs/TESTING_GUIDE.md)** - Complete testing suite, automated scripts, and troubleshooting
- **[🔍 Content Scraper API](docs/CONTENT_SCRAPER_API.md)** - Detailed documentation for multi-platform content scraping
- **[🚀 Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions and best practices
- **[📊 Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details and architecture

### 🔧 Quick Links

#### For Developers
- **Start Testing**: `bash scripts/health-check.sh`
- **Full Test Suite**: See [Testing Guide](docs/TESTING_GUIDE.md#complete-api-test-script)
- **Performance Testing**: See [Testing Guide](docs/TESTING_GUIDE.md#performance-testing)
- **Load Testing**: See [Testing Guide](docs/TESTING_GUIDE.md#load-testing)

#### For API Users
- **Quick Examples**: See [API Usage Guide](docs/API_USAGE_GUIDE.md#quick-reference)
- **Platform Details**: Each platform has dedicated sections in the usage guide
- **Error Handling**: Common errors and solutions in [Testing Guide](docs/TESTING_GUIDE.md#troubleshooting)

#### For Deployment
- **Production Setup**: See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- **Environment Configuration**: Environment variables and security setup
- **Monitoring & Logging**: Production monitoring and alerting setup

### 📊 API Overview

| Endpoint Category | Endpoints | Features |
|-------------------|-----------|----------|
| **🎌 Anime** | 6 endpoints | Search, Detail, Trending, Seasonal, Random, Advanced |
| **📹 YouTube** | 5 endpoints | Info, Download, Progress, Playlist, Search |
| **🔍 Content Scraper** | 4 platforms | Rule34, Gelbooru, XNXX, XVideos |
| **🤖 AI Services** | 2 endpoints | GPT Chat, Content Writing |
| **🎲 Random Data** | 1 endpoint | Blue Archive data |
| **🎨 Canvas** | TBD | Image processing features |

### 🚀 Getting Started with Documentation

1. **New User**: Start with [API Usage Guide](docs/API_USAGE_GUIDE.md) for examples
2. **Developer**: Check [Testing Guide](docs/TESTING_GUIDE.md) for development setup
3. **Production**: Follow [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for live deployment
4. **Content Scraper**: Read [Content Scraper API](docs/CONTENT_SCRAPER_API.md) for scraping features

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

### Development Guidelines
- Follow the existing endpoint structure
- Update documentation when adding features
- Add tests for new functionality
- Ensure all new features include proper error handling
- Update the respective documentation files

## License

This project is licensed under the **terastudio Custom License v1.0** - see the [LICENSE](LICENSE) file for details.

**Note:** This is a custom license with specific commercial use restrictions. Please review the LICENSE file before using this project for commercial purposes.

## Support

- 📧 Email: admin@terastudio.org
- 💬 GitHub: https://github.com/terastudio-org
- 📖 Documentation: [docs/](docs/) directory

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **HTTP Client**: Axios
- **HTML Parsing**: Cheerio
- **Video Processing**: yt-dlp, ffmpeg

### Frontend & Documentation
- **UI Framework**: Tailwind CSS
- **Icons**: Material Icons
- **Fonts**: Google Fonts
- **API Docs**: Custom interactive documentation

### External Services
- **Anime Data**: Jikan API (MyAnimeList), Kitsu API
- **Video Data**: YouTube API, yt-dlp
- **AI Models**: OpenAI GPT-3.5/4, Custom models

---

terastudio REST API • Modern REST API with Auto-Loading Endpoints
