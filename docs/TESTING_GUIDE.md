# Testing Guide - terastudio API

## 🧪 Overview
Panduan lengkap untuk testing semua endpoint terastudio REST API dengan contoh praktis dan troubleshooting.

## 🚀 Quick Start Testing

### 1. Start Server
```bash
cd /workspace/terastudio-rest-api
npm install
npm start
```

### 2. Basic Health Check
```bash
curl "http://localhost:3000/"
```
**Expected Response:**
```json
{
  "success": true,
  "message": "terastudio REST API is running",
  "version": "1.0.0",
  "features": {
    "anime": "Enabled",
    "youtube": "Enabled", 
    "content_scraper": "Enabled",
    "ai": "Enabled"
  },
  "timestamp": "2025-11-06T21:30:00.000Z"
}
```

---

## 🎌 Anime API Testing

### 1. Anime Search Testing

#### Basic Search
```bash
# Test 1.1: Simple search
curl -s "http://localhost:3000/api/anime/search?q=Naruto" | jq '.'

# Expected: List of Naruto anime with metadata
```

#### Search with Filters
```bash
# Test 1.2: Search with type and status
curl -s "http://localhost:3000/api/anime/search?q=action&type=TV&status=complete&limit=5" | jq '.'

# Test 1.3: Search with genre and score
curl -s "http://localhost:3000/api/anime/search?q=romance&genre=22&score=7.0" | jq '.'

# Test 1.4: Search with year and season
curl -s "http://localhost:3000/api/anime/search?q=2024&year=2024&season=winter" | jq '.'
```

#### Source Testing
```bash
# Test 1.5: Test Jikan API (MyAnimeList)
curl -s "http://localhost:3000/api/anime/search?q=anime&source=jikan" | jq '.data.results[0] | {id, title, source}'

# Test 1.6: Test Kitsu API
curl -s "http://localhost:3000/api/anime/search?q=anime&source=kitsu" | jq '.data.results[0] | {id, title, source}'
```

### 2. Anime Detail Testing

#### Detail by ID
```bash
# Test 2.1: Get detail for Naruto (ID: 20)
curl -s "http://localhost:3000/api/anime/detail?id=20" | jq '.'

# Test 2.2: Get detail with source parameter
curl -s "http://localhost:3000/api/anime/detail?id=20&source=jikan" | jq '.'
```

### 3. Trending Anime Testing

```bash
# Test 3.1: Get default trending
curl -s "http://localhost:3000/api/anime/trending" | jq '.data.results[0] | {title, score, popularity}'

# Test 3.2: Get trending with custom limit
curl -s "http://localhost:3000/api/anime/trending?limit=5" | jq '.data.count'

# Test 3.3: Get trending from different source
curl -s "http://localhost:3000/api/anime/trending?source=kitsu" | jq '.'
```

### 4. Seasonal Testing

```bash
# Test 4.1: Get current season
curl -s "http://localhost:3000/api/anime/seasonal" | jq '.data.anime[0] | {title, year, season, status}'

# Test 4.2: Get specific season
curl -s "http://localhost:3000/api/anime/seasonal?year=2024&season=winter" | jq '.'

# Test 4.3: Get airing anime
curl -s "http://localhost:3000/api/anime/seasonal?status=current" | jq '.data.anime[0] | {title, episodes, status}'
```

### 5. Random Anime Testing

```bash
# Test 5.1: Get random anime
curl -s "http://localhost:3000/api/anime/random" | jq '.data.anime | {title, type, year, score}'

# Test 5.2: Get random with filters
curl -s "http://localhost:3000/api/anime/random?type=TV&status=complete&score_min=7.0" | jq '.'

# Test 5.3: Get random with genre
curl -s "http://localhost:3000/api/anime/random?genres=1,2&limit=3" | jq '.'
```

### 6. Advanced Search Testing

```bash
# Test 6.1: Advanced search with multiple filters
curl -s "http://localhost:3000/api/anime/advanced?q=action&type=TV&score_min=7.5&limit=10" | jq '.'

# Test 6.2: Advanced search with exclude genres
curl -s "http://localhost:3000/api/anime/advanced?q=anime&genres=22&genres_exclude=8,37" | jq '.'

# Test 6.3: Advanced search with studio filter
curl -s "http://localhost:3000/api/anime/advanced?studios=Studio%20Pierrot" | jq '.'
```

---

## 📹 YouTube API Testing

### 1. Video Info Testing

#### Basic Info
```bash
# Test 1.1: Get basic video info
curl -s "http://localhost:3000/api/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" | jq '.'

# Expected: Video metadata with formats
```

#### Info with Quality
```bash
# Test 1.2: Get info with quality preference
curl -s "http://localhost:3000/api/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=720p" | jq '.data.formats'
```

### 2. Download Testing

