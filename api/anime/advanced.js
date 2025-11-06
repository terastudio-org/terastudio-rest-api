import AnimeService from "../../src/services/anime/animeService.js";

const animeService = new AnimeService();

export default {
    name: "Advanced Anime Search",
    description: "Advanced search with multiple filters and sorting options",
    category: "Anime",
    methods: ["GET"],
    params: ["query", "genre", "type", "status", "year", "score", "sort", "page", "source"],
    paramsSchema: {
        query: { type: "string", required: false },
        genre: { 
            type: "string", 
            required: false,
            description: "Genre ID (e.g., 1,2,3 for multiple genres)" 
        },
        type: { 
            type: "string", 
            required: false, 
            enum: ["TV", "Movie", "OVA", "Special", "ONA" ] 
        },
        status: { 
            type: "string", 
            required: false, 
            enum: ["airing", "complete", "upcoming" ] 
        },
        year: { 
            type: "string", 
            required: false,
            description: "Release year" 
        },
        score: { 
            type: "string", 
            required: false,
            description: "Minimum score (1-10)" 
        },
        sort: { 
            type: "string", 
            required: false, 
            enum: ["popularity", "score", "rank", "title", "episodes", "start_date"],
            default: "popularity" 
        },
        page: { 
            type: "number", 
            required: false, 
            min: 1, 
            max: 100, 
            default: 1 
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
            const filters = {
                query: req.query.query || '',
                genre: req.query.genre || '',
                type: req.query.type || '',
                status: req.query.status || '',
                year: req.query.year || '',
                score: req.query.score || '',
                sort: req.query.sort || 'popularity',
                page: req.query.page || 1,
                source: req.query.source || 'jikan'
            };

            const results = await animeService.advancedSearch(filters);

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Tidak ada anime yang ditemukan dengan filter tersebut.",
                    filters: filters
                });
            }

            res.json({
                success: true,
                data: {
                    results: results,
                    total: results.length,
                    filters: filters,
                    page: parseInt(filters.page)
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Advanced anime search error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat pencarian anime advanced",
                timestamp: new Date().toISOString()
            });
        }
    }
};