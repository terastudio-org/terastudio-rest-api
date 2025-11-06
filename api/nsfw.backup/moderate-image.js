import NSFWService from "../../src/services/nsfw/nsfwService.js";

const nsfwService = new NSFWService();

export default {
    name: "Image Moderation",
    description: "Moderate images for NSFW content using AI analysis",
    category: "NSFW",
    methods: ["GET", "POST"],
    params: ["imageUrl"],
    paramsSchema: {
        imageUrl: { type: "string", required: true, minLength: 10 }
    },
    async run(req, res) {
        try {
            const { imageUrl } = req.method === 'GET' ? req.query : req.body;
            const clientIP = req.ip || req.connection.remoteAddress;

            if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith('http')) {
                return res.status(400).json({
                    success: false,
                    error: "URL gambar yang valid wajib disediakan."
                });
            }

            // Check rate limit
            const rateLimit = nsfwService.checkRateLimit(clientIP);
            if (!rateLimit.allowed) {
                return res.status(429).json({
                    success: false,
                    error: "Rate limit exceeded. Terlalu banyak permintaan moderasi gambar.",
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    reset_in: "1 hour"
                });
            }

            // Perform image moderation
            const moderationResult = await nsfwService.moderateImage(imageUrl);

            // Generate moderation recommendations
            let recommendations = [];
            if (!moderationResult.safe) {
                recommendations.push("Gambar tidak aman untuk ditampilkan.");
                if (moderationResult.reason) {
                    recommendations.push(`Alasan: ${moderationResult.reason}`);
                }
            } else {
                recommendations.push("Gambar appears safe untuk ditampilkan.");
            }

            if (moderationResult.urlSafety && moderationResult.urlSafety.classification !== 'safe') {
                recommendations.push("Peringatan: Sumber gambar mungkin tidak terpercaya.");
            }

            const result = {
                image_url: moderationResult.imageUrl,
                safe: moderationResult.safe,
                confidence: moderationResult.confidence || null,
                classification: moderationResult.classification,
                warnings: moderationResult.warnings || [],
                recommendations: recommendations,
                url_safety: moderationResult.urlSafety,
                rate_limit_info: {
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    remaining: Math.max(0, rateLimit.limit - rateLimit.requests)
                },
                metadata: {
                    moderated_at: moderationResult.timestamp,
                    client_ip: clientIP,
                    processing_note: moderationResult.note || "Processed successfully"
                }
            };

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Image moderation error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat moderasi gambar",
                timestamp: new Date().toISOString()
            });
        }
    }
};