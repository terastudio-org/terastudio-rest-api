import AnimeService from "../../src/services/anime/animeService.js";

const animeService = new AnimeService();

export default {
    name: "Seasonal Anime",
    description: "Get anime by season (winter, spring, summer, fall)",
    category: "Anime",
    methods: ["GET"],
    params: ["season", "year", "source"],
    paramsSchema: {
        season: { 
            type: "string", 
            required: false, 
            enum: ["winter", "spring", "summer", "fall"], 
            default: "winter" 
        },
        year: { 
            type: "number", 
            required: false, 
            min: 2014, 
            max: 2030, 
            default: new Date().getFullYear() 
        },
        source: { type: "string", required: false, enum: ["jikan", "kitsu"], default: "jikan" }
    },
    async run(req, res) {
        try {
            const currentYear = new Date().getFullYear();
            const { 
                season = "winter", 
                year = currentYear, 
                source = "jikan" 
            } = req.query;

            const results = await animeService.getSeasonalAnime(season, parseInt(year), source);

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Tidak ada anime yang ditemukan untuk season tersebut.",
                    season: season,
                    year: parseInt(year),
                    source: source
                });
            }

            res.json({
                success: true,
                data: {
                    results: results,
                    total: results.length,
                    season: season,
                    year: parseInt(year),
                    source: source
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Seasonal anime error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mengambil anime seasonal",
                timestamp: new Date().toISOString()
            });
        }
    }
};