#### Video Download
```bash
# Test 2.1: Start video download
curl -s "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=mp4&quality=720p" | jq '.'

# Expected: Download initiation with progress tracking
```

#### Audio Download
```bash
# Test 2.2: Start audio download
curl -s "http://localhost:3000/api/youtube/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=mp3" | jq '.'
```

### 3. Progress Tracking Testing

```bash
# Test 3.1: Check download progress (use ID from download response)
curl -s "http://localhost:3000/api/youtube/progress?id=download_12345" | jq '.'

# Test 3.2: Monitor progress for multiple downloads
# Get multiple download IDs and monitor them
```

### 4. Playlist Testing

```bash
# Test 4.1: Get playlist info
curl -s "http://localhost:3000/api/youtube/playlist?url=https://www.youtube.com/playlist?list=PLN3F6g1E6" | jq '.'

# Test 4.2: Download playlist (partial)
curl -s "http://localhost:3000/api/youtube/playlist?url=https://www.youtube.com/playlist?list=PLN3F6g1E6&limit=2" | jq '.'
```

### 5. Search Testing

```bash
# Test 5.1: Basic search
curl -s "http://localhost:3000/api/youtube/search?q=naruto&limit=3" | jq '.data.results[0] | {title, duration, view_count}'

# Test 5.2: Search with filters
curl -s "http://localhost:3000/api/youtube/search?q=music&sort=view_count&duration=short&limit=5" | jq '.'
```

---

## 🔍 Content Scraper Testing

### 1. Platform Testing

#### Rule34 Testing
```bash
# Test 1.1: Rule34 search
curl -s "http://localhost:3000/api/content/scraper?platform=rule34&action=search&query=anime&limit=3" | jq '.'

# Test 1.2: Rule34 random
curl -s "http://localhost:3000/api/content/scraper?platform=rule34&action=random&limit=2" | jq '.'

# Test 1.3: Rule34 info
curl -s "http://localhost:3000/api/content/scraper?platform=rule34&action=info&id=12345" | jq '.'
```

#### Gelbooru Testing
```bash
# Test 2.1: Gelbooru search
curl -s "http://localhost:3000/api/content/scraper?platform=gelbooru&action=search&query=original&limit=3" | jq '.'

# Test 2.2: Gelbooru random
curl -s "http://localhost:3000/api/content/scraper?platform=gelbooru&action=random&limit=2" | jq '.'
```

#### XNXX Testing
```bash
# Test 3.1: XNXX search (slower due to HTML parsing)
curl -s "http://localhost:3000/api/content/scraper?platform=xnxx&action=search&query=hd&limit=2" | jq '.'

# Test 3.2: XNXX random
curl -s "http://localhost:3000/api/content/scraper?platform=xnxx&action=random&limit=1" | jq '.'
```

#### XVideos Testing
```bash
# Test 4.1: XVideos search
curl -s "http://localhost:3000/api/content/scraper?platform=xvideos&action=search&query=popular&limit=2" | jq '.'

# Test 4.2: XVideos by tags
curl -s "http://localhost:3000/api/content/scraper?platform=xvideos&action=tags&tag=popular" | jq '.'
```

### 2. Rate Limiting Testing

```bash
# Test 5.1: Trigger rate limit (make >30 requests)
for i in {1..35}; do
    echo "Request $i:"
    curl -s "http://localhost:3000/api/content/scraper?platform=rule34&action=random" | jq '.rate_limit_info // "No rate limit info"'
    sleep 1
done

# Expected: After 30 requests, should get 429 error
```

### 3. Error Handling Testing

```bash
# Test 6.1: Invalid platform
curl -s "http://localhost:3000/api/content/scraper?platform=invalid&action=search&query=test" | jq '.'

# Test 6.2: Missing required parameters
curl -s "http://localhost:3000/api/content/scraper?action=search" | jq '.'

# Test 6.3: Invalid limit parameter
curl -s "http://localhost:3000/api/content/scraper?platform=rule34&action=search&limit=100" | jq '.'
```

---

## 🤖 AI API Testing

### 1. GPT Chat Testing

#### Simple Chat
```bash
# Test 1.1: Basic GPT request
curl -s "http://localhost:3000/api/ai/gpt?message=Hello, how are you?" | jq '.'

# Test 1.2: GPT with different model
curl -s "http://localhost:3000/api/ai/gpt?message=Explain quantum physics&model=gpt-4" | jq '.'
```

#### POST Request Testing
```bash
# Test 1.3: POST request with JSON
curl -X POST http://localhost:3000/api/ai/gpt \
  -H "Content-Type: application/json" \
  -d '{"message": "Write a short poem about coding", "model": "gpt-3.5-turbo"}' | jq '.'
```

### 2. Content Writing Testing

