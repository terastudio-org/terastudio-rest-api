# Panduan Lengkap Penggunaan API terastudio

## 📖 Overview
Dokumentasi lengkap untuk semua endpoint di terastudio REST API dengan contoh penggunaan step-by-step.

## 🎯 Fitur yang Tersedia

### 🎌 **Anime Features** (6 endpoints)
- Anime Search & Detail
- Trending & Seasonal
- Random Recommendations
- Advanced Search

### 📹 **YouTube Downloader** (5 endpoints)
- Video/Audio Download
- Playlist Support
- Search & Info
- Progress Tracking

### 🔍 **Content Scraper** (4 actions)
- Multi-platform: Rule34, Gelbooru, XNXX, XVideos
- Search, Random, Info, Tags

### 🤖 **AI Services** (2 endpoints)
- GPT Chat
- Content Writing

### 🎲 **Random Data** (1 endpoint)
- Blue Archive Related Data

### 🎨 **Canvas/Image** (TBD)
- Image processing features

---

## 🎌 Anime API - Panduan Lengkap

### 🚀 Base URL
```
GET /api/anime/[endpoint]
```

### 1. Anime Search
**URL:** `GET /api/anime/search`

#### Parameters:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query |
| `source` | string | No | `jikan` | Data source: `jikan` (MyAnimeList) atau `kitsu` |
| `page` | number | No | `1` | Page number |
| `limit` | number | No | `25` | Results per page |
| `type` | string | No | - | Anime type: `TV`, `Movie`, `OVA`, `ONA`, `Special` |
| `status` | string | No | - | Status: `airing`, `complete`, `upcoming` |
| `genre` | string | No | - | Genre ID(s), comma-separated |
| `year` | number | No | - | Release year |
| `season` | string | No | - | Season: `winter`, `spring`, `summer`, `fall` |
| `score` | number | No | - | Minimum score (0-10) |
| `sort` | string | No | `score_desc` | Sort order |

#### Contoh Penggunaan:

```bash
# 1. Search anime sederhana
curl "http://localhost:3000/api/anime/search?q=Naruto"

# 2. Search dengan source spesifik
curl "http://localhost:3000/api/anime/search?q=One%20Piece&source=kitsu"

# 3. Search dengan filter
curl "http://localhost:3000/api/anime/search?q=action&type=TV&status=complete&page=1&limit=10"

# 4. Search dengan genre
curl "http://localhost:3000/api/anime/search?q=romance&genre=22&score=7.5"

# 5. Search berdasarkan tahun
curl "http://localhost:3000/api/anime/search?q=2024&year=2024&season=winter"

# 6. Search dengan sorting
curl "http://localhost:3000/api/anime/search?q=anime&sort=score_desc&limit=20"
```

#### Response Example:
```json
{
  "success": true,
  "data": {
    "query": "Naruto",
    "count": 30000,
    "results": [
      {
        "id": 20,
        "title": "Naruto",
        "alternative_titles": ["ナルト"],
        "type": "TV",
        "status": "finished",
        "year": 2002,
        "episodes": 220,
        "score": 8.4,
        "synopsis": "Naruto Uzumaki, a young ninja who seeks recognition from his peers...",
        "url": "https://myanimelist.net/anime/20/Naruto",
        "image_url": "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
        "genres": ["Action", "Comedy", "Drama", "Supernatural"],
        "start_date": "2002-10-03",
        "end_date": "2007-02-08"
      }
    ],
    "has_next": true,
    "current_page": 1,
    "total_pages": 1200
  },
  "timestamp": "2025-11-06T21:30:00.000Z"
}
```

### 2. Anime Detail
**URL:** `GET /api/anime/detail?id=[anime_id]`

#### Parameters:
- `id` (required): Anime ID dari MyAnimeList/Kitsu

#### Contoh Penggunaan:
```bash
# Get detail anime berdasarkan ID
curl "http://localhost:3000/api/anime/detail?id=20"

# Get detail dari source tertentu
curl "http://localhost:3000/api/anime/detail?id=16498&source=jikan"
```

