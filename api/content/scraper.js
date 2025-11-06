import ContentScraperService from "../../src/services/content/contentScraperService.js";

const scraperService = new ContentScraperService();

/**
 * DISCLAIMER LEGAL:
 * Endpoint ini HANYA untuk ekstraksi metadata dari platform adult content.
 * TIDAK ada download atau penyimpanan konten eksplisit.
 * Pengguna bertanggung jawab atas penggunaan data yang diperoleh.
 * Service ini mematuhi robots.txt dan rate limiting untuk menghormati server sumber.
 */

export default {
    name: "Content Scraper",
    description: "Ekstraksi metadata dari platform adult content (Rule34, Gelbooru, XNXX, XVideos). HANYA metadata, tidak download konten.",
    category: "Content",
    methods: ["GET", "POST"],
    params: ["platform", "action", "query", "id", "tag", "limit", "page"],
    paramsSchema: {
        platform: { 
            type: "string", 
            required: true,
            enum: ["rule34", "gelbooru", "xnxx", "xvideos"],
            description: "Platform target: rule34, gelbooru, xnxx, xvideos" 
        },
        action: { 
            type: "string", 
            required: false,
            enum: ["search", "info", "random", "tags"],
            default: "search",
            description: "Aksi yang akan dilakukan: search, info, random, tags" 
        },
        query: { 
            type: "string", 
            required: false,
            description: "Query pencarian (untuk action=search atau tags)" 
        },
        id: { 
            type: "string", 
            required: false,
            description: "ID konten spesifik (untuk action=info)" 
        },
        tag: { 
            type: "string", 
            required: false,
            description: "Tag spesifik (untuk action=tags)" 
        },
        limit: { 
            type: "number", 
            required: false,
            default: 10,
            min: 1,
            max: 50,
            description: "Jumlah hasil maksimal" 
        },
        page: { 
            type: "number", 
            required: false,
            default: 0,
            min: 0,
            description: "Nomor halaman untuk pagination" 
        }
    },

    async run(req, res) {
        try {
            const params = req.method === 'GET' ? req.query : req.body;
            const { 
                platform, 
                action = 'search', 
                query = '', 
                id = null,
                tag = '',
                limit = 10, 
                page = 0 
            } = params;

            const clientIP = req.ip || req.connection.remoteAddress;

            // Validasi platform
            const supportedPlatforms = ['rule34', 'gelbooru', 'xnxx', 'xvideos'];
            if (!platform || !supportedPlatforms.includes(platform.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'platform' wajib diisi. Pilih: rule34, gelbooru, xnxx, atau xvideos",
                    supported_platforms: supportedPlatforms
                });
            }

            // Check rate limit
            const rateLimit = scraperService.checkRateLimit(clientIP);
            if (!rateLimit.allowed) {
                return res.status(429).json({
                    success: false,
                    error: "Rate limit exceeded. Terlalu banyak permintaan scraping.",
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    reset_in: "1 hour",
                    suggestion: "Tunggu beberapa saat sebelum melakukan request lagi"
                });
            }

            let result;

            // Routing berdasarkan action
            switch (action.toLowerCase()) {
                case 'search':
                    result = await scraperService.search(
                        platform, 
                        query, 
                        { 
                            limit: Math.min(parseInt(limit) || 10, 50), 
                            page: parseInt(page) || 0 
                        }
                    );
                    break;

                case 'info':
                    if (!id) {
                        return res.status(400).json({
                            success: false,
                            error: "Parameter 'id' diperlukan untuk action=info"
                        });
                    }
                    result = await scraperService.getItemInfo(platform, id);
                    break;

                case 'random':
                    result = await scraperService.getRandom(
                        platform, 
                        { 
                            limit: Math.min(parseInt(limit) || 5, 20) 
                        }
                    );
                    break;

                case 'tags':
                    result = await scraperService.getTags(platform, tag);
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        error: "Action tidak valid. Pilih: search, info, random, atau tags"
                    });
            }

            // Response dengan disclaimer
            res.json({
                success: result.success !== false,
                data: result,
                rate_limit_info: {
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    remaining: Math.max(0, rateLimit.limit - rateLimit.requests)
                },
                disclaimer: {
                    legal: "Metadata only - No explicit content downloaded or stored",
                    usage: "User is responsible for data usage compliance with local laws",
                    attribution: "Data scraped from public APIs and websites with rate limiting"
                },
                metadata: {
                    action: action,
                    platform: platform,
                    client_ip: clientIP,
                    timestamp: new Date().toISOString()
                },
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Content scraper error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat scraping konten",
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                timestamp: new Date().toISOString()
            });
        }
    }
};