```bash
# Test 2.1: Basic content generation
curl -s "http://localhost:3000/api/ai/write-cream?topic=artificial%20intelligence&length=short" | jq '.'

# Test 2.2: POST with detailed parameters
curl -X POST http://localhost:3000/api/ai/write-cream \
  -H "Content-Type: application/json" \
  -d '{"topic": "future of technology", "length": "medium", "style": "formal", "language": "en"}' | jq '.'
```

---

## 🎲 Random Data Testing

### Blue Archive Testing

```bash
# Test 1.1: Random character
curl -s "http://localhost:3000/api/random/bluearchive?type=character" | jq '.'

# Test 1.2: Random school
curl -s "http://localhost:3000/api/random/bluearchive?type=school" | jq '.'

# Test 1.3: Multiple random items
curl -s "http://localhost:3000/api/random/bluearchive?type=character&limit=3" | jq '.'
```

---

## 🔧 Automated Testing Scripts

### 1. Complete API Test Script
```bash
#!/bin/bash
# run-full-test.sh

API_BASE="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== terastudio API Full Test Suite ==="
echo "Starting at: $(date)"
echo ""

test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -m 10 "$url" 2>/dev/null)
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$url" 2>/dev/null)
    fi
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} (200)"
        return 0
    else
        echo -e "${RED}✗${NC} ($status_code)"
        echo "Response: $body" | head -n 3
        return 1
    fi
}

# Health checks
echo "1. Health Checks:"
test_endpoint "Main API" "$API_BASE/"
test_endpoint "API Documentation" "$API_BASE/"

echo ""
echo "2. Anime API:"
test_endpoint "Anime Search" "$API_BASE/api/anime/search?q=test&limit=1"
test_endpoint "Anime Detail" "$API_BASE/api/anime/detail?id=20"
test_endpoint "Trending" "$API_BASE/api/anime/trending?limit=1"
test_endpoint "Seasonal" "$API_BASE/api/anime/seasonal?limit=1"
test_endpoint "Random" "$API_BASE/api/anime/random"
test_endpoint "Advanced" "$API_BASE/api/anime/advanced?q=test&limit=1"

echo ""
echo "3. YouTube API:"
test_endpoint "Video Info" "$API_BASE/api/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
test_endpoint "YouTube Search" "$API_BASE/api/youtube/search?q=test&limit=1"

echo ""
echo "4. Content Scraper:"
test_endpoint "Rule34 Search" "$API_BASE/api/content/scraper?platform=rule34&action=search&query=test&limit=1"
test_endpoint "Gelbooru Search" "$API_BASE/api/content/scraper?platform=gelbooru&action=random&limit=1"
test_endpoint "Random Content" "$API_BASE/api/content/scraper?platform=rule34&action=random&limit=1"

echo ""
echo "5. AI Services:"
test_endpoint "GPT Chat" "$API_BASE/api/ai/gpt?message=hello"
test_endpoint "Content Writing" "$API_BASE/api/ai/write-cream?topic=test&length=short"

echo ""
echo "6. Random Data:"
test_endpoint "Blue Archive" "$API_BASE/api/random/bluearchive?type=character"

echo ""
echo "=== Test Suite Complete ==="
echo "Finished at: $(date)"
```

### 2. Performance Testing
```bash
#!/bin/bash
# performance-test.sh

API_BASE="http://localhost:3000"

echo "=== Performance Testing ==="

# Test response times
echo "Testing response times (5 requests each)..."

for endpoint in \
    "GET|$API_BASE/|" \
    "GET|$API_BASE/api/anime/search?q=test|" \
    "GET|$API_BASE/api/content/scraper?platform=rule34&action=random|"; do
    
    IFS='|' read -r method url extra <<< "$endpoint"
    echo ""
    echo "Testing: $url"
    
    total_time=0
    success_count=0
    
    for i in {1..5}; do
        start_time=$(date +%s.%N)
        response=$(curl -s -w "%{http_code}" -m 5 "$url")
        end_time=$(date +%s.%N)
        
        response_time=$(echo "$end_time - $start_time" | bc)
        total_time=$(echo "$total_time + $response_time" | bc)
        
        status_code="${response: -3}"
        if [ "$status_code" = "200" ]; then
            success_count=$((success_count + 1))
        fi
        
        echo "  Request $i: ${response_time}s (Status: $status_code)"
        sleep 0.5
    done
    
    avg_time=$(echo "scale=3; $total_time / 5" | bc)
    echo "  Average: ${avg_time}s | Success: $success_count/5"
done

echo ""
echo "=== Performance Test Complete ==="
```

### 3. Load Testing
```bash
#!/bin/bash
# load-test.sh

API_BASE="http://localhost:3000"
CONCURRENT_USERS=10
REQUESTS_PER_USER=20

echo "=== Load Testing ==="
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Requests per User: $REQUESTS_PER_USER"
echo ""

load_test() {
    local user_id=$1
    local success=0
    local failed=0
    
    for i in $(seq 1 $REQUESTS_PER_USER); do
        # Random endpoint
        case $((RANDOM % 4)) in
            0)
                url="$API_BASE/api/anime/search?q=test&limit=1"
                ;;
            1)
                url="$API_BASE/api/content/scraper?platform=rule34&action=random&limit=1"
                ;;
            2)
                url="$API_BASE/api/ai/gpt?message=hello"
                ;;
            3)
                url="$API_BASE/api/random/bluearchive?type=character"
                ;;
        esac
        
        response=$(curl -s -w "%{http_code}" -m 2 "$url" 2>/dev/null)
        status_code="${response: -3}"
        
        if [ "$status_code" = "200" ]; then
            success=$((success + 1))
        else
            failed=$((failed + 1))
        fi
        
        # Small delay between requests
        sleep 0.1
    done
    
    echo "User $user_id: $success success, $failed failed"
}

# Start concurrent users
for user in $(seq 1 $CONCURRENT_USERS); do
    load_test $user &
done

# Wait for all users to complete
wait

echo ""
echo "=== Load Test Complete ==="
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Server Not Starting
```bash
# Check if port is in use
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -t -i:3000)

# Start server again
npm start
```

#### 2. Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 3. YouTube Download Issues
```bash
# Check if yt-dlp is installed
which yt-dlp

# If not installed, run setup
npm run setup:youtube

# Check ffmpeg
ffmpeg -version
```

#### 4. API Rate Limiting
```bash
# Check rate limit status in response
curl -s "http://localhost:3000/api/content/scraper?platform=rule34&action=random" | jq '.rate_limit_info'

# Wait for rate limit reset
echo "Waiting 60 seconds for rate limit reset..."
sleep 60
```

#### 5. Network Issues
```bash
# Test basic connectivity
ping -c 3 google.com

# Test API connectivity
curl -v "http://localhost:3000/"

# Check DNS resolution
nslookup localhost
```

### Debug Mode
```bash
# Start server in debug mode
DEBUG=* npm start

# Check logs
tail -f data/logs/api.log
```

### Environment Check
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List all installed packages
npm list

# Check environment variables
env | grep -E "(PORT|NODE_ENV|ADMIN_KEY)"
```

### Log Analysis
```bash
# View recent API logs
tail -50 data/logs/api.log

# View error logs only
grep -i error data/logs/api.log

# View requests by timestamp
grep "2025-11-06" data/logs/api.log
```

---

## 📊 Test Results Interpretation

### Success Indicators
- ✅ 200 status codes
- ✅ Response time < 2 seconds
- ✅ Valid JSON responses
- ✅ All required fields present
- ✅ Rate limit info available (for content scraper)

### Warning Indicators
- ⚠️ Response time > 5 seconds
- ⚠️ 429 rate limit responses
- ⚠️ Empty data arrays
- ⚠️ Missing metadata fields

### Error Indicators
- ❌ 500 server errors
- ❌ 400 bad request errors
- ❌ 404 not found errors
- ❌ Network timeouts
- ❌ Invalid JSON responses

---

## 📈 Monitoring and Alerts

### Health Check Script
```bash
#!/bin/bash
# health-monitor.sh

API_BASE="http://localhost:3000"
ALERT_THRESHOLD=3

check_endpoint() {
    local url="$1"
    local name="$2"
    
    if ! curl -s -f "$url" > /dev/null; then
        echo "❌ $name is DOWN"
        return 1
    else
        echo "✅ $name is UP"
        return 0
    fi
}

failed_count=0

# Check all endpoints
echo "Health Check - $(date)"
echo "=================="

check_endpoint "$API_BASE/" "Main API" || failed_count=$((failed_count + 1))
check_endpoint "$API_BASE/api/anime/search?q=test" "Anime API" || failed_count=$((failed_count + 1))
check_endpoint "$API_BASE/api/content/scraper?platform=rule34&action=random" "Content Scraper" || failed_count=$((failed_count + 1))

echo ""
if [ $failed_count -ge $ALERT_THRESHOLD ]; then
    echo "🚨 ALERT: $failed_count endpoints are down!"
    exit 1
else
    echo "✅ All systems operational"
    exit 0
fi
```

### Response Time Monitoring
```bash
#!/bin/bash
# monitor-response-time.sh

API_BASE="http://localhost:3000"
LOG_FILE="data/logs/response-times.log"

while true; do
    timestamp=$(date +%Y-%m-%d\ %H:%M:%S)
    
    # Test main endpoint
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$API_BASE/")
    
    echo "$timestamp,$response_time" >> "$LOG_FILE"
    
    echo "Response time: ${response_time}s"
    
    sleep 60
done
```

---

**Testing Guide untuk terastudio REST API**  
**Terakhir diupdate: 2025-11-06**  
**Built by terastudio Organization**
