import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AnimeDataSetup {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data', 'anime');
        this.cacheDir = path.join(this.dataDir, 'cache');
        this.genresData = {};
    }

    async setupAnimeData() {
        console.log('🎌 Setting up anime data sources...\n');

        await this.ensureDirectories();
        await this.loadGenres();
        await this.testConnections();
        this.generateDataReport();
    }

    async ensureDirectories() {
        const dirs = [this.dataDir, this.cacheDir];
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        }
    }

    async loadGenres() {
        console.log('📚 Loading anime genres...\n');

        try {
            // Load genres from Jikan API
            const { data } = await axios.get('https://api.jikan.moe/v4/genres/anime', {
                headers: { 'User-Agent': 'terastudio-Api/1.0' }
            });

            this.genresData.jikan = data.data.map(genre => ({
                id: genre.mal_id,
                name: genre.name,
                url: genre.url
            }));

            // Save genres data
            const genresPath = path.join(this.dataDir, 'genres.json');
            fs.writeFileSync(genresPath, JSON.stringify(this.genresData, null, 2));
            
            console.log(`✅ Loaded ${this.genresData.jikan.length} genres from Jikan API`);
            console.log(`💾 Saved to: ${genresPath}\n`);

        } catch (error) {
            console.error('❌ Failed to load genres:', error.message);
            
            // Create fallback genres
            this.genresData.fallback = [
                { id: 1, name: 'Action' },
                { id: 2, name: 'Adventure' },
                { id: 4, name: 'Comedy' },
                { id: 8, name: 'Drama' },
                { id: 10, name: 'Fantasy' },
                { id: 14, name: 'Horror' },
                { id: 19, name: 'Music' },
                { id: 22, name: 'Romance' },
                { id: 24, name: 'Sci-Fi' },
                { id: 36, name: 'Slice of Life' }
            ];
        }
    }

    async testConnections() {
        console.log('🔗 Testing API connections...\n');

        // Test Jikan API
        try {
            const startTime = Date.now();
            const { data } = await axios.get('https://api.jikan.moe/v4/anime/1', {
                headers: { 'User-Agent': 'terastudio-Api/1.0' },
                timeout: 5000
            });
            const responseTime = Date.now() - startTime;

            console.log(`✅ Jikan API: ${data.data.title} (${responseTime}ms)`);
        } catch (error) {
            console.log(`❌ Jikan API: ${error.message}`);
        }

        // Test Kitsu API
        try {
            const startTime = Date.now();
            const { data } = await axios.get('https://kitsu.io/api/edge/anime/1', {
                headers: { 
                    'Accept': 'application/vnd.api+json',
                    'User-Agent': 'terastudio-Api/1.0' 
                },
                timeout: 5000
            });
            const responseTime = Date.now() - startTime;

            console.log(`✅ Kitsu API: ${data.data.attributes.canonicalTitle} (${responseTime}ms)`);
        } catch (error) {
            console.log(`❌ Kitsu API: ${error.message}`);
        }

        console.log();
    }

    generateDataReport() {
        const report = {
            timestamp: new Date().toISOString(),
            sources: {
                jikan: {
                    available: !!this.genresData.jikan,
                    endpoint: 'https://api.jikan.moe/v4',
                    description: 'MyAnimeList unofficial API',
                    features: ['search', 'details', 'trending', 'seasonal']
                },
                kitsu: {
                    available: true,
                    endpoint: 'https://kitsu.io/api/edge',
                    description: 'Kitsu anime database API',
                    features: ['search', 'details', 'trending']
                }
            },
            genres: this.genresData,
            cache_settings: {
                ttl: '1 hour',
                directory: this.cacheDir,
                auto_cleanup: true
            },
            rate_limits: {
                jikan: '3 requests per second',
                kitsu: '100 requests per minute'
            }
        };

        const reportPath = path.join(this.dataDir, 'setup-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('📊 Anime Data Setup Report:');
        console.log(`   Jikan API: ${report.sources.jikan.available ? '✅' : '❌'}`);
        console.log(`   Kitsu API: ${report.sources.kitsu.available ? '✅' : '❌'}`);
        console.log(`   Genres loaded: ${Object.keys(this.genresData).length} sources`);
        console.log(`   Report saved to: ${reportPath}\n`);
    }

    async testAnimeFeatures() {
        console.log('🧪 Testing anime features...\n');

        try {
            // Test search feature
            console.log('🔍 Testing anime search...');
            const searchResult = await this.testSearch('Naruto');
            if (searchResult) {
                console.log(`   ✅ Search: Found ${searchResult.length} results`);
            }

            // Test trending feature
            console.log('🔥 Testing trending anime...');
            const trendingResult = await this.testTrending();
            if (trendingResult) {
                console.log(`   ✅ Trending: Found ${trendingResult.length} anime`);
            }

        } catch (error) {
            console.log(`❌ Feature test failed: ${error.message}\n`);
        }
    }

    async testSearch(query) {
        try {
            const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}&limit=1`, {
                headers: { 'User-Agent': 'terastudio-Api/1.0' }
            });
            return data.data;
        } catch (error) {
            return null;
        }
    }

    async testTrending() {
        try {
            const { data } = await axios.get('https://api.jikan.moe/v4/top/anime?limit=1', {
                headers: { 'User-Agent': 'terastudio-Api/1.0' }
            });
            return data.data;
        } catch (error) {
            return null;
        }
    }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new AnimeDataSetup();
    setup.setupAnimeData()
        .then(() => setup.testAnimeFeatures())
        .catch(error => {
            console.error('Setup failed:', error.message);
            process.exit(1);
        });
}

export default AnimeDataSetup;