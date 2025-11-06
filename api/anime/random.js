import AnimeService from "../../src/services/anime/animeService.js";

const animeService = new AnimeService();

export default {
    name: "Random Anime",
    description: "Get random anime recommendations with optional filters",
    category: "Anime",
    methods: ["GET"],
    params: ["genre", "type", "count", "source"],
    paramsSchema: {
        genre: { 
            type: "string", 
            required: false,
            description: "Genre ID (e.g., 1 for Action, 4 for Comedy)" 
        },
        type: { 
            type: "string", 
            required: false, 
            enum: ["TV", "Movie", "OVA", "Special"] 
        },
        count: { 
            type: "number", 
            required: false, 
            min: 1, 
            max: 20, 
            default: 10 
        },
        source: { 
            type: "string", 
            required: false, 
            enum: ["jikan", "kitsu"], 
            default: "jikan" 
        }
    },
    async run(req, res) {
        try {
            const { 
                genre = "", 
                type = "", 
                count = 10, 
                source = "jikan" 
            } = req.query;

            const results = await animeService.getRandomAnime(
                genre, 
                type, 
                parseInt(count)
            );

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Tidak ada anime random yang ditemukan dengan filter tersebut.",
                    filters: {
                        genre: genre || "none",
                        type: type || "all",
                        count: parseInt(count),
                        source: source
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    results: results,
                    total: results.length,
                    filters: {
                        genre: genre || "none",
                        type: type || "all",
                        count: parseInt(count),
                        source: source
                    }
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Random anime error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mengambil anime random",
                timestamp: new Date().toISOString()
            });
        }
    }
};