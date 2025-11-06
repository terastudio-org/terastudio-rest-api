# Content Scraper Implementation - API Documentation

## Overview
Content Scraper untuk ekstraksi metadata dari 4 platform adult content.
**DISCLAIMER**: HANYA metadata extraction, tidak ada download konten eksplisit.

## Supported Platforms
1. **Rule34** - Images & Videos via API
2. **Gelbooru** - Images via API  
3. **XNXX** - Videos via HTML scraping
4. **XVideos** - Videos via HTML scraping

## API Endpoint

### Base URL
```
GET/POST /api/content/scraper
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| platform | string | Yes | Platform target: `rule34`, `gelbooru`, `xnxx`, `xvideos` |
| action | string | No | Action: `search`, `info`, `random`, `tags` (default: search) |
| query | string | No | Search query (untuk action=search atau tags) |
| id | string | No | Content ID (untuk action=info) |
| tag | string | No | Specific tag (untuk action=tags) |
| limit | number | No | Max results: 1-50 (default: 10) |
| page | number | No | Page number untuk pagination (default: 0) |

## Usage Examples

### 1. Search Content (Rule34)
```bash
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=5"
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "platform": "rule34",
    "results": [
      {
        "id": "12345",
        "type": "image",
        "title": "Rule34 Post 12345",
        "tags": ["anime", "girl", "cute"],
        "score": 100,
        "rating": "explicit",
        "resolution": {
          "width": 1920,
          "height": 1080
        },
        "fileSize": 2048000,
        "uploadDate": "2025-01-01T00:00:00Z",
        "thumbnailUrl": "https://...",
        "sourceUrl": "https://rule34.xxx/...",
        "metadata": {
          "source": "pixiv",
          "creator_id": "artist123",
          "has_comments": true
        }
      }
    ],
    "count": 5,
    "page": 0,
    "query": "anime"
  },
  "rate_limit_info": {
    "requests": 1,
    "limit": 30,
    "remaining": 29
  },
  "disclaimer": {
    "legal": "Metadata only - No explicit content downloaded or stored",
    "usage": "User is responsible for data usage compliance with local laws"
  }
}
```

### 2. Get Random Content (Gelbooru)
```bash
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=random&limit=3"
```

### 3. Search Videos (XNXX)
```bash
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=hd&limit=10"
```

### 4. Get Content Info by ID (Rule34)
```bash
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=info&id=12345"
```

### 5. Tag-based Search (XVideos)
```bash
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=popular"
```

## Metadata Structure

### Image Metadata (Rule34, Gelbooru)
```json
{
  "id": "unique_id",
  "type": "image",
  "title": "Post title",
  "tags": ["tag1", "tag2"],
  "score": 100,
  "rating": "explicit",
  "resolution": {
    "width": 1920,
    "height": 1080
  },
  "fileSize": 2048000,
  "uploadDate": "2025-01-01T00:00:00Z",
  "thumbnailUrl": "https://...",
  "sourceUrl": "https://...",
  "metadata": {}
}
```

### Video Metadata (XNXX, XVideos)
```json
{
  "id": "video_id",
  "type": "video",
  "title": "Video title",
  "tags": [],
  "duration": "10:30",
  "resolution": null,
  "views": null,
  "rating": null,
  "uploadDate": null,
  "thumbnailUrl": "https://...",
  "sourceUrl": "https://...",
  "metadata": {
    "platform_specific": "XNXX",
    "requires_age_verification": true
  }
}
```

## Rate Limiting

- **Limit**: 30 requests per hour per IP address
- **Window**: 1 hour (3600 seconds)
- **Response Code**: 429 (Too Many Requests) when exceeded

Rate limit info included in every response:
```json
{
  "rate_limit_info": {
    "requests": 15,
    "limit": 30,
    "remaining": 15
  }
}
```

## Anti-Detection Features

1. **User-Agent Rotation**: 4 different user agents
2. **Random Delays**: 1-3 seconds between requests
3. **Request Headers**: Mimics browser behavior
4. **Rate Limiting**: Respects server resources

## Error Handling

### Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Rate limit exceeded. Terlalu banyak permintaan scraping.",
  "requests": 30,
  "limit": 30,
  "reset_in": "1 hour"
}
```

### Invalid Platform
```json
{
  "success": false,
  "error": "Parameter 'platform' wajib diisi. Pilih: rule34, gelbooru, xnxx, atau xvideos",
  "supported_platforms": ["rule34", "gelbooru", "xnxx", "xvideos"]
}
```

### Scraping Error
```json
{
  "success": false,
  "platform": "rule34",
  "error": "Connection timeout",
  "fallback": "API tidak tersedia atau rate limited"
}
```

## Platform-Specific Notes

### Rule34 & Gelbooru
- ✅ Full API support
- ✅ Reliable metadata
- ✅ Tags, scores, ratings available
- ⚡ Fast response times

### XNXX & XVideos
- ⚠️ HTML scraping (less reliable)
- ⚠️ Limited metadata in listings
- ⚠️ May break if website structure changes
- 🐌 Slower response times due to HTML parsing

## Legal Disclaimer

**IMPORTANT**: 
- Service ini HANYA mengekstrak metadata publik
- TIDAK ada download atau penyimpanan konten eksplisit
- User bertanggung jawab atas penggunaan data
- Mematuhi robots.txt dan rate limiting
- Untuk tujuan research dan development only

## Technical Implementation

### Service Layer
File: `src/services/content/contentScraperService.js`

Features:
- Class-based architecture
- Rate limiting dengan Map storage
- Axios untuk HTTP requests
- Cheerio untuk HTML parsing (XNXX/XVideos)
- Error handling dengan try-catch
- Async/await pattern

### Endpoint Layer
File: `api/content/scraper.js`

Features:
- Parameter validation
- Action routing (search/info/random/tags)
- Response formatting
- Error handling
- Legal disclaimer in responses

## Panduan Penggunaan API - Step by Step

### 🚀 Cara Memulai

#### 1. Persiapan Server
```bash
# Clone atau download project
cd /workspace/terastudio-rest-api

# Install dependencies
npm install

# Start server
npm start

# Server akan berjalan di: http://localhost:3000
```

#### 2. Panduan Setiap Platform

### 📱 **Platform: Rule34**
**Cocok untuk:** Anime, manga, karakter illustrations

#### A. Search Content
**URL:** `GET /api/content/scraper?platform=rule34&action=search`

**Parameters:**
- `platform=rule34` (wajib)
- `action=search` (wajib)
- `query=anime` (opsional, kata kunci pencarian)
- `limit=5` (opsional, jumlah hasil 1-50)
- `page=0` (opsional, halaman)

**Contoh Penggunaan:**
```bash
# 1. Search anime dengan kata kunci "girl"
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=girl&limit=10"

# 2. Search dengan filter limit
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=5"

# 3. Search dengan pagination
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=cute&limit=5&page=1"
```

#### B. Get Content Info by ID
**URL:** `GET /api/content/scraper?platform=rule34&action=info&id=12345`

**Parameters:**
- `id=12345` (wajib, ID konten yang sudah diketahui)

**Contoh Penggunaan:**
```bash
# Dapatkan info lengkap konten dengan ID spesifik
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=info&id=12345"
```

#### C. Get Random Content
**URL:** `GET /api/content/scraper?platform=rule34&action=random`

**Parameters:**
- `limit=5` (opsional, jumlah konten random)

**Contoh Penggunaan:**
```bash
# 1. Get 3 random content
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=random&limit=3"

# 2. Get 1 random content
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=random&limit=1"
```

### 🖼️ **Platform: Gelbooru**
**Cocok untuk:** High-quality anime images, fanart

#### A. Search Images
**URL:** `GET /api/content/scraper?platform=gelbooru&action=search`

**Contoh Penggunaan:**
```bash
# 1. Search anime images
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=search&query=anime&limit=10"

# 2. Search dengan tag spesifik
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=search&query=original&limit=5"

# 3. Search untuk mendapatkan image dengan rating tinggi
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=search&query=high_quality&limit=3"
```

#### B. Get Random Images
**URL:** `GET /api/content/scraper?platform=gelbooru&action=random`

**Contoh Penggunaan:**
```bash
# 1. Get 5 random anime images
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=random&limit=5"

# 2. Get 1 random image
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=random&limit=1"
```

### 🎥 **Platform: XNXX**
**Cocok untuk:** Video content metadata extraction

#### A. Search Videos
**URL:** `GET /api/content/scraper?platform=xnxx&action=search`

**Contoh Penggunaan:**
```bash
# 1. Search videos dengan kata kunci
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=hd&limit=10"

# 2. Search videos dengan durasi
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=long&limit=5"

# 3. Search untuk video quality tertentu
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=4k&limit=3"
```

**Catatan Penting untuk XNXX:**
- Response time lebih lambat (5-15 detik) karena HTML parsing
- Metadata mungkin lebih terbatas
- Menggunakan user-agent random untuk menghindari detection

### 🔥 **Platform: XVideos**
**Cocok untuk:** Video content dengan metadata lengkap

#### A. Search Videos
**URL:** `GET /api/content/scraper?platform=xvideos&action=search`

**Contoh Penggunaan:**
```bash
# 1. Search videos
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=search&query=hd&limit=10"

# 2. Search untuk video popular
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=search&query=popular&limit=5"

# 3. Search dengan kategori tertentu
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=search&query=category&limit=3"
```

#### B. Get Videos by Tag
**URL:** `GET /api/content/scraper?platform=xvideos&action=tags&tag=popular`

**Contoh Penggunaan:**
```bash
# 1. Get videos by popular tag
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=popular"

# 2. Get videos by specific tag
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=hd"

# 3. Get videos by trending tag
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=trending"
```

### 📋 **Universal Action: tags**
**Berlaku untuk semua platform**

**URL:** `GET /api/content/scraper?platform=[platform]&action=tags&tag=[tagname]`

**Contoh Penggunaan:**
```bash
# 1. Get tag list dari Rule34
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=tags&tag=anime"

# 2. Get tag list dari Gelbooru
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=tags&tag=original"

# 3. Get tag list dari XVideos
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=popular"
```

### 🔧 **Parameter Details**

#### Required Parameters:
- `platform`: **wajib** diisi - pilih salah satu: `rule34`, `gelbooru`, `xnxx`, `xvideos`

#### Optional Parameters:
- `action`: default adalah `search` - pilihan: `search`, `info`, `random`, `tags`
- `query`: untuk action `search` atau `tags` - kata kunci pencarian
- `id`: untuk action `info` - ID konten yang sudah diketahui
- `tag`: untuk action `tags` - tag spesifik
- `limit`: 1-50 (default: 10) - jumlah hasil yang diinginkan
- `page`: default: 0 - halaman untuk pagination

#### Parameter Validation:
```bash
# ✅ Parameter lengkap
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=5&page=0"

# ❌ Missing platform (akan error)
curl "http://localhost:3000/api/content/scraper?action=search&query=anime"

# ❌ Invalid platform (akan error)
curl "http://localhost:3000/api/content/scraper?platform=invalid&action=search&query=anime"
```

### 🛡️ **Rate Limiting & Best Practices**

#### Rate Limits:
- **30 requests per hour per IP address**
- **Reset setiap 1 jam**
- **Auto-throttle dengan delay 1-3 detik**

#### Best Practices:
```bash
# ✅ Good: Gunakan delay antar request
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=10"
sleep 2
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=search&query=anime&limit=10"
sleep 2
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=hd&limit=5"

# ❌ Bad: Terlalu banyak request dalam waktu singkat
# (Akan error rate limit 429)
```

#### Monitor Rate Limit:
Response selalu include info rate limit:
```json
{
  "rate_limit_info": {
    "requests": 15,
    "limit": 30,
    "remaining": 15
  }
}
```

### 🧪 **Testing**

#### Local Testing
```bash
# Start server
cd /workspace/terastudio-rest-api
npm install
npm start

# Test endpoint
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=test&limit=1"
```

#### Production Testing
```bash
curl "https://your-domain.com/api/content/scraper?platform=gelbooru&action=random"
```

#### Test Semua Platform:
```bash
#!/bin/bash
# test-all-platforms.sh

echo "Testing all platforms..."

# Rule34
echo "Testing Rule34..."
curl "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=3"

sleep 1

# Gelbooru
echo "Testing Gelbooru..."
curl "http://localhost:3000/api/content/scraper?platform=gelbooru&action=random&limit=3"

sleep 1

# XNXX
echo "Testing XNXX..."
curl "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=hd&limit=2"

sleep 1

# XVideos
echo "Testing XVideos..."
curl "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=popular"

echo "All tests completed!"
```

## Migration from NSFW Moderation

### Changes Made:
1. ❌ Removed: `/api/nsfw/*` endpoints (backed up to `api/nsfw.backup/`)
2. ✅ Added: `/api/content/scraper` endpoint
3. 📝 Updated: README.md, package.json documentation
4. 🔧 Updated: All references from NSFW to Content Scraper

### Breaking Changes:
- All `/api/nsfw/*` endpoints no longer available
- Use `/api/content/scraper` instead
- Different parameter structure (see documentation above)

## Support

For issues or questions:
- GitHub: https://github.com/terastudio-org/terastudio-rest-api
- Email: admin@terastudio.org

---

**Built by terastudio Org** | Last Updated: 2025-11-06
