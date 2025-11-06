import AnimeService from "../../src/services/anime/animeService.js";

const animeService = new AnimeService();

export default {
    name: "Anime Search",
    description: "Search anime from multiple sources (Kitsu, MyAnimeList via Jikan API)",
    category: "Anime",
    methods: ["GET"],
    params: ["q", "page", "source"],
    paramsSchema: {
        q: { type: "string", required: true, minLength: 1 },
        page: { type: "number", required: false, min: 1, max: 100, default: 1 },
        source: { type: "string", required: false, enum: ["jikan", "kitsu"], default: "jikan" }
    },
    async run(req, res) {
        try {
            const { q, page = 1, source = "jikan" } = req.query;

            if (!q || typeof q !== "string" || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'q' (query) wajib diisi untuk pencarian anime."
                });
            }

            let results = [];
            
            if (source === "jikan") {
                results = await animeService.scrapeJikanSearch(q, parseInt(page));
            } else if (source === "kitsu") {
                results = await animeService.scrapeKitsuSearch(q, parseInt(page));
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Tidak ada anime yang ditemukan untuk query tersebut.",
                    query: q,
                    source: source
                });
            }

            res.json({
                success: true,
                data: {
                    results: results,
                    total: results.length,
                    query: q,
                    page: parseInt(page),
                    source: source
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Anime search error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mencari anime",
                timestamp: new Date().toISOString()
            });
        }
    }
};