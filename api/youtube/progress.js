import YouTubeService from "../../src/services/anime/youtubeService.js";

const youtubeService = new YouTubeService();

export default {
    name: "Download Progress",
    description: "Check the progress of ongoing YouTube downloads",
    category: "YouTube",
    methods: ["GET"],
    params: ["taskId"],
    paramsSchema: {
        taskId: { type: "string", required: true, minLength: 5 }
    },
    async run(req, res) {
        try {
            const { taskId } = req.query;

            if (!taskId || typeof taskId !== "string") {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'taskId' wajib disediakan."
                });
            }

            const progress = youtubeService.getDownloadProgress(taskId);

            if (!progress.exists) {
                return res.status(404).json({
                    success: false,
                    error: "Task download tidak ditemukan atau sudah selesai.",
                    taskId: taskId
                });
            }

            const elapsedTime = Date.now() - progress.startTime;
            const estimatedTotalTime = progress.progress > 0 ? (elapsedTime / progress.progress) * 100 : null;
            const remainingTime = estimatedTotalTime ? Math.max(0, estimatedTotalTime - elapsedTime) : null;

            res.json({
                success: true,
                data: {
                    task_id: taskId,
                    status: progress.status,
                    progress_percentage: progress.progress,
                    elapsed_time: elapsedTime,
                    estimated_remaining_time: remainingTime,
                    url: progress.url,
                    output_path: progress.outputPath
                },
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Download progress error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat mengambil progress download",
                timestamp: new Date().toISOString()
            });
        }
    }
};