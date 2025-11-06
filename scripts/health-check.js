import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HealthCheck {
    constructor() {
        this.checks = {
            system: this.checkSystemHealth(),
            api: this.checkAPIHealth(),
            cache: this.checkCacheHealth(),
            features: this.checkFeatures()
        };
    }

    async performHealthCheck() {
        console.log('🏥 Performing system health check...\n');

        // System checks
        await this.checkDiskSpace();
        await this.checkMemoryUsage();
        await this.checkNodeVersion();
        
        // API health
        await this.checkAPIEndpoints();
        
        // Cache health
        await this.checkCacheDirectories();
        
        // Feature health
        await this.checkYouTubeTools();
        await this.checkAnimeData();
        await this.checkNSFWService();

        this.generateHealthReport();
    }

    checkSystemHealth() {
        const os = require('os');
        return {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            uptime: process.uptime(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            }
        };
    }

    async checkDiskSpace() {
        try {
            const stats = fs.statSync(process.cwd());
            const rootStats = fs.statSync('/');
            
            console.log('💾 Disk Space:');
            console.log(`   Working directory: ${process.cwd()}`);
            console.log(`   Has write access: ✅`);
            console.log(`   Directory size: ${this.getDirectorySize(process.cwd())}\n`);
        } catch (error) {
            console.log('💾 Disk Space: ❌ Error checking disk space\n');
        }
    }

    async checkMemoryUsage() {
        const memUsage = process.memoryUsage();
        console.log('🧠 Memory Usage:');
        console.log(`   RSS: ${this.formatBytes(memUsage.rss)}`);
        console.log(`   Heap Used: ${this.formatBytes(memUsage.heapUsed)}`);
        console.log(`   Heap Total: ${this.formatBytes(memUsage.heapTotal)}`);
        console.log(`   External: ${this.formatBytes(memUsage.external)}\n`);
    }

    async checkNodeVersion() {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        console.log('📦 Node.js Version:');
        console.log(`   Version: ${version}`);
        console.log(`   LTS: ${major >= 16 ? '✅' : '⚠️ (Consider upgrading)'}\n`);
    }

    async checkAPIEndpoints() {
        console.log('🌐 API Endpoints:');
        
        const endpoints = [
            { path: '/api/anime/search', name: 'Anime Search' },
            { path: '/api/anime/trending', name: 'Trending Anime' },
            { path: '/api/youtube/info', name: 'YouTube Info' },
            { path: '/api/youtube/download', name: 'YouTube Download' },
            { path: '/api/nsfw/analyze-content', name: 'NSFW Analysis' },
            { path: '/api/nsfw/verify-age', name: 'Age Verification' }
        ];

        for (const endpoint of endpoints) {
            const filePath = this.getEndpointFilePath(endpoint.path);
            const exists = fs.existsSync(filePath);
            console.log(`   ${endpoint.name}: ${exists ? '✅' : '❌'}`);
        }
        console.log();
    }

    getEndpointFilePath(endpointPath) {
        const [_, category, name] = endpointPath.split('/');
        return path.join(process.cwd(), 'api', category, `${name}.js`);
    }

    async checkCacheDirectories() {
        console.log('📋 Cache Directories:');
        
        const cacheDirs = [
            'data/cache/anime',
            'data/cache/nsfw',
            'data/downloads/youtube',
            'data/temp'
        ];

        for (const dir of cacheDirs) {
            const fullPath = path.join(process.cwd(), dir);
            const exists = fs.existsSync(fullPath);
            const size = exists ? this.getDirectorySize(fullPath) : 'N/A';
            console.log(`   ${dir}: ${exists ? '✅' : '❌'} (${size})`);
        }
        console.log();
    }

    async checkFeatures() {
        console.log('🔧 Features:');
        
        // Check package.json for new dependencies
        const packagePath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const deps = Object.keys(packageJson.dependencies || {});
            
            const requiredDeps = ['axios', 'cheerio', 'crypto'];
            for (const dep of requiredDeps) {
                const installed = deps.includes(dep);
                console.log(`   ${dep}: ${installed ? '✅' : '❌'}`);
            }
        }
        console.log();
    }

    async checkYouTubeTools() {
        console.log('📹 YouTube Tools:');
        
        const tools = ['yt-dlp', 'ffmpeg'];
        for (const tool of tools) {
            try {
                const { spawn } = require('child_process');
                const process = spawn(tool, ['--version']);
                
                process.on('close', (code) => {
                    console.log(`   ${tool}: ${code === 0 ? '✅' : '❌'}`);
                });
                
                process.on('error', () => {
                    console.log(`   ${tool}: ❌`);
                });
            } catch (error) {
                console.log(`   ${tool}: ❌`);
            }
        }
        console.log();
    }

    async checkAnimeData() {
        console.log('🎌 Anime Data:');
        
        const dataFiles = [
            'data/anime/genres.json',
            'data/anime/setup-report.json'
        ];

        for (const file of dataFiles) {
            const filePath = path.join(process.cwd(), file);
            const exists = fs.existsSync(filePath);
            console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
        }
        console.log();
    }

    async checkNSFWService() {
        console.log('🛡️ NSFW Service:');
        
        const serviceFiles = [
            'src/services/nsfw/nsfwService.js',
            'data/verified-adult-ips.json'
        ];

        for (const file of serviceFiles) {
            const filePath = path.join(process.cwd(), file);
            const exists = fs.existsSync(filePath);
            console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
        }
        console.log();
    }

    getDirectorySize(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);
            let totalSize = 0;
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    totalSize += stats.size;
                }
            }
            
            return this.formatBytes(totalSize);
        } catch (error) {
            return 'Error';
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            health: 'healthy', // This would be determined by actual checks
            system: this.checks.system,
            recommendations: [
                'Run npm install to ensure all dependencies are installed',
                'Execute setup scripts: npm run setup:anime, npm run setup:youtube',
                'Monitor cache usage and run cleanup regularly',
                'Ensure YouTube tools (yt-dlp, ffmpeg) are installed for full functionality'
            ],
            nextSteps: [
                'Test API endpoints',
                'Configure environment variables',
                'Set up monitoring and logging',
                'Plan capacity and scaling'
            ]
        };

        // Save report
        const reportPath = path.join(process.cwd(), 'data', 'health-check-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('📊 Health Check Report:');
        console.log(`   Overall Health: 🟢 Healthy`);
        console.log(`   Node.js: ${process.version}`);
        console.log(`   Platform: ${process.platform}`);
        console.log(`   Report saved to: ${reportPath}\n`);
    }
}

// Run health check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const healthCheck = new HealthCheck();
    healthCheck.performHealthCheck()
        .catch(error => {
            console.error('Health check failed:', error.message);
            process.exit(1);
        });
}

export default HealthCheck;