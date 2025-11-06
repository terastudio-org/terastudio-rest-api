import NSFWService from "../../src/services/nsfw/nsfwService.js";

const nsfwService = new NSFWService();

export default {
    name: "Content Safety Analysis",
    description: "Analyze text content for NSFW/safety classification",
    category: "NSFW",
    methods: ["GET", "POST"],
    params: ["text", "imageUrl"],
    paramsSchema: {
        text: { type: "string", required: true, minLength: 1, maxLength: 10000 },
        imageUrl: { 
            type: "string", 
            required: false,
            description: "Optional image URL to analyze" 
        }
    },
    async run(req, res) {
        try {
            const { text, imageUrl } = req.method === 'GET' ? req.query : req.body;
            const clientIP = req.ip || req.connection.remoteAddress;

            if (!text || typeof text !== "string" || text.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'text' wajib diisi untuk analisis konten."
                });
            }

            // Check rate limit
            const rateLimit = nsfwService.checkRateLimit(clientIP);
            if (!rateLimit.allowed) {
                return res.status(429).json({
                    success: false,
                    error: "Rate limit exceeded. Terlalu banyak permintaan analisis konten.",
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    reset_in: "1 hour"
                });
            }

            // Analyze text content
            const textAnalysis = nsfwService.analyzeContentSafety(text);
            
            let imageAnalysis = null;
            if (imageUrl) {
                try {
                    imageAnalysis = await nsfwService.moderateImage(imageUrl);
                } catch (error) {
                    console.error('Image analysis error:', error.message);
                    imageAnalysis = {
                        safe: false,
                        error: "Gagal menganalisis gambar",
                        timestamp: new Date().toISOString()
                    };
                }
            }

            // Generate content warnings
            const warnings = nsfwService.generateContentWarning(textAnalysis);

            // Overall safety determination
            let overallSafe = true;
            let overallRisk = 'low';
            
            if (textAnalysis.classification === 'nsfw') {
                overallSafe = false;
                overallRisk = 'high';
            } else if (textAnalysis.classification === 'mature') {
                overallRisk = 'medium';
            }

            if (imageAnalysis && !imageAnalysis.safe) {
                overallSafe = false;
                overallRisk = 'high';
            }

            const result = {
                overall_safe: overallSafe,
                overall_risk: overallRisk,
                text_analysis: textAnalysis,
                image_analysis: imageAnalysis,
                warnings: warnings,
                rate_limit_info: {
                    requests: rateLimit.requests,
                    limit: rateLimit.limit,
                    remaining: Math.max(0, rateLimit.limit - rateLimit.requests)
                },
                metadata: {
                    content_length: text.length,
                    has_image: !!imageUrl,
                    analysis_timestamp: new Date().toISOString(),
                    client_ip: clientIP
                }
            };

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Content analysis error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat analisis konten",
                timestamp: new Date().toISOString()
            });
        }
    }
};