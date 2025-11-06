import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class YouTubeService {
    constructor() {
        this.downloadsDir = path.join(process.cwd(), 'data', 'downloads', 'youtube');
        this.tempDir = path.join(os.tmpdir(), 'terastudio-ytdl');
        this.ensureDirectories();
        this.downloadTasks = new Map(); // Track download progress
    }

    ensureDirectories() {
        if (!fs.existsSync(this.downloadsDir)) {
            fs.mkdirSync(this.downloadsDir, { recursive: true });
        }
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // Get video information without downloading
    async getVideoInfo(url) {
        return new Promise((resolve, reject) => {
            const ytdlp = spawn('yt-dlp', [
                '--dump-json',
                '--no-download',
                url
            ]);

            let output = '';
            let error = '';

            ytdlp.stdout.on('data', (data) => {
                output += data.toString();
            });

            ytdlp.stderr.on('data', (data) => {
                error += data.toString();
            });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    try {
                        const info = JSON.parse(output);
                        resolve({
                            id: info.id,
                            title: info.title,
                            description: info.description,
                            duration: info.duration,
                            view_count: info.view_count,
                            uploader: info.uploader,
                            upload_date: info.upload_date,
                            formats: info.formats?.map(format => ({
                                format_id: format.format_id,
                                ext: format.ext,
                                resolution: format.resolution,
                                filesize: format.filesize,
                                acodec: format.acodec,
                                vcodec: format.vcodec,
                                fps: format.fps,
                                url: format.url
                            })) || [],
                            thumbnail: info.thumbnail,
                            webpage_url: info.webpage_url
                        });
                    } catch (err) {
                        reject(new Error('Failed to parse video info'));
                    }
                } else {
                    reject(new Error(error || 'Failed to get video info'));
                }
            });
        });
    }

    // Download video/audio with specific format
    async downloadMedia(url, options = {}) {
        const {
            format = 'best',
            quality = 'best',
            audioOnly = false,
            outputFormat = 'mp4',
            customOutput = null,
            extractAudio = false
        } = options;

        const taskId = Date.now() + Math.random().toString(36).substr(2, 9);
        const outputPath = customOutput || path.join(
            this.downloadsDir,
            `${taskId}_%(title)s.${extractAudio ? 'mp3' : outputFormat}`
        );

        const args = [
            '--progress',
            '--newline',
            '-o', outputPath
        ];

        // Add format selection
        if (extractAudio || audioOnly) {
            args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
        } else {
            if (format !== 'best') {
                args.push('-f', format);
            } else if (quality !== 'best') {
                args.push('-f', quality);
            }
        }

        args.push(url);

        return new Promise((resolve, reject) => {
            const ytdlp = spawn('yt-dlp', args);
            const taskInfo = {
                id: taskId,
                status: 'downloading',
                progress: 0,
                url: url,
                outputPath: outputPath,
                startTime: Date.now()
            };

            this.downloadTasks.set(taskId, taskInfo);

            let output = '';
            let error = '';

            ytdlp.stdout.on('data', (data) => {
                const dataStr = data.toString();
                output += dataStr;
                
                // Parse progress from yt-dlp output
                const progressMatch = dataStr.match(/(\d+\.?\d*)%/);
                if (progressMatch) {
                    const progress = parseFloat(progressMatch[1]);
                    taskInfo.progress = progress;
                    this.downloadTasks.set(taskId, taskInfo);
                }
            });

            ytdlp.stderr.on('data', (data) => {
                error += data.toString();
            });

            ytdlp.on('close', (code) => {
                this.downloadTasks.delete(taskId);
                
                if (code === 0) {
                    const filePath = outputPath.includes('%(title)s') 
                        ? this.findDownloadedFile(outputPath)
                        : outputPath;

                    if (fs.existsSync(filePath)) {
                        const stats = fs.statSync(filePath);
                        resolve({
                            success: true,
                            taskId: taskId,
                            filePath: filePath,
                            fileName: path.basename(filePath),
                            fileSize: stats.size,
                            downloadUrl: `/downloads/youtube/${path.basename(filePath)}`,
                            duration: Date.now() - taskInfo.startTime
                        });
                    } else {
                        reject(new Error('Downloaded file not found'));
                    }
                } else {
                    reject(new Error(error || 'Download failed'));
                }
            });
        });
    }

    // Find downloaded file (handles yt-dlp filename formatting)
    findDownloadedFile(pattern) {
        // Simple implementation - in production, you'd want more sophisticated file matching
        const files = fs.readdirSync(this.downloadsDir);
        const timestamp = Date.now();
        
        // Look for recently created files
        const recentFiles = files
            .map(file => ({
                name: file,
                path: path.join(this.downloadsDir, file),
                time: fs.statSync(path.join(this.downloadsDir, file)).mtime
            }))
            .filter(file => (timestamp - file.time.getTime()) < 30000) // Files created in last 30 seconds
            .sort((a, b) => b.time - a.time);

        return recentFiles[0]?.path || null;
    }

    // Get download progress
    getDownloadProgress(taskId) {
        const task = this.downloadTasks.get(taskId);
        if (!task) {
            return { exists: false };
        }
        return {
            exists: true,
            ...task
        };
    }

    // Download playlist
    async downloadPlaylist(url, options = {}) {
        const {
            format = 'best',
            quality = 'best',
            audioOnly = false,
            maxDownloads = 10
        } = options;

        const playlistId = Date.now() + Math.random().toString(36).substr(2, 9);
        const playlistDir = path.join(this.downloadsDir, `playlist_${playlistId}`);
        
        if (!fs.existsSync(playlistDir)) {
            fs.mkdirSync(playlistDir, { recursive: true });
        }

        return new Promise((resolve, reject) => {
            const args = [
                '--dump-json',
                '--no-download',
                '--playlist-end', maxDownloads.toString(),
                url
            ];

            const ytdlp = spawn('yt-dlp', args);

            let output = '';
            let error = '';

            ytdlp.stdout.on('data', (data) => {
                output += data.toString();
            });

            ytdlp.stderr.on('data', (data) => {
                error += data.toString();
            });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    try {
                        const lines = output.trim().split('\n').filter(line => line.trim());
                        const playlistItems = lines.map(line => JSON.parse(line));
                        
                        resolve({
                            playlist_id: playlistId,
                            title: playlistItems[0]?.playlist_title || 'Unknown Playlist',
                            count: playlistItems.length,
                            items: playlistItems.map(item => ({
                                id: item.id,
                                title: item.title,
                                duration: item.duration,
                                uploader: item.uploader,
                                url: item.webpage_url
                            }))
                        });
                    } catch (err) {
                        reject(new Error('Failed to parse playlist info'));
                    }
                } else {
                    reject(new Error(error || 'Failed to get playlist info'));
                }
            });
        });
    }

    // Search YouTube videos
    async searchVideos(query, maxResults = 10) {
        return new Promise((resolve, reject) => {
            const searchQuery = `ytsearch${maxResults}:${query}`;
            const args = [
                '--dump-json',
                '--no-download',
                searchQuery
            ];

            const ytdlp = spawn('yt-dlp', args);

            let output = '';
            let error = '';

            ytdlp.stdout.on('data', (data) => {
                output += data.toString();
            });

            ytdlp.stderr.on('data', (data) => {
                error += data.toString();
            });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    try {
                        const lines = output.trim().split('\n').filter(line => line.trim());
                        const results = lines.map(line => JSON.parse(line));
                        
                        resolve(results.map(video => ({
                            id: video.id,
                            title: video.title,
                            description: video.description,
                            duration: video.duration,
                            uploader: video.uploader,
                            view_count: video.view_count,
                            upload_date: video.upload_date,
                            thumbnail: video.thumbnail,
                            webpage_url: video.webpage_url
                        })));
                    } catch (err) {
                        reject(new Error('Failed to parse search results'));
                    }
                } else {
                    reject(new Error(error || 'Search failed'));
                }
            });
        });
    }

    // Convert video to audio
    async convertToAudio(filePath, outputFormat = 'mp3') {
        const inputPath = filePath;
        const outputPath = filePath.replace(/\.[^/.]+$/, `.${outputFormat}`);

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-i', inputPath,
                '-acodec', outputFormat === 'mp3' ? 'libmp3lame' : 'aac',
                '-ab', '192k',
                '-y',
                outputPath
            ]);

            let error = '';
            ffmpeg.stderr.on('data', (data) => {
                error += data.toString();
            });

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    const stats = fs.statSync(outputPath);
                    resolve({
                        success: true,
                        inputPath: inputPath,
                        outputPath: outputPath,
                        fileName: path.basename(outputPath),
                        fileSize: stats.size,
                        format: outputFormat
                    });
                } else {
                    reject(new Error(error || 'Conversion failed'));
                }
            });
        });
    }

    // Get supported formats
    getSupportedFormats() {
        return {
            video: ['mp4', 'webm', 'mkv', 'avi'],
            audio: ['mp3', 'aac', 'ogg', 'wav', 'flac'],
            quality: ['best', 'worst', '720p', '480p', '360p', '144p'],
            formats: {
                'best': 'Best available quality',
                'worst': 'Worst available quality',
                'bestvideo': 'Best video only',
                'bestaudio': 'Best audio only',
                'mp4': 'MP4 format',
                'webm': 'WebM format',
                'mp3': 'MP3 audio',
                'm4a': 'M4A audio'
            }
        };
    }

    // Clean up old files
    cleanupOldFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
        try {
            const files = fs.readdirSync(this.downloadsDir);
            const now = Date.now();

            files.forEach(file => {
                const filePath = path.join(this.downloadsDir, file);
                const stats = fs.statSync(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                }
            });
        } catch (error) {
            console.error('Cleanup error:', error.message);
        }
    }
}

export default YouTubeService;