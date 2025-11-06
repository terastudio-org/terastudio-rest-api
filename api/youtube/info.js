import YouTubeService from "../../src/services/anime/youtubeService.js";

const youtubeService = new YouTubeService();

export default {
    name: "YouTube Video Info",
    description: "Get detailed information about a YouTube video without downloading",
    category: "YouTube",
    methods: ["GET"],
    params: ["url"],
    paramsSchema: {
        url: { type: "string", required: true, minLength: 10 }
    },
    async run(req, res) {
        try {
            const { url } = req.query;

            if (!url || typeof url !== "string" || !url.includes('youtube.com') && !url.includes('youtu.be')) {
                return res.status(400).json({
                    success: false,
                    error: "URL YouTube yang valid wajib disediakan."
                });
            }

            const videoInfo = await youtubeService.getVideoInfo(url);

            res.json({
                success: true,
                data: {
                    video: videoInfo,
                    supported_formats: youtubeService.getSupportedFormats()
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('YouTube info error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mengambil informasi video",
                timestamp: new Date().toISOString()
            });
        }
    }
};