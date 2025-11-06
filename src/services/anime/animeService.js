import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AnimeService {
    constructor() {
        this.cacheDir = path.join(process.cwd(), 'data', 'cache', 'anime');
        this.ensureCacheDir();
    }

    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    // Cache management
    getCacheKey(type, params) {
        return `${type}_${JSON.stringify(params)}`;
    }

    getFromCache(key) {
        try {
            const cacheFile = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(cacheFile)) {
                const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                if (Date.now() - data.timestamp < 3600000) { // 1 hour cache
                    return data.content;
                }
            }
        } catch (error) {
            console.error('Cache read error:', error.message);
        }
        return null;
    }

    setCache(key, content) {
        try {
            const cacheFile = path.join(this.cacheDir, `${key}.json`);
            fs.writeFileSync(cacheFile, JSON.stringify({
                content,
                timestamp: Date.now()
            }, null, 2));
        } catch (error) {
            console.error('Cache write error:', error.message);
        }
    }

    // Scraping methods
    async scrapeKitsuSearch(query, page = 1) {
        const cacheKey = this.getCacheKey('kitsu_search', { query, page });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20&page[offset]=${(page - 1) * 20}`;
            const { data } = await axios.get(url, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'User-Agent': 'terastudio-Api/1.0'
                }
            });

            const results = data.data.map(anime => ({
                id: anime.id,
                title: anime.attributes.titles?.en || anime.attributes.titles?.en_jp || anime.attributes.canonicalTitle,
                description: anime.attributes.synopsis,
                coverImage: anime.attributes.coverImage?.medium || anime.attributes.posterImage?.medium,
                posterImage: anime.attributes.posterImage?.medium,
                status: anime.attributes.status,
                episodeCount: anime.attributes.episodeCount,
                episodeLength: anime.attributes.episodeLength,
                rating: anime.attributes.averageRating,
                genres: anime.relationships?.genres?.data?.map(g => g.id) || [],
                startDate: anime.attributes.startDate,
                endDate: anime.attributes.endDate,
                source: 'kitsu'
            }));

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Kitsu search error:', error.message);
            return [];
        }
    }

    async scrapeKitsuDetail(id) {
        const cacheKey = this.getCacheKey('kitsu_detail', { id });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://kitsu.io/api/edge/anime/${id}`;
            const { data } = await axios.get(url, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'User-Agent': 'terastudio-Api/1.0'
                }
            });

            const anime = data.data;
            const result = {
                id: anime.id,
                title: anime.attributes.titles?.en || anime.attributes.titles?.en_jp || anime.attributes.canonicalTitle,
                alternativeTitles: anime.attributes.titles,
                description: anime.attributes.synopsis,
                coverImage: anime.attributes.coverImage?.large || anime.attributes.coverImage?.medium,
                posterImage: anime.attributes.posterImage?.large || anime.attributes.posterImage?.medium,
                bannerImage: anime.attributes.coverImage?.original,
                status: anime.attributes.status,
                episodeCount: anime.attributes.episodeCount,
                episodeLength: anime.attributes.episodeLength,
                totalLength: anime.attributes.episodeCount * anime.attributes.episodeLength,
                rating: anime.attributes.averageRating,
                ratingRank: anime.attributes.ratingRank,
                popularityRank: anime.attributes.popularityRank,
                genres: [],
                characters: [],
                staff: [],
                startDate: anime.attributes.startDate,
                endDate: anime.attributes.endDate,
                ageRating: anime.attributes.ageRating,
                ageRatingGuide: anime.attributes.ageRatingGuide,
                source: 'kitsu'
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Kitsu detail error:', error.message);
            return null;
        }
    }

    async scrapeJikanSearch(query, page = 1) {
        const cacheKey = this.getCacheKey('jikan_search', { query, page });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`;
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'terastudio-Api/1.0'
                }
            });

            const results = data.data.map(anime => ({
                mal_id: anime.mal_id,
                title: anime.title,
                title_english: anime.title_english,
                title_japanese: anime.title_japanese,
                images: anime.images,
                synopsis: anime.synopsis,
                type: anime.type,
                status: anime.status,
                episodes: anime.episodes,
                duration: anime.duration,
                rating: anime.score,
                genres: anime.genres?.map(g => g.name) || [],
                themes: anime.themes?.map(t => t.name) || [],
                demographics: anime.demographics?.map(d => d.name) || [],
                aired: anime.aired,
                season: anime.season,
                year: anime.year,
                source: 'jikan'
            }));

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Jikan search error:', error.message);
            return [];
        }
    }

    async scrapeJikanDetail(mal_id) {
        const cacheKey = this.getCacheKey('jikan_detail', { mal_id });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://api.jikan.moe/v4/anime/${mal_id}/full`;
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'terastudio-Api/1.0'
                }
            });

            const anime = data.data;
            const result = {
                mal_id: anime.mal_id,
                url: anime.url,
                title: anime.title,
                title_english: anime.title_english,
                title_japanese: anime.title_japanese,
                images: anime.images,
                trailer: anime.trailer,
                approved: anime.approved,
                titles: anime.titles,
                synopsis: anime.synopsis,
                background: anime.background,
                type: anime.type,
                episodes: anime.episodes,
                status: anime.status,
                airing: anime.airing,
                aired: anime.aired,
                duration: anime.duration,
                rating: anime.rating,
                score: anime.score,
                scored_by: anime.scored_by,
                rank: anime.rank,
                popularity: anime.popularity,
                members: anime.members,
                favorites: anime.favorites,
                themes: anime.themes?.map(t => t) || [],
                genres: anime.genres?.map(g => g) || [],
                explicit_genres: anime.explicit_genres?.map(g => g) || [],
                demographics: anime.demographics?.map(d => d) || [],
                studios: anime.studios?.map(s => s) || [],
                producers: anime.producers?.map(p => p) || [],
                source: 'jikan',
                season: anime.season,
                year: anime.year,
                broadcast: anime.broadcast,
                source_type: 'jikan'
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Jikan detail error:', error.message);
            return null;
        }
    }

    async getTrendingAnime(source = 'jikan', limit = 20) {
        const cacheKey = this.getCacheKey('trending', { source, limit });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            let results = [];

            if (source === 'jikan') {
                const url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=${limit}`;
                const { data } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'terastudio-Api/1.0'
                    }
                });

                results = data.data.map(anime => ({
                    rank: anime.rank,
                    mal_id: anime.mal_id,
                    title: anime.title,
                    images: anime.images,
                    episodes: anime.episodes,
                    score: anime.score,
                    popularity: anime.popularity,
                    year: anime.year,
                    type: anime.type,
                    status: anime.status,
                    source: 'jikan'
                }));
            } else if (source === 'kitsu') {
                const url = `https://kitsu.io/api/edge/trending/anime`;
                const { data } = await axios.get(url, {
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        'User-Agent': 'terastudio-Api/1.0'
                    }
                });

                results = data.data.map(anime => ({
                    id: anime.id,
                    title: anime.attributes.canonicalTitle,
                    posterImage: anime.attributes.posterImage?.medium,
                    coverImage: anime.attributes.coverImage?.medium,
                    episodeCount: anime.attributes.episodeCount,
                    averageRating: anime.attributes.averageRating,
                    popularityRank: anime.attributes.popularityRank,
                    status: anime.attributes.status,
                    source: 'kitsu'
                }));
            }

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Trending anime error:', error.message);
            return [];
        }
    }

    async getSeasonalAnime(season = 'winter', year = 2024, source = 'jikan') {
        const cacheKey = this.getCacheKey('seasonal', { season, year, source });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://api.jikan.moe/v4/seasons/${year}/${season}?limit=25`;
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'terastudio-Api/1.0'
                }
            });

            const results = data.data.map(anime => ({
                mal_id: anime.mal_id,
                title: anime.title,
                images: anime.images,
                episodes: anime.episodes,
                score: anime.score,
                year: anime.year,
                type: anime.type,
                status: anime.status,
                season: season,
                source: 'jikan'
            }));

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Seasonal anime error:', error.message);
            return [];
        }
    }

    // Advanced search with multiple criteria
    async advancedSearch(filters) {
        const { 
            query = '', 
            genre = '', 
            type = '', 
            status = '', 
            year = '', 
            score = '',
            sort = 'popularity',
            page = 1,
            source = 'jikan'
        } = filters;

        const cacheKey = this.getCacheKey('advanced_search', filters);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            let results = [];

            if (source === 'jikan') {
                let url = `https://api.jikan.moe/v4/anime?page=${page}&limit=20`;
                
                if (query) url += `&q=${encodeURIComponent(query)}`;
                if (genre) url += `&genres=${genre}`;
                if (type) url += `&type=${type}`;
                if (status) url += `&status=${status}`;
                if (year) url += `&year=${year}`;
                if (score) url += `&min_score=${score}`;
                url += `&order_by=${sort}`;

                const { data } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'terastudio-Api/1.0'
                    }
                });

                results = data.data.map(anime => ({
                    mal_id: anime.mal_id,
                    title: anime.title,
                    images: anime.images,
                    synopsis: anime.synopsis,
                    episodes: anime.episodes,
                    duration: anime.duration,
                    score: anime.score,
                    rank: anime.rank,
                    popularity: anime.popularity,
                    year: anime.year,
                    type: anime.type,
                    status: anime.status,
                    genres: anime.genres?.map(g => g.name) || [],
                    themes: anime.themes?.map(t => t.name) || [],
                    source: 'jikan'
                }));
            }

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Advanced search error:', error.message);
            return [];
        }
    }

    // Get random anime recommendations
    async getRandomAnime(genre = '', type = '', count = 10) {
        const cacheKey = this.getCacheKey('random', { genre, type, count });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            let url = 'https://api.jikan.moe/v4/random/anime';
            if (genre) url += `?genres=${genre}`;
            if (type) url += `${genre ? '&' : '?'}type=${type}`;

            const promises = [];
            for (let i = 0; i < count; i++) {
                promises.push(axios.get(url, {
                    headers: {
                        'User-Agent': 'terastudio-Api/1.0'
                    }
                }));
            }

            const responses = await Promise.allSettled(promises);
            const results = responses
                .filter(response => response.status === 'fulfilled')
                .map(response => response.value.data.data)
                .map(anime => ({
                    mal_id: anime.mal_id,
                    title: anime.title,
                    images: anime.images,
                    synopsis: anime.synopsis,
                    episodes: anime.episodes,
                    duration: anime.duration,
                    score: anime.score,
                    year: anime.year,
                    type: anime.type,
                    status: anime.status,
                    genres: anime.genres?.map(g => g.name) || [],
                    source: 'jikan'
                }));

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Random anime error:', error.message);
            return [];
        }
    }
}

export default AnimeService;