#### Response Features:
- Full anime information
- Character list
- Related anime
- Recommendations
- Staff & voice actors
- Episode list
- Reviews

### 3. Trending Anime
**URL:** `GET /api/anime/trending`

#### Parameters:
- `source` (optional): `jikan` atau `kitsu`
- `limit` (optional): Number of results (default: 10)

#### Contoh Penggunaan:
```bash
# Get trending anime default
curl "http://localhost:3000/api/anime/trending"

# Get more trending results
curl "http://localhost:3000/api/anime/trending?limit=20"

# Get trending dari Kitsu
curl "http://localhost:3000/api/anime/trending?source=kitsu&limit=15"
```

### 4. Seasonal Anime
**URL:** `GET /api/anime/seasonal`

#### Parameters:
- `year` (optional): Year (default: current year)
- `season` (optional): `winter`, `spring`, `summer`, `fall`
- `source` (optional): `jikan` atau `kitsu`
- `status` (optional): `current` (currently airing) atau `complete`

#### Contoh Penggunaan:
```bash
# Get current season
curl "http://localhost:3000/api/anime/seasonal"

# Get specific season
curl "http://localhost:3000/api/anime/seasonal?year=2024&season=winter"

# Get airing anime
curl "http://localhost:3000/api/anime/seasonal?status=current"

# Get complete anime dari specific season
curl "http://localhost:3000/api/anime/seasonal?year=2023&season=fall&status=complete"
```

### 5. Random Anime
**URL:** `GET /api/anime/random`

#### Parameters:
- `type` (optional): Filter by type
- `status` (optional): Filter by status
- `year_from` (optional): Minimum year
- `year_to` (optional): Maximum year
- `score_min` (optional): Minimum score
- `genres` (optional): Comma-separated genre IDs

#### Contoh Penggunaan:
```bash
# Get random anime
curl "http://localhost:3000/api/anime/random"

# Get random TV anime
curl "http://localhost:3000/api/anime/random?type=TV"

# Get random high-score anime
curl "http://localhost:3000/api/anime/random?score_min=8.0"

# Get random anime dari genre tertentu
curl "http://localhost:3000/api/anime/random?genres=1,2,4"

# Get random anime dengan multiple filters
curl "http://localhost:3000/api/anime/random?type=TV&status=complete&score_min=7.0&year_from=2010&year_to=2023"
```

### 6. Advanced Search
**URL:** `GET /api/anime/advanced`

#### Parameters:
Combination dari semua parameter sebelumnya +:

| Parameter | Type | Description |
|-----------|------|-------------|
| `genres` | string | Include genres (comma-separated) |
| `genres_exclude` | string | Exclude genres |
| `studios` | string | Studio name(s) |
| `producers` | string | Producer name(s) |
| `demographic` | string | Age demographic: `seinen`, `josei`, `shoujo`, `shounen` |

#### Contoh Penggunaan:
```bash
# Advanced search dengan multiple filters
curl "http://localhost:3000/api/anime/advanced?q=action&type=TV&status=complete&year=2020-2024&score_min=7.5&genres=1,2&limit=50"

# Search dengan exclude genres
curl "http://localhost:3000/api/anime/advanced?q=anime&genres=22&genres_exclude=8,37&source=jikan"

# Search dengan studio filter
curl "http://localhost:3000/api/anime/advanced?studios=Studio%20Pierrot&demographic=shounen"
```

---

## 📹 YouTube Downloader - Panduan Lengkap

### 🚀 Base URL
```
GET/POST /api/youtube/[endpoint]
```

### 1. Get Video Info
**URL:** `GET /api/youtube/info`

#### Parameters:
- `url` (required): YouTube video URL
- `quality` (optional): `best`, `worst`, `720p`, `480p`, `360p`

