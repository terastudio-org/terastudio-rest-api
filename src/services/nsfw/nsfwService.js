import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NSFWService {
    constructor() {
        this.cacheDir = path.join(process.cwd(), 'data', 'cache', 'nsfw');
        this.verifiedIPs = new Set();
        this.ensureCacheDir();
        this.loadVerifiedIPs();
        
        // NSFW content patterns and keywords for detection
        this.nsfwKeywords = [
            // General adult content terms
            'adult', 'mature', 'explicit', 'nsfw', 'nude', 'naked',
            'sexual', 'erotic', 'porn', 'xxx', 'sex',
            // Body parts (for content analysis)
            'breast', 'ass', 'genitals', 'penis', 'vagina',
            // Activities (for content analysis)
            'intercourse', 'oral', 'masturbation', 'orgasm'
        ];
        
        this.safeKeywords = [
            'art', 'anime', 'manga', 'character', 'design',
            'fashion', 'style', 'cosplay', 'modeling',
            'health', 'medical', 'educational', 'science'
        ];
    }

    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    loadVerifiedIPs() {
        try {
            const verifiedFile = path.join(process.cwd(), 'data', 'verified-adult-ips.json');
            if (fs.existsSync(verifiedFile)) {
                const data = JSON.parse(fs.readFileSync(verifiedFile, 'utf8'));
                this.verifiedIPs = new Set(data.ips || []);
            }
        } catch (error) {
            console.error('Error loading verified IPs:', error.message);
        }
    }

    saveVerifiedIPs() {
        try {
            const verifiedFile = path.join(process.cwd(), 'data', 'verified-adult-ips.json');
            fs.writeFileSync(verifiedFile, JSON.stringify({
                ips: Array.from(this.verifiedIPs),
                lastUpdated: new Date().toISOString()
            }, null, 2));
        } catch (error) {
            console.error('Error saving verified IPs:', error.message);
        }
    }

    getClientIP(req) {
        return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    }

    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Age verification system
    async verifyAge(req, res) {
        const clientIP = this.getClientIP(req);
        
        if (this.verifiedIPs.has(clientIP)) {
            return { verified: true, ip: clientIP };
        }

        // Generate verification token and send to user
        const token = this.generateVerificationToken();
        const verificationData = {
            ip: clientIP,
            token: token,
            timestamp: Date.now(),
            expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
        };

        // Store verification data (in production, use Redis or database)
        const verificationFile = path.join(this.cacheDir, `verification_${token}.json`);
        fs.writeFileSync(verificationFile, JSON.stringify(verificationData, null, 2));

        // In a real implementation, you would send an email/SMS verification
        // For this demo, we'll return the verification info
        return {
            verified: false,
            ip: clientIP,
            token: token,
            message: "Age verification required. Please confirm you are 18+ to access NSFW content.",
            verificationMethod: "token",
            expiresIn: "30 minutes"
        };
    }

    async confirmAgeVerification(token) {
        try {
            const verificationFile = path.join(this.cacheDir, `verification_${token}.json`);
            
            if (!fs.existsSync(verificationFile)) {
                return { success: false, error: "Invalid verification token" };
            }

            const verificationData = JSON.parse(fs.readFileSync(verificationFile, 'utf8'));
            
            // Check if token is expired
            if (Date.now() > verificationData.expiresAt) {
                fs.unlinkSync(verificationFile);
                return { success: false, error: "Verification token expired" };
            }

            // Add IP to verified list
            this.verifiedIPs.add(verificationData.ip);
            this.saveVerifiedIPs();

            // Clean up verification file
            fs.unlinkSync(verificationFile);

            return { success: true, ip: verificationData.ip };
        } catch (error) {
            console.error('Age verification error:', error.message);
            return { success: false, error: "Verification failed" };
        }
    }

    // Content detection and analysis
    analyzeContentSafety(text, imageUrl = null) {
        const lowerText = text.toLowerCase();
        
        // Check for NSFW keywords
        const nsfwMatches = this.nsfwKeywords.filter(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );
        
        // Check for safe keywords
        const safeMatches = this.safeKeywords.filter(keyword => 
            lowerText.includes(keyword.toLowerCase())
        );

        // Calculate safety score (0-100, lower = more safe)
        const nsfwScore = nsfwMatches.length * 20;
        const safeScore = safeMatches.length * 10;
        const safetyScore = Math.max(0, 100 - nsfwScore + safeScore);

        // Determine content classification
        let classification = 'safe';
        let riskLevel = 'low';
        
        if (nsfwScore > 60) {
            classification = 'nsfw';
            riskLevel = 'high';
        } else if (nsfwScore > 30) {
            classification = 'mature';
            riskLevel = 'medium';
        } else if (nsfwScore > 10) {
            classification = 'suggestive';
            riskLevel = 'low';
        }

        return {
            classification,
            riskLevel,
            safetyScore,
            nsfwKeywords: nsfwMatches,
            safeKeywords: safeMatches,
            analysis: {
                textLength: text.length,
                hasNSFWContent: nsfwMatches.length > 0,
                hasSafeContent: safeMatches.length > 0,
                recommendation: this.getRecommendation(classification, riskLevel)
            }
        };
    }

    getRecommendation(classification, riskLevel) {
        switch (classification) {
            case 'nsfw':
                return "Content contains explicit adult material. Age verification required.";
            case 'mature':
                return "Content may be inappropriate for minors. Proceed with caution.";
            case 'suggestive':
                return "Content may contain mild adult themes. Consider user discretion.";
            case 'safe':
                return "Content appears safe for general audiences.";
            default:
                return "Content classification unclear. Review manually.";
        }
    }

    // URL safety checking
    async checkURLSafety(url) {
        const cacheKey = `url_safety_${crypto.createHash('md5').update(url).digest('hex')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // Check against known safe/unsafe domains
            const safeDomains = [
                'reddit.com', 'twitter.com', 'instagram.com', 
                'pixiv.net', 'deviantart.com', 'artstation.com'
            ];
            
            const suspiciousDomains = [
                'xxx', 'porn', 'sex', 'adult', 'nude'
            ];

            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();

            let safetyScore = 50; // neutral
            let checks = {
                isHTTPS: urlObj.protocol === 'https:',
                isKnownSafe: safeDomains.some(safe => domain.includes(safe)),
                isSuspicious: suspiciousDomains.some(susp => domain.includes(susp)),
                hasSuspiciousTLD: /\.(xxx|adult|porn|sex)$/i.test(domain)
            };

            if (checks.isHTTPS) safetyScore += 10;
            if (checks.isKnownSafe) safetyScore += 30;
            if (checks.isSuspicious) safetyScore -= 40;
            if (checks.hasSuspiciousTLD) safetyScore -= 30;

            safetyScore = Math.max(0, Math.min(100, safetyScore));

            let classification = 'unknown';
            if (safetyScore >= 80) classification = 'safe';
            else if (safetyScore >= 60) classification = 'mostly_safe';
            else if (safetyScore >= 40) classification = 'questionable';
            else if (safetyScore >= 20) classification = 'suspicious';
            else classification = 'unsafe';

            const result = {
                url,
                domain,
                safetyScore,
                classification,
                checks,
                timestamp: new Date().toISOString(),
                cached: false
            };

            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('URL safety check error:', error.message);
            return {
                url,
                safetyScore: 0,
                classification: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Content moderation for images
    async moderateImage(imageUrl) {
        const cacheKey = `image_moderation_${crypto.createHash('md5').update(imageUrl).digest('hex')}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // Check URL safety first
            const urlSafety = await this.checkURLSafety(imageUrl);
            
            if (urlSafety.classification === 'unsafe') {
                const result = {
                    imageUrl,
                    safe: false,
                    reason: 'URL flagged as unsafe',
                    classification: 'blocked',
                    urlSafety,
                    timestamp: new Date().toISOString()
                };
                this.setCache(cacheKey, result);
                return result;
            }

            // For demonstration, we'll do a basic analysis
            // In production, you'd integrate with services like:
            // - Google Cloud Vision API
            // - AWS Rekognition
            // - Azure Content Moderator
            // - OpenAI Moderation API
            
            const result = {
                imageUrl,
                safe: true, // In production, this would be determined by AI analysis
                confidence: 0.85, // Mock confidence score
                classification: 'safe',
                warnings: [],
                urlSafety,
                timestamp: new Date().toISOString(),
                note: "Basic URL-based moderation. For production, integrate with AI content moderation APIs."
            };

            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Image moderation error:', error.message);
            return {
                imageUrl,
                safe: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Generate content warnings
    generateContentWarning(analysis) {
        const warnings = [];
        
        if (analysis.classification === 'nsfw') {
            warnings.push({
                type: 'explicit_content',
                level: 'high',
                message: 'Contains explicit adult content',
                recommendation: '18+ only'
            });
        }
        
        if (analysis.classification === 'mature') {
            warnings.push({
                type: 'mature_content',
                level: 'medium',
                message: 'Contains mature themes',
                recommendation: 'Consider user discretion'
            });
        }

        if (analysis.riskLevel === 'high') {
            warnings.push({
                type: 'high_risk',
                level: 'high',
                message: 'High risk content detected',
                recommendation: 'Additional review recommended'
            });
        }

        return warnings;
    }

    // Rate limiting for NSFW endpoints
    checkRateLimit(ip) {
        const rateLimitFile = path.join(this.cacheDir, `rate_limit_${ip}.json`);
        const now = Date.now();
        
        try {
            if (fs.existsSync(rateLimitFile)) {
                const data = JSON.parse(fs.readFileSync(rateLimitFile, 'utf8'));
                const timeDiff = now - data.timestamp;
                
                // Reset counter if more than 1 hour passed
                if (timeDiff > 3600000) {
                    data.requests = 1;
                    data.timestamp = now;
                } else {
                    data.requests++;
                }
                
                // Check if limit exceeded (100 requests per hour)
                if (data.requests > 100) {
                    return { allowed: false, requests: data.requests, limit: 100 };
                }
                
                fs.writeFileSync(rateLimitFile, JSON.stringify(data, null, 2));
                return { allowed: true, requests: data.requests, limit: 100 };
            } else {
                // First request
                const data = { requests: 1, timestamp: now };
                fs.writeFileSync(rateLimitFile, JSON.stringify(data, null, 2));
                return { allowed: true, requests: 1, limit: 100 };
            }
        } catch (error) {
            console.error('Rate limit check error:', error.message);
            return { allowed: true, requests: 0, limit: 100 };
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
                if (Date.now() - data.timestamp < 1800000) { // 30 minutes cache
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

    // Get NSFW statistics and metrics
    getStats() {
        return {
            verifiedIPs: this.verifiedIPs.size,
            cacheSize: fs.readdirSync(this.cacheDir).length,
            lastActivity: new Date().toISOString()
        };
    }
}

export default NSFWService;