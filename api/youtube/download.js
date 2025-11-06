import YouTubeService from "../../src/services/anime/youtubeService.js";

const youtubeService = new YouTubeService();

export default {
    name: "YouTube Downloader",
    description: "Download YouTube videos or audio in various formats",
    category: "YouTube",
    methods: ["GET", "POST"],
    params: ["url", "format", "quality", "audioOnly", "extractAudio", "customOutput"],
    paramsSchema: {
        url: { type: "string", required: true, minLength: 10 },
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
        },
        extractAudio: { 
            type: "boolean", 
            required: false, 
            default: false 
        },
        customOutput: { 
            type: "string", 
            required: false,
            description: "Custom output filename (without extension)" 
        }
    },
    async run(req, res) {
        try {
            const { 
                url, 
                format = "best", 
                quality = "best", 
                audioOnly = false, 
                extractAudio = false,
                customOutput = null 
            } = req.method === 'GET' ? req.query : req.body;

            if (!url || typeof url !== "string" || !url.includes('youtube.com') && !url.includes('youtu.be')) {
                return res.status(400).json({
                    success: false,
                    error: "URL YouTube yang valid wajib disediakan."
                });
            }

            const downloadOptions = {
                format,
                quality,
                audioOnly: audioOnly === 'true' || audioOnly === true,
                extractAudio: extractAudio === 'true' || extractAudio === true,
                customOutput: customOutput || null
            };

            const result = await youtubeService.downloadMedia(url, downloadOptions);

            res.json({
                success: true,
                data: {
                    download_info: result,
                    task_id: result.taskId,
                    file_url: result.downloadUrl,
                    file_size: result.fileSize,
                    download_duration: result.duration
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('YouTube download error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat download video",
                timestamp: new Date().toISOString()
            });
        }
    }
};