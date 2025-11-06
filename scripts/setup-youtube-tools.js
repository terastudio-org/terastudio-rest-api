import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class YouTubeToolsSetup {
    constructor() {
        this.tools = ['yt-dlp', 'ffmpeg'];
        this.checkResults = {};
    }

    async setupTools() {
        console.log('🔧 Setting up YouTube tools...\n');

        for (const tool of this.tools) {
            await this.checkTool(tool);
        }

        this.generateSetupReport();
    }

    async checkTool(toolName) {
        return new Promise((resolve) => {
            console.log(`📋 Checking ${toolName}...`);
            
            const process = spawn(toolName, ['--version']);
            
            process.on('close', (code) => {
                if (code === 0) {
                    this.checkResults[toolName] = { installed: true, version: 'Available' };
                    console.log(`✅ ${toolName} is available\n`);
                } else {
                    this.checkResults[toolName] = { installed: false, version: null };
                    console.log(`❌ ${toolName} is not installed\n`);
                    this.showInstallationInstructions(toolName);
                }
                resolve();
            });

            process.on('error', () => {
                this.checkResults[toolName] = { installed: false, version: null };
                console.log(`❌ ${toolName} is not installed\n`);
                this.showInstallationInstructions(toolName);
                resolve();
            });
        });
    }

    showInstallationInstructions(toolName) {
        const instructions = {
            'yt-dlp': {
                windows: 'pip install yt-dlp',
                macos: 'brew install yt-dlp',
                linux: 'sudo pip3 install yt-dlp'
            },
            'ffmpeg': {
                windows: 'Download from https://ffmpeg.org/download.html',
                macos: 'brew install ffmpeg',
                linux: 'sudo apt install ffmpeg (Ubuntu/Debian) or sudo yum install ffmpeg (CentOS/RHEL)'
            }
        };

        if (instructions[toolName]) {
            console.log('📖 Installation instructions:');
            Object.entries(instructions[toolName]).forEach(([os, cmd]) => {
                console.log(`   ${os}: ${cmd}`);
            });
            console.log();
        }
    }

    generateSetupReport() {
        const report = {
            timestamp: new Date().toISOString(),
            tools: this.checkResults,
            recommendations: []
        };

        // Generate recommendations
        const installedTools = Object.entries(this.checkResults)
            .filter(([_, result]) => result.installed)
            .map(([tool, _]) => tool);

        const missingTools = Object.entries(this.checkResults)
            .filter(([_, result]) => !result.installed)
            .map(([tool, _]) => tool);

        if (installedTools.length === this.tools.length) {
            report.recommendations.push('All required tools are installed. YouTube features are fully functional.');
        } else {
            report.recommendations.push('Some tools are missing. YouTube features may be limited.');
            if (missingTools.includes('yt-dlp')) {
                report.recommendations.push('yt-dlp is required for YouTube downloading functionality.');
            }
            if (missingTools.includes('ffmpeg')) {
                report.recommendations.push('ffmpeg is required for audio/video conversion features.');
            }
        }

        // Save report
        const reportPath = path.join(process.cwd(), 'data', 'youtube-setup-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('📊 Setup Report:');
        console.log(`   Installed: ${installedTools.join(', ') || 'None'}`);
        console.log(`   Missing: ${missingTools.join(', ') || 'None'}`);
        console.log(`   Report saved to: ${reportPath}\n`);

        return report;
    }

    async testYouTubeFunctionality() {
        console.log('🧪 Testing YouTube functionality...\n');

        try {
            // Test yt-dlp info extraction
            const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll (for testing)
            
            console.log('📹 Testing video info extraction...');
            const ytdlp = spawn('yt-dlp', ['--dump-json', '--no-download', testUrl]);
            
            let output = '';
            ytdlp.stdout.on('data', (data) => {
                output += data.toString();
            });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    const info = JSON.parse(output);
                    console.log(`   ✅ Video: ${info.title}`);
                    console.log(`   ✅ Duration: ${info.duration}s`);
                    console.log(`   ✅ Uploader: ${info.uploader}\n`);
                } else {
                    console.log('   ❌ Failed to extract video info\n');
                }
            });

        } catch (error) {
            console.log(`❌ YouTube functionality test failed: ${error.message}\n`);
        }
    }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new YouTubeToolsSetup();
    setup.setupTools()
        .then(() => setup.testYouTubeFunctionality())
        .catch(error => {
            console.error('Setup failed:', error.message);
            process.exit(1);
        });
}

export default YouTubeToolsSetup;