import AnimeService from "../../src/services/anime/animeService.js";

const animeService = new AnimeService();

export default {
    name: "Anime Detail",
    description: "Get detailed information about a specific anime",
    category: "Anime",
    methods: ["GET"],
    params: ["id", "source"],
    paramsSchema: {
        id: { type: "string", required: true, minLength: 1 },
        source: { type: "string", required: false, enum: ["jikan", "kitsu"], default: "jikan" }
    },
    async run(req, res) {
        try {
            const { id, source = "jikan" } = req.query;

            if (!id || typeof id !== "string" || id.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'id' wajib diisi untuk mendapatkan detail anime."
                });
            }

            let result = null;
            
            if (source === "jikan") {
                // For Jikan, id is usually mal_id (numeric)
                result = await animeService.scrapeJikanDetail(id);
            } else if (source === "kitsu") {
                // For Kitsu, id is the Kitsu anime ID
                result = await animeService.scrapeKitsuDetail(id);
            }

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: "Anime tidak ditemukan dengan ID tersebut.",
                    id: id,
                    source: source
                });
            }

            res.json({
                success: true,
                data: {
                    anime: result,
                    id: id,
                    source: source
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Anime detail error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mengambil detail anime",
                timestamp: new Date().toISOString()
            });
        }
    }
};