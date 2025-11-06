import NSFWService from "../../src/services/nsfw/nsfwService.js";

const nsfwService = new NSFWService();

export default {
    name: "URL Safety Check",
    description: "Check URL safety and classify potential NSFW content",
    category: "NSFW",
    methods: ["GET", "POST"],
    params: ["url"],
    paramsSchema: {
        url: { type: "string", required: true, minLength: 10 }
    },
    async run(req, res) {
        try {
            const { url } = req.method === 'GET' ? req.query : req.body;
            const clientIP = req.ip || req.connection.remoteAddress;

            if (!url || typeof url !== "string" || !url.startsWith('http')) {
                return res.status(400).json({
                    success: false,
                    error: "URL yang valid wajib disediakan (harus dimulai dengan http:// atau https://)."
                });
            }

            // Check rate limit
            const rateLimit = nsfwService.checkRateLimit(clientIP);
            if (!rateLimit.allowed) {
                return res.status(429).json({
                    success: false,
                    error: "Rate limit exceeded. Terlalu banyak permintaan pengecekan URL.",
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    reset_in: "1 hour"
                });
            }

            // Perform URL safety check
            const safetyResult = await nsfwService.checkURLSafety(url);

            // Generate safety recommendations
            let recommendations = [];
            if (safetyResult.classification === 'unsafe') {
                recommendations.push("URL tidak aman. Hindari mengakses konten dari domain ini.");
            } else if (safetyResult.classification === 'suspicious') {
                recommendations.push("URL mencurigakan. Berhati-hatilah saat mengakses konten.");
            } else if (safetyResult.classification === 'safe') {
                recommendations.push("URL terlihat aman untuk diakses.");
            }

            if (safetyResult.checks && !safetyResult.checks.isHTTPS) {
                recommendations.push("Peringatan: URL tidak menggunakan HTTPS. Data mungkin tidak aman.");
            }

            const result = {
                url: safetyResult.url,
                domain: safetyResult.domain,
                safety_score: safetyResult.safetyScore,
                classification: safetyResult.classification,
                is_safe: safetyResult.safetyScore >= 60,
                safety_checks: safetyResult.checks,
                recommendations: recommendations,
                rate_limit_info: {
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    remaining: Math.max(0, rateLimit.limit - rateLimit.requests)
                },
                metadata: {
                    checked_at: safetyResult.timestamp,
                    client_ip: clientIP,
                    cache_hit: safetyResult.cached || false
                }
            };

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('URL safety check error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat pengecekan keamanan URL",
                timestamp: new Date().toISOString()
            });
        }
    }
};