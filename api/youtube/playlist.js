import YouTubeService from "../../src/services/anime/youtubeService.js";

const youtubeService = new YouTubeService();

export default {
    name: "YouTube Playlist",
    description: "Get information about YouTube playlists",
    category: "YouTube",
    methods: ["GET", "POST"],
    params: ["url", "maxDownloads", "format", "quality", "audioOnly"],
    paramsSchema: {
        url: { type: "string", required: true, minLength: 10 },
        maxDownloads: { 
            type: "number", 
            required: false, 
            min: 1, 
            max: 50, 
            default: 10 
        },
        format: { 
            type: "string", 
            required: false, 
            enum: ["best", "worst", "bestvideo", "bestaudio", "mp4", "webm", "mp3", "m4a"],
            default: "best" 
        },
        quality: { 
            type: "string", 
            required: false, 
            enum: ["best", "worst", "720p", "480p", "360p", "144p"],
            default: "best" 
        },
        audioOnly: { 
            type: "boolean", 
            required: false, 
            default: false 
        }
    },
    async run(req, res) {
        try {
            const { 
                url, 
                maxDownloads = 10, 
                format = "best", 
                quality = "best", 
                audioOnly = false 
            } = req.method === 'GET' ? req.query : req.body;

            if (!url || typeof url !== "string" || !url.includes('youtube.com') && !url.includes('youtu.be')) {
                return res.status(400).json({
                    success: false,
                    error: "URL YouTube playlist yang valid wajib disediakan."
                });
            }

            if (!url.includes('list=') && !url.includes('playlist')) {
                return res.status(400).json({
                    success: false,
                    error: "URL yang diberikan bukan playlist YouTube yang valid."
                });
            }

            const playlistInfo = await youtubeService.downloadPlaylist(url, {
                maxDownloads: parseInt(maxDownloads),
                format,
                quality,
                audioOnly: audioOnly === 'true' || audioOnly === true
            });

            res.json({
                success: true,
                data: {
                    playlist: playlistInfo,
                    download_options: {
                        format,
                        quality,
                        audioOnly: audioOnly === 'true' || audioOnly === true,
                        max_downloads: parseInt(maxDownloads)
                    }
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('YouTube playlist error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat memproses playlist",
                timestamp: new Date().toISOString()
            });
        }
    }
};