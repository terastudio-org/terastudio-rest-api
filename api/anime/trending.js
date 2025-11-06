import AnimeService from "../../src/services/anime/animeService.js";

const animeService = new AnimeService();

export default {
    name: "Trending Anime",
    description: "Get trending/popular anime from various sources",
    category: "Anime",
    methods: ["GET"],
    params: ["source", "limit"],
    paramsSchema: {
        source: { type: "string", required: false, enum: ["jikan", "kitsu"], default: "jikan" },
        limit: { type: "number", required: false, min: 1, max: 50, default: 20 }
    },
    async run(req, res) {
        try {
            const { source = "jikan", limit = 20 } = req.query;

            const results = await animeService.getTrendingAnime(source, parseInt(limit));

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Tidak ada anime trending yang ditemukan.",
                    source: source
                });
            }

            res.json({
                success: true,
                data: {
                    results: results,
                    total: results.length,
                    source: source,
                    limit: parseInt(limit)
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Trending anime error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mengambil anime trending",
                timestamp: new Date().toISOString()
            });
        }
    }
};