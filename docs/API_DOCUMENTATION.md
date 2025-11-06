# terastudio REST API - Dokumentasi Lengkap

## 📋 Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Setup dan Instalasi](#setup-dan-instalasi)
3. [Anime API](#anime-api)
4. [YouTube API](#youtube-api)
5. [NSFW Content API](#nsfw-content-api)
6. [Utility API](#utility-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Contoh Penggunaan](#contoh-penggunaan)

## 🎯 Pengenalan

terastudio REST API adalah API yang diperkuat dengan fitur-fitur canggih:

- **🎌 Anime Scraping**: Search, detail, trending, seasonal anime dari multiple sources
- **📹 YouTube Downloader**: Download video/audio, playlist, search dengan yt-dlp
- **🛡️ NSFW Moderation**: Content safety analysis, age verification, image moderation

## 🚀 Setup dan Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Tools

```bash
# Setup YouTube tools (yt-dlp, ffmpeg)
npm run setup:youtube

# Setup Anime data sources
npm run setup:anime

# Health check system
npm run health:check
```

### 3. Environment Variables

Buat file `.env`:

```env
PORT=3000
NODE_ENV=production
ADMIN_KEY=your_admin_key_here
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 🎌 Anime API

### Search Anime

**Endpoint**: `GET /api/anime/search`

**Parameters**:
- `q` (required): Query pencarian anime
- `page` (optional): Halaman (default: 1)
- `source` (optional): Source API (jikan/kitsu, default: jikan)

**Example**:
```bash
curl "http://localhost:3000/api/anime/search?q=Naruto&source=jikan&page=1"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "mal_id": 20,
        "title": "Naruto",
        "images": { "jpg": { "image_url": "..." }},
        "synopsis": "...",
        "score": 8.3,
        "year": 2002,
        "type": "TV",
        "episodes": 220
      }
    ],
    "total": 1,
    "query": "Naruto",
    "page": 1,
    "source": "jikan"
  }
}
```

### Anime Detail

**Endpoint**: `GET /api/anime/detail`

**Parameters**:
- `id` (required): Anime ID (mal_id untuk jikan, kitisu_id untuk kitsu)
- `source` (optional): Source API (jikan/kitsu)

**Example**:
```bash
curl "http://localhost:3000/api/anime/detail?id=20&source=jikan"
```

### Trending Anime

**Endpoint**: `GET /api/anime/trending`

**Parameters**:
- `source` (optional): Source API (jikan/kitsu, default: jikan)
- `limit` (optional): Jumlah hasil (default: 20, max: 50)

**Example**:
```bash
curl "http://localhost:3000/api/anime/trending?source=jikan&limit=10"
```

### Seasonal Anime

**Endpoint**: `GET /api/anime/seasonal`

**Parameters**:
- `season` (optional): Season (winter/spring/summer/fall, default: winter)
- `year` (optional): Tahun (default: current year)
- `source` (optional): Source API

**Example**:
```bash
curl "http://localhost:3000/api/anime/seasonal?season=winter&year=2024"
```

### Random Anime

**Endpoint**: `GET /api/anime/random`

**Parameters**:
- `genre` (optional): Genre ID
- `type` (optional): Tipe anime (TV/Movie/OVA/Special)
- `count` (optional): Jumlah anime (default: 10, max: 20)
- `source` (optional): Source API

**Example**:
```bash
curl "http://localhost:3000/api/anime/random?genre=1&type=TV&count=5"
```

### Advanced Search

**Endpoint**: `GET /api/anime/advanced`

**Parameters**:
- `query` (optional): Query pencarian
- `genre` (optional): Genre ID (multiple: 1,2,3)
- `type` (optional): Tipe anime
- `status` (optional): Status (airing/complete/upcoming)
- `year` (optional): Tahun rilis
- `score` (optional): Minimum score
- `sort` (optional): Sort (popularity/score/rank/title)
- `page` (optional): Halaman
- `source` (optional): Source API

**Example**:
```bash
curl "http://localhost:3000/api/anime/advanced?query=action&genre=1&sort=popularity&page=1"
```

## 📹 YouTube API

### Video Info

**Endpoint**: `GET /api/youtube/info`

**Parameters**:
- `url` (required): YouTube video URL

**Example**:
```bash
curl "http://localhost:3000/api/youtube/info?url=https://youtube.com/watch?v=VIDEO_ID"
```

### Download Video/Audio

**Endpoint**: `GET /api/youtube/download`

**Parameters**:
- `url` (required): YouTube URL
- `format` (optional): Format (best/worst/bestvideo/bestaudio/mp4/webm/mp3/m4a)
- `quality` (optional): Kualitas (best/worst/720p/480p/360p/144p)
- `audioOnly` (optional): Download audio saja (true/false)
- `extractAudio` (optional): Extract audio (true/false)

**Example**:
```bash
curl "http://localhost:3000/api/youtube/download?url=YOUTUBE_URL&format=mp4&quality=720p"
```

### Download Progress

**Endpoint**: `GET /api/youtube/progress`

**Parameters**:
- `taskId` (required): Task ID dari download request

**Example**:
```bash
curl "http://localhost:3000/api/youtube/progress?taskId=TASK_ID"
```

### Playlist Info

**Endpoint**: `GET /api/youtube/playlist`

**Parameters**:
- `url` (required): YouTube playlist URL
- `maxDownloads` (optional): Maksimal download (default: 10, max: 50)
- `format` (optional): Format
- `quality` (optional): Kualitas
- `audioOnly` (optional): Audio only

**Example**:
```bash
curl "http://localhost:3000/api/youtube/playlist?url=PLAYLIST_URL&maxDownloads=5"
```

### Search Videos

**Endpoint**: `GET /api/youtube/search`

**Parameters**:
- `q` (required): Search query
- `maxResults` (optional): Maksimal hasil (default: 10, max: 50)

**Example**:
```bash
curl "http://localhost:3000/api/youtube/search?q=music&maxResults=20"
```

## 🛡️ NSFW Content API

### Age Verification

**Endpoint**: `GET /api/nsfw/verify-age`

**Parameters**:
- `action` (optional): Action (request/confirm, default: request)
- `token` (optional): Verification token

**Example**:
```bash
# Request verification
curl "http://localhost:3000/api/nsfw/verify-age?action=request"

# Confirm verification
curl "http://localhost:3000/api/nsfw/verify-age?action=confirm&token=TOKEN_HERE"
```

### Content Safety Analysis

**Endpoint**: `GET /api/nsfw/analyze-content`

**Parameters**:
- `text` (required): Text to analyze
- `imageUrl` (optional): Image URL to analyze

**Example**:
```bash
curl "http://localhost:3000/api/nsfw/analyze-content?text=some+content+to+analyze"
```

### URL Safety Check

**Endpoint**: `GET /api/nsfw/check-url`

**Parameters**:
- `url` (required): URL to check

**Example**:
```bash
curl "http://localhost:3000/api/nsfw/check-url?url=https://example.com"
```

### Image Moderation

**Endpoint**: `GET /api/nsfw/moderate-image`

**Parameters**:
- `imageUrl` (required): Image URL to moderate

**Example**:
```bash
curl "http://localhost:3000/api/nsfw/moderate-image?imageUrl=https://example.com/image.jpg"
```

### Content Warning Generator

**Endpoint**: `GET /api/nsfw/generate-warnings`

**Parameters**:
- `content` (required): Content to analyze
- `type` (optional): Content type (text/image/video/audio/mixed)
- `analysis` (optional): Pre-existing analysis data

**Example**:
```bash
curl "http://localhost:3000/api/nsfw/generate-warnings?content=content+text&type=text"
```

## 🔧 Utility API

### File Upload

**Endpoint**: `POST /files/upload`

**Body**: `form-data` dengan field `file`

**Example**:
```bash
curl -X POST -F "file=@/path/to/file.jpg" http://localhost:3000/files/upload
```

### File Access

**Endpoint**: `GET /files/:filename`

**Example**:
```bash
curl "http://localhost:3000/files/filename.jpg"
```

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (parameter validation error)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## ⚡ Rate Limiting

### Default Limits

- **General API**: 1000 requests per hour
- **NSFW API**: 100 requests per hour
- **YouTube Download**: 50 requests per hour
- **Anime Search**: 500 requests per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 📝 Contoh Penggunaan

### JavaScript/Node.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000
});

// Search anime
const searchAnime = async (query) => {
  try {
    const response = await api.get('/api/anime/search', {
      params: { q: query, source: 'jikan' }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Download YouTube video
const downloadVideo = async (url) => {
  try {
    const response = await api.get('/api/youtube/download', {
      params: { url, format: 'mp4', quality: '720p' }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Analyze content safety
const analyzeContent = async (text) => {
  try {
    const response = await api.get('/api/nsfw/analyze-content', {
      params: { text }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Python

```python
import requests

API_BASE = "http://localhost:3000"

def search_anime(query):
    response = requests.get(f"{API_BASE}/api/anime/search", params={
        'q': query,
        'source': 'jikan'
    })
    return response.json()

def download_youtube(url):
    response = requests.get(f"{API_BASE}/api/youtube/download", params={
        'url': url,
        'format': 'mp4',
        'quality': '720p'
    })
    return response.json()

def analyze_content(text):
    response = requests.get(f"{API_BASE}/api/nsfw/analyze-content", params={
        'text': text
    })
    return response.json()
```

## 🔄 Changelog

### v1.0.0 - Initial Release
- ✅ Basic API structure
- ✅ Anime scraping (Jikan, Kitsu APIs)
- ✅ YouTube downloader (yt-dlp integration)
- ✅ NSFW content moderation
- ✅ Rate limiting and security
- ✅ Auto-loading endpoints
- ✅ Comprehensive documentation

## 📞 Support

- 📧 Email: admin@terastudio.org
- 💬 GitHub: https://github.com/terastudio-org
- 📖 Documentation: [This document]

---

**terastudio REST API** - Modern REST API with Auto-Loading Endpoints