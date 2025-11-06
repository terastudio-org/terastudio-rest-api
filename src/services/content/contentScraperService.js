import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Content Scraper Service untuk ekstraksi metadata dari platform adult content
 * DISCLAIMER: Service ini HANYA mengekstrak metadata, tidak mendownload konten eksplisit
 * 
 * Platform yang didukung:
 * - Rule34: Image & Video metadata via API
 * - Gelbooru: Image metadata via API
 * - XNXX: Video metadata via scraping
 * - XVideos: Video metadata via scraping
 */
class ContentScraperService {
    constructor() {
        // User agent rotation untuk anti-detection
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        // Rate limiting per IP
        this.rateLimitStore = new Map();
        this.rateLimitMax = 30; // Max requests per hour
        this.rateLimitWindow = 60 * 60 * 1000; // 1 hour

        // Request delays untuk anti-detection (ms)
        this.minDelay = 1000;
        this.maxDelay = 3000;
    }

    /**
     * Get random user agent
     */
    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    /**
     * Random delay untuk anti-detection
     */
    async randomDelay() {
        const delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Check rate limit untuk IP tertentu
     */
    checkRateLimit(ip) {
        const now = Date.now();
        const userRequests = this.rateLimitStore.get(ip) || [];
        
        // Filter requests dalam window
        const recentRequests = userRequests.filter(time => now - time < this.rateLimitWindow);
        
        if (recentRequests.length >= this.rateLimitMax) {
            return {
                allowed: false,
                requests: recentRequests.length,
                limit: this.rateLimitMax
            };
        }
        
        // Add current request
        recentRequests.push(now);
        this.rateLimitStore.set(ip, recentRequests);
        
        return {
            allowed: true,
            requests: recentRequests.length,
            limit: this.rateLimitMax
        };
    }

    /**
     * Rule34 Scraper - menggunakan API
     * Endpoint: https://api.rule34.xxx/index.php?page=dapi&s=post&q=index
     */
    async scrapeRule34(options = {}) {
        try {
            const { query = '', limit = 10, page = 0 } = options;
            
            await this.randomDelay();
            
            const response = await axios.get('https://api.rule34.xxx/index.php', {
                params: {
                    page: 'dapi',
                    s: 'post',
                    q: 'index',
                    tags: query,
                    limit: Math.min(limit, 100),
                    pid: page,
                    json: 1
                },
                headers: {
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 10000
            });

            if (!response.data || response.data.length === 0) {
                return {
                    success: true,
                    platform: 'rule34',
                    results: [],
                    count: 0,
                    message: 'Tidak ada hasil ditemukan'
                };
            }

            const results = response.data.map(item => ({
                id: item.id,
                type: item.image?.includes('.webm') || item.image?.includes('.mp4') ? 'video' : 'image',
                title: `Rule34 Post ${item.id}`,
                tags: item.tags?.split(' ').filter(t => t.length > 0) || [],
                score: item.score || 0,
                rating: item.rating || 'unknown',
                resolution: {
                    width: item.width || null,
                    height: item.height || null
                },
                fileSize: item.file_size || null,
                uploadDate: item.created_at || null,
                thumbnailUrl: item.preview_url || null,
                sourceUrl: `https://rule34.xxx/index.php?page=post&s=view&id=${item.id}`,
                metadata: {
                    source: item.source || null,
                    creator_id: item.creator_id || null,
                    has_comments: item.has_comments || false,
                    has_notes: item.has_notes || false
                }
            }));

            return {
                success: true,
                platform: 'rule34',
                results,
                count: results.length,
                page: page,
                query: query
            };

        } catch (error) {
            console.error('Rule34 scraping error:', error.message);
            return {
                success: false,
                platform: 'rule34',
                error: error.message,
                fallback: 'API tidak tersedia atau rate limited'
            };
        }
    }

    /**
     * Gelbooru Scraper - menggunakan API
     * Endpoint: https://gelbooru.com/index.php?page=dapi&s=post&q=index
     */
    async scrapeGelbooru(options = {}) {
        try {
            const { query = '', limit = 10, page = 0 } = options;
            
            await this.randomDelay();
            
            const response = await axios.get('https://gelbooru.com/index.php', {
                params: {
                    page: 'dapi',
                    s: 'post',
                    q: 'index',
                    tags: query,
                    limit: Math.min(limit, 100),
                    pid: page,
                    json: 1
                },
                headers: {
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 10000
            });

            if (!response.data || !response.data.post || response.data.post.length === 0) {
                return {
                    success: true,
                    platform: 'gelbooru',
                    results: [],
                    count: 0,
                    message: 'Tidak ada hasil ditemukan'
                };
            }

            const results = response.data.post.map(item => ({
                id: item.id,
                type: 'image',
                title: `Gelbooru Post ${item.id}`,
                tags: item.tags?.split(' ').filter(t => t.length > 0) || [],
                score: item.score || 0,
                rating: item.rating || 'unknown',
                resolution: {
                    width: item.width || null,
                    height: item.height || null
                },
                fileSize: item.file_size || null,
                uploadDate: item.created_at || null,
                thumbnailUrl: item.preview_url || null,
                sourceUrl: `https://gelbooru.com/index.php?page=post&s=view&id=${item.id}`,
                metadata: {
                    source: item.source || null,
                    owner: item.owner || null,
                    has_comments: item.has_comments || false,
                    has_notes: item.has_notes || false,
                    change: item.change || null
                }
            }));

            return {
                success: true,
                platform: 'gelbooru',
                results,
                count: results.length,
                page: page,
                query: query
            };

        } catch (error) {
            console.error('Gelbooru scraping error:', error.message);
            return {
                success: false,
                platform: 'gelbooru',
                error: error.message,
                fallback: 'API tidak tersedia atau rate limited'
            };
        }
    }

    /**
     * XNXX Scraper - metadata extraction via HTML scraping
     * URL pattern: https://www.xnxx.com/search/[query]/[page]
     */
    async scrapeXNXX(options = {}) {
        try {
            const { query = '', limit = 10, page = 0 } = options;
            
            await this.randomDelay();
            
            const searchUrl = query 
                ? `https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`
                : `https://www.xnxx.com/?page=${page}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Referer': 'https://www.xnxx.com/'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            // Parse video thumbnails dari halaman
            $('.thumb-block').slice(0, limit).each((i, elem) => {
                const $elem = $(elem);
                const $link = $elem.find('a').first();
                const $img = $elem.find('img').first();
                const $duration = $elem.find('.duration').first();
                const $title = $elem.find('.title').first();
                
                const videoUrl = $link.attr('href');
                const videoId = videoUrl?.split('/').pop()?.split('?')[0] || null;
                
                if (videoId) {
                    results.push({
                        id: videoId,
                        type: 'video',
                        title: $title.text().trim() || `XNXX Video ${videoId}`,
                        tags: [], // Tags tidak tersedia di listing
                        duration: $duration.text().trim() || null,
                        resolution: null, // Tidak tersedia di listing
                        fileSize: null,
                        views: null, // Parse jika ada
                        rating: null,
                        uploadDate: null,
                        thumbnailUrl: $img.attr('data-src') || $img.attr('src') || null,
                        sourceUrl: `https://www.xnxx.com${videoUrl}`,
                        metadata: {
                            platform_specific: 'XNXX',
                            requires_age_verification: true
                        }
                    });
                }
            });

            return {
                success: true,
                platform: 'xnxx',
                results,
                count: results.length,
                page: page,
                query: query,
                note: 'Metadata terbatas - detail lengkap memerlukan parsing individual per video'
            };

        } catch (error) {
            console.error('XNXX scraping error:', error.message);
            return {
                success: false,
                platform: 'xnxx',
                error: error.message,
                fallback: 'Website mungkin blocked atau struktur HTML berubah'
            };
        }
    }

    /**
     * XVideos Scraper - metadata extraction via HTML scraping
     * URL pattern: https://www.xvideos.com/?k=[query]&p=[page]
     */
    async scrapeXVideos(options = {}) {
        try {
            const { query = '', limit = 10, page = 0 } = options;
            
            await this.randomDelay();
            
            const searchUrl = query 
                ? `https://www.xvideos.com/?k=${encodeURIComponent(query)}&p=${page}`
                : `https://www.xvideos.com/?p=${page}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Referer': 'https://www.xvideos.com/'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            // Parse video thumbnails dari halaman
            $('.thumb-block').slice(0, limit).each((i, elem) => {
                const $elem = $(elem);
                const $link = $elem.find('a').first();
                const $img = $elem.find('img').first();
                const $duration = $elem.find('.duration').first();
                const $title = $elem.find('.title').first();
                const $metadata = $elem.find('.metadata').first();
                
                const videoUrl = $link.attr('href');
                const videoId = videoUrl?.split('/').pop()?.split('?')[0] || null;
                
                if (videoId) {
                    results.push({
                        id: videoId,
                        type: 'video',
                        title: $title.text().trim() || `XVideos ${videoId}`,
                        tags: [], // Tags tidak tersedia di listing
                        duration: $duration.text().trim() || null,
                        resolution: null,
                        fileSize: null,
                        views: null, // Parse dari metadata jika ada
                        rating: null,
                        uploadDate: null,
                        thumbnailUrl: $img.attr('data-src') || $img.attr('src') || null,
                        sourceUrl: `https://www.xvideos.com${videoUrl}`,
                        metadata: {
                            platform_specific: 'XVideos',
                            requires_age_verification: true,
                            additional_info: $metadata.text().trim() || null
                        }
                    });
                }
            });

            return {
                success: true,
                platform: 'xvideos',
                results,
                count: results.length,
                page: page,
                query: query,
                note: 'Metadata terbatas - detail lengkap memerlukan parsing individual per video'
            };

        } catch (error) {
            console.error('XVideos scraping error:', error.message);
            return {
                success: false,
                platform: 'xvideos',
                error: error.message,
                fallback: 'Website mungkin blocked atau struktur HTML berubah'
            };
        }
    }

    /**
     * Get info detail untuk single item (by ID)
     * Implementasi basic - bisa dikembangkan lebih lanjut
     */
    async getItemInfo(platform, id) {
        try {
            switch (platform.toLowerCase()) {
                case 'rule34':
                    const r34Result = await this.scrapeRule34({ query: `id:${id}`, limit: 1 });
                    return r34Result.results[0] || null;
                
                case 'gelbooru':
                    const gbResult = await this.scrapeGelbooru({ query: `id:${id}`, limit: 1 });
                    return gbResult.results[0] || null;
                
                case 'xnxx':
                case 'xvideos':
                    return {
                        success: false,
                        error: 'Detail scraping untuk video platforms memerlukan implementasi tambahan',
                        suggestion: 'Gunakan search endpoint untuk mendapatkan metadata'
                    };
                
                default:
                    return {
                        success: false,
                        error: 'Platform tidak didukung'
                    };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Universal search across platform
     */
    async search(platform, query, options = {}) {
        const { limit = 10, page = 0 } = options;
        
        switch (platform.toLowerCase()) {
            case 'rule34':
                return await this.scrapeRule34({ query, limit, page });
            
            case 'gelbooru':
                return await this.scrapeGelbooru({ query, limit, page });
            
            case 'xnxx':
                return await this.scrapeXNXX({ query, limit, page });
            
            case 'xvideos':
                return await this.scrapeXVideos({ query, limit, page });
            
            default:
                return {
                    success: false,
                    error: 'Platform tidak didukung. Pilih: rule34, gelbooru, xnxx, atau xvideos'
                };
        }
    }

    /**
     * Get random content dari platform
     */
    async getRandom(platform, options = {}) {
        const randomQueries = ['', 'popular', 'latest', 'top'];
        const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
        
        return await this.search(platform, randomQuery, { 
            limit: options.limit || 5, 
            page: Math.floor(Math.random() * 10) 
        });
    }

    /**
     * Get popular tags dari platform (jika tersedia)
     */
    async getTags(platform, tag = '') {
        // Implementasi basic - bisa dikembangkan lebih lanjut
        return await this.search(platform, tag, { limit: 20, page: 0 });
    }
}

export default ContentScraperService;