#### Contoh Penggunaan:
```bash
# Get basic video info
curl "http://localhost:3000/api/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Get video info dengan quality preference
curl "http://localhost:3000/api/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=720p"

# Multiple requests (test different videos)
curl "http://localhost:3000/api/youtube/info?url=https://www.youtube.com/watch?v=abc123&quality=best"
```

#### Response Features:
- Video title, description, duration
- Thumbnail URLs
- Available formats & quality options
- Video metadata (views, likes, upload date)
- Channel information
- Estimated file sizes

### 2. Download Video/Audio
**URL:** `GET /api/youtube/download`

#### Parameters:
- `url` (required): YouTube video URL
- `format` (required): `mp4`, `webm`, `mp3`, `m4a`, `wav`
- `quality` (optional): `best`, `worst`, `720p`, `480p`, `360p`
- `filename` (optional): Custom filename
- `output` (optional): Custom output path

#### Contoh Penggunaan:
```bash
# Download video MP4
curl "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=mp4&quality=720p"

# Download audio MP3
curl "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=abc123&format=mp3"

# Download dengan custom filename
curl "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=mp4&quality=best&filename=my_video"

# Download dengan custom output path
curl "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=abc123&format=mp3&output=/custom/path/"
```

#### Response:
- `status`: `downloading`, `completed`, `error`
- `progress`: Download progress percentage
- `download_url`: Direct download link
- `filename`: Generated filename
- `file_size`: File size in bytes

### 3. Download Progress
**URL:** `GET /api/youtube/progress`

#### Parameters:
- `id` (required): Download ID dari response download

#### Contoh Penggunaan:
```bash
# Check progress dengan ID
curl "http://localhost:3000/api/youtube/progress?id=download_12345"

# Monitor progress
curl "http://localhost:3000/api/youtube/progress?id=download_67890"
```

### 4. Playlist Support
**URL:** `GET /api/youtube/playlist`

#### Parameters:
- `url` (required): YouTube playlist URL
- `format` (optional): `mp4`, `mp3`, etc.
- `quality` (optional): `best`, `worst`, etc.
- `limit` (optional): Limit number of videos to download

#### Contoh Penggunaan:
```bash
# Get playlist info
curl "http://localhost:3000/api/youtube/playlist?url=https://www.youtube.com/playlist?list=PLN3F6g1E6"

# Download entire playlist
curl "http://localhost:3000/api/youtube/playlist?url=https://www.youtube.com/playlist?list=PLN3F6g1E6&format=mp3&limit=10"

# Download playlist dengan quality preference
curl "http://localhost:3000/api/youtube/playlist?url=https://www.youtube.com/playlist?list=ABC123&format=mp4&quality=720p&limit=5"
```

### 5. YouTube Search
**URL:** `GET /api/youtube/search`

#### Parameters:
- `q` (required): Search query
- `limit` (optional): Number of results (default: 10)
- `sort` (optional): `relevance`, `date`, `view_count`, `rating`
- `duration` (optional): `short` (< 4 min), `medium` (4-20 min), `long` (> 20 min)
- `type` (optional): `video`, `channel`, `playlist`

#### Contoh Penggunaan:
```bash
# Search videos
curl "http://localhost:3000/api/youtube/search?q=naruto&limit=10&sort=relevance"

# Search short videos
curl "http://localhost:3000/api/youtube/search?q=tutorial&duration=short&limit=5"

# Search by most viewed
curl "http://localhost:3000/api/youtube/search?q=anime&sort=view_count&limit=20"

# Search specific type
curl "http://localhost:3000/api/youtube/search?q=music&type=video&limit=15"
```

---

## 🔍 Content Scraper - Panduan Lengkap

### 🚀 Base URL
```
GET/POST /api/content/scraper
```

### 1. Search Content
**URL:** `GET /api/content/scraper?platform=rule34&action=search`

#### Parameters:
- `platform` (required): `rule34`, `gelbooru`, `xnxx`, `xvideos`
- `query` (optional): Search term
- `limit` (optional): 1-50 (default: 10)
- `page` (optional): Pagination (default: 0)

#### Contoh Penggunaan:
```bash
# Search anime content di Rule34
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=10"

# Search images di Gelbooru
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=search&query=original&limit=5"

# Search videos di XNXX
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=hd&limit=3"

# Search di XVideos
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=search&query=popular&limit=7"
```

### 2. Get Random Content
**URL:** `GET /api/content/scraper?platform=[platform]&action=random`

#### Contoh Penggunaan:
```bash
# Get random dari Rule34
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=random&limit=3"

# Get random dari Gelbooru
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=random&limit=5"

# Get random dari XNXX
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=random&limit=2"

# Get random dari XVideos
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=random&limit=4"
```

### 3. Get Content by ID
**URL:** `GET /api/content/scraper?platform=[platform]&action=info&id=[content_id]`

#### Contoh Penggunaan:
```bash
# Get info Rule34 content
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=info&id=12345"

# Get info Gelbooru content
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=info&id=67890"
```

### 4. Get Content by Tags
**URL:** `GET /api/content/scraper?platform=[platform]&action=tags&tag=[tagname]`

#### Contoh Penggunaan:
```bash
# Get Rule34 content by tag
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=tags&tag=anime"

# Get XVideos content by tag
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=popular"
```

---

## 🤖 AI Services - Panduan Lengkap

### 1. GPT Chat
**URL:** `GET/POST /api/ai/gpt`

#### Parameters:
- `message` (required): Your message/question
- `model` (optional): GPT model (`gpt-3.5-turbo`, `gpt-4`, default: `gpt-3.5-turbo`)
- `system_prompt` (optional): Custom system prompt

#### Contoh Penggunaan:
```bash
# Simple chat (GET)
curl "http://localhost:3000/api/ai/gpt?message=Hello, what is the weather like?"

# Chat dengan model spesifik (GET)
curl "http://localhost:3000/api/ai/gpt?message=Explain quantum physics&model=gpt-4"

# Chat dengan custom system prompt (POST)
curl -X POST http://localhost:3000/api/ai/gpt \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Act as a coding assistant",
    "model": "gpt-3.5-turbo",
    "system_prompt": "You are a helpful programming assistant that provides code examples and explanations."
  }'
```

### 2. Content Writing
**URL:** `GET/POST /api/ai/write-cream`

#### Parameters:
- `topic` (required): Writing topic/theme
- `length` (optional): `short`, `medium`, `long`
- `style` (optional): `formal`, `casual`, `creative`
- `language` (optional): `en`, `id`, `ja`

#### Contoh Penggunaan:
```bash
# Generate short creative content (GET)
curl "http://localhost:3000/api/ai/write-cream?topic=artificial%20intelligence&length=short&style=casual"

# Generate medium formal content (POST)
curl -X POST http://localhost:3000/api/ai/write-cream \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "sustainability in technology",
    "length": "medium",
    "style": "formal",
    "language": "en"
  }'

# Generate long creative content in Indonesian
curl -X POST http://localhost:3000/api/ai/write-cream \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "masa depan teknologi di Indonesia",
    "length": "long",
    "style": "creative",
    "language": "id"
  }'
```

---

## 🎲 Random Data API

### 1. Blue Archive Data
**URL:** `GET /api/random/bluearchive`

#### Parameters:
- `type` (optional): `character`, `school`, `weapon`
- `limit` (optional): Number of results

#### Contoh Penggunaan:
```bash
# Get random Blue Archive character
curl "http://localhost:3000/api/random/bluearchive?type=character"

# Get random Blue Archive school
curl "http://localhost:3000/api/random/bluearchive?type=school"

# Get multiple random items
curl "http://localhost:3000/api/random/bluearchive?type=character&limit=3"
```

---

## 🔧 Advanced Usage Examples

### Multiple Endpoints in Sequence
```bash
#!/bin/bash
# anime-workflow.sh

echo "=== Anime Discovery Workflow ==="

# 1. Search anime
ANIME=$(curl -s "http://localhost:3000/api/anime/search?q=romance&limit=1")
echo "Search results: $ANIME"

# 2. Get trending anime
TRENDING=$(curl -s "http://localhost:3000/api/anime/trending?limit=5")
echo "Trending anime: $TRENDING"

# 3. Get random anime
RANDOM=$(curl -s "http://localhost:3000/api/anime/random?type=TV&score_min=7.0")
echo "Random anime: $RANDOM"
```

### Combined Downloader Usage
```bash
#!/bin/bash
# youtube-workflow.sh

echo "=== YouTube Downloader Workflow ==="

# 1. Get video info
INFO=$(curl -s "http://localhost:3000/api/youtube/info?url=https://www.youtube.com/watch?v=example")
echo "Video info: $INFO"

# 2. Download video
curl "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=example&format=mp4&quality=720p"

# 3. Search related videos
SEARCH=$(curl -s "http://localhost:3000/api/youtube/search?q=related%20music&limit=5")
echo "Search results: $SEARCH"
```

### API Monitoring Script
```bash
#!/bin/bash
# monitor-api.sh

API_BASE="http://localhost:3000"
ENDPOINTS=(
    "GET|$API_BASE/|Health check"
    "GET|$API_BASE/api/anime/search?q=test|Anime search"
    "GET|$API_BASE/api/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcq|YouTube info"
    "GET|$API_BASE/api/content/scraper?platform=rule34&action=random|Content scraper"
    "GET|$API_BASE/api/ai/gpt?message=hello|AI GPT"
)

echo "=== API Health Monitor ==="
echo "Time: $(date)"
echo ""

for endpoint in "${ENDPOINTS[@]}"; do
    IFS='|' read -r method url description <<< "$endpoint"
    echo "Testing: $description"
    
    response=$(curl -s -w "%{http_code}" -m 10 "$url")
    status_code="${response: -3}"
    
    if [ "$status_code" = "200" ]; then
        echo "✅ $description - Status: $status_code"
    else
        echo "❌ $description - Status: $status_code"
    fi
    
    sleep 0.5
    echo ""
done

echo "=== Monitoring Complete ==="
```

---

## 🛡️ Best Practices & Tips

### 1. Rate Limiting
- Respect rate limits
- Add delays between requests
- Monitor `rate_limit_info` in responses

### 2. Error Handling
```bash
# Check for error responses
response=$(curl -s "http://localhost:3000/api/anime/search?q=test")
if echo "$response" | grep -q '"success": false'; then
    echo "Error occurred: $response"
fi
```

### 3. Parameter Validation
```bash
# Always validate required parameters
# Good: All required params included
curl "http://localhost:3000/api/anime/search?q=Naruto&source=jikan"

# Bad: Missing required params (will error)
curl "http://localhost:3000/api/anime/search"
```

### 4. Response Caching
- Cache successful responses
- Respect `Cache-Control` headers
- Use ETags if available

### 5. Authentication (if applicable)
```bash
# API key based auth (if enabled)
curl -H "X-API-Key: your-api-key" \
     "http://localhost:3000/api/anime/search?q=test"
```

---

## 🚀 Deployment Tips

### Environment Variables
```env
# .env
PORT=3000
NODE_ENV=production
ADMIN_KEY=your_admin_key
YOUTUBE_API_KEY=your_youtube_key
OPENAI_API_KEY=your_openai_key
```

### Performance Optimization
- Enable gzip compression
- Set up reverse proxy (nginx)
- Use PM2 for process management
- Enable request logging
- Set up monitoring and alerts

### Security Considerations
- Rate limiting
- Input validation
- Error message sanitization
- HTTPS in production
- API key management

---

**Dokumentasi ini dibuat untuk terastudio REST API v1.0**  
**Terakhir diupdate: 2025-11-06**  
**Built by terastudio Organization**
