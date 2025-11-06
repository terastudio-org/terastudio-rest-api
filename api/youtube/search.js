import YouTubeService from "../../src/services/anime/youtubeService.js";

const youtubeService = new YouTubeService();

export default {
    name: "YouTube Search",
    description: "Search for YouTube videos without downloading",
    category: "YouTube",
    methods: ["GET"],
    params: ["q", "maxResults"],
    paramsSchema: {
        q: { type: "string", required: true, minLength: 1 },
        maxResults: { 
            type: "number", 
            required: false, 
            min: 1, 
            max: 50, 
            default: 10 
        }
    },
    async run(req, res) {
        try {
            const { q, maxResults = 10 } = req.query;

            if (!q || typeof q !== "string" || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'q' (query) wajib diisi untuk pencarian YouTube."
                });
            }

            const searchResults = await youtubeService.searchVideos(q, parseInt(maxResults));

            if (searchResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Tidak ada video yang ditemukan untuk query tersebut.",
                    query: q
                });
            }

            res.json({
                success: true,
                data: {
                    results: searchResults,
                    total: searchResults.length,
                    query: q,
                    max_results: parseInt(maxResults)
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('YouTube search error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat pencarian YouTube",
                timestamp: new Date().toISOString()
            });
        }
    }
};