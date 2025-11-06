import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CacheCleanup {
    constructor() {
        this.cacheDirs = [
            path.join(process.cwd(), 'data', 'cache', 'anime'),
            path.join(process.cwd(), 'data', 'cache', 'nsfw'),
            path.join(process.cwd(), 'data', 'downloads', 'youtube')
        ];
        this.results = {
            cleaned: 0,
            errors: 0,
            totalSize: 0,
            freedSize: 0,
            details: []
        };
    }

    async cleanupAll() {
        console.log('🧹 Starting cache cleanup...\n');

        for (const cacheDir of this.cacheDirs) {
            if (fs.existsSync(cacheDir)) {
                await this.cleanupDirectory(cacheDir);
            } else {
                console.log(`📁 Directory not found: ${cacheDir}`);
            }
        }

        this.generateCleanupReport();
    }

    async cleanupDirectory(dirPath) {
        const dirName = path.basename(dirPath);
        console.log(`🗂️  Cleaning ${dirName}...`);

        try {
            const files = fs.readdirSync(dirPath);
            let dirCleaned = 0;
            let dirSize = 0;
            let dirFreed = 0;

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);

                dirSize += stats.size;

                // Check if file is older than 24 hours
                const isOld = (Date.now() - stats.mtime.getTime()) > (24 * 60 * 60 * 1000);

                if (isOld) {
                    try {
                        fs.unlinkSync(filePath);
                        dirCleaned++;
                        dirFreed += stats.size;
                        this.results.cleaned++;
                    } catch (error) {
                        console.error(`   ❌ Failed to delete ${file}: ${error.message}`);
                        this.results.errors++;
                    }
                }
            }

            this.results.totalSize += dirSize;
            this.results.freedSize += dirFreed;

            this.results.details.push({
                directory: dirName,
                path: dirPath,
                filesProcessed: files.length,
                filesDeleted: dirCleaned,
                originalSize: dirSize,
                freedSize: dirFreed
            });

            console.log(`   ✅ Cleaned ${dirCleaned} files, freed ${this.formatBytes(dirFreed)}\n`);

        } catch (error) {
            console.error(`   ❌ Error cleaning ${dirPath}: ${error.message}\n`);
            this.results.errors++;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateCleanupReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                filesCleaned: this.results.cleaned,
                errors: this.results.errors,
                totalSize: this.results.totalSize,
                freedSize: this.results.freedSize,
                efficiency: this.results.totalSize > 0 ? 
                    ((this.results.freedSize / this.results.totalSize) * 100).toFixed(2) + '%' : '0%'
            },
            details: this.results.details,
            recommendations: []
        };

        // Generate recommendations
        if (this.results.errors > 0) {
            report.recommendations.push('Some files could not be deleted. Check file permissions.');
        }

        if (this.results.freedSize > 0) {
            report.recommendations.push('Cache cleanup successful. Disk space freed.');
        } else {
            report.recommendations.push('No old cache files found. Cache is recent.');
        }

        // Save report
        const reportPath = path.join(process.cwd(), 'data', 'cache-cleanup-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('📊 Cache Cleanup Report:');
        console.log(`   Files cleaned: ${report.summary.filesCleaned}`);
        console.log(`   Errors: ${report.summary.errors}`);
        console.log(`   Size processed: ${this.formatBytes(report.summary.totalSize)}`);
        console.log(`   Space freed: ${this.formatBytes(report.summary.freedSize)}`);
        console.log(`   Efficiency: ${report.summary.efficiency}`);
        console.log(`   Report saved to: ${reportPath}\n`);
    }

    async runMaintenance() {
        console.log('🔧 Running maintenance tasks...\n');

        // Clean up temporary files
        const tempDirs = [
            path.join(process.cwd(), 'data', 'temp'),
            path.join(process.cwd(), 'tmp')
        ];

        for (const tempDir of tempDirs) {
            if (fs.existsSync(tempDir)) {
                try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    console.log(`🗑️  Removed temp directory: ${tempDir}`);
                } catch (error) {
                    console.log(`⚠️  Could not remove temp directory: ${error.message}`);
                }
            }
        }

        // Clean up log files older than 7 days
        const logsDir = path.join(process.cwd(), 'logs');
        if (fs.existsSync(logsDir)) {
            const files = fs.readdirSync(logsDir);
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

            for (const file of files) {
                const filePath = path.join(logsDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() < sevenDaysAgo) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`📝 Removed old log file: ${file}`);
                    } catch (error) {
                        console.log(`⚠️  Could not remove log file: ${error.message}`);
                    }
                }
            }
        }

        console.log('✅ Maintenance completed\n');
    }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const cleanup = new CacheCleanup();
    cleanup.cleanupAll()
        .then(() => cleanup.runMaintenance())
        .catch(error => {
            console.error('Cleanup failed:', error.message);
            process.exit(1);
        });
}

export default CacheCleanup;