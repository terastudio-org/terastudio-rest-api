import NSFWService from "../../src/services/nsfw/nsfwService.js";

const nsfwService = new NSFWService();

export default {
    name: "Content Warning Generator",
    description: "Generate appropriate content warnings based on analysis",
    category: "NSFW",
    methods: ["GET", "POST"],
    params: ["content", "type", "analysis"],
    paramsSchema: {
        content: { type: "string", required: true, minLength: 1 },
        type: { 
            type: "string", 
            required: false, 
            enum: ["text", "image", "video", "audio", "mixed"],
            default: "text" 
        },
        analysis: {
            type: "object",
            required: false,
            description: "Pre-existing analysis data (optional)"
        }
    },
    async run(req, res) {
        try {
            const { content, type = "text", analysis } = req.method === 'GET' ? req.query : req.body;
            const clientIP = req.ip || req.connection.remoteAddress;

            if (!content || typeof content !== "string" || content.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Parameter 'content' wajib diisi untuk generate warning."
                });
            }

            // Use provided analysis or generate new one
            let contentAnalysis = analysis;
            if (!contentAnalysis) {
                contentAnalysis = nsfwService.analyzeContentSafety(content);
            }

            // Generate comprehensive warnings
            const warnings = nsfwService.generateContentWarning(contentAnalysis);

            // Generate content-specific warnings
            const specificWarnings = [];
            
            if (type === "image" || type === "mixed") {
                specificWarnings.push({
                    category: "visual_content",
                    level: "info",
                    message: "Konten visual terdeteksi",
                    recommendation: "Reviewed by user discretion"
                });
            }

            if (type === "video" || type === "mixed") {
                specificWarnings.push({
                    category: "video_content",
                    level: "info",
                    message: "Konten video terdeteksi",
                    recommendation: "Ensure appropriate viewing environment"
                });
            }

            if (contentAnalysis.classification === 'nsfw') {
                specificWarnings.push({
                    category: "legal_compliance",
                    level: "warning",
                    message: "Konten 18+ terdeteksi",
                    recommendation: "Age verification required",
                    legal_note: "Access restricted to users 18+ only"
                });
            }

            // Generate age rating recommendations
            let ageRating = "General Audience";
            if (contentAnalysis.classification === 'suggestive') {
                ageRating = "Teen (13+)";
            } else if (contentAnalysis.classification === 'mature') {
                ageRating = "Mature (17+)";
            } else if (contentAnalysis.classification === 'nsfw') {
                ageRating = "Adults Only (18+)";
            }

            // Generate content description for warnings
            const warningDescription = this.generateWarningDescription(contentAnalysis, type);

            const result = {
                content_type: type,
                age_rating: ageRating,
                classification: contentAnalysis.classification,
                risk_level: contentAnalysis.riskLevel,
                safety_score: contentAnalysis.safetyScore,
                content_warnings: warnings,
                specific_warnings: specificWarnings,
                warning_description: warningDescription,
                exposure_guidelines: this.getExposureGuidelines(contentAnalysis.classification),
                parental_guidance: this.getParentalGuidance(contentAnalysis.classification),
                legal_disclaimer: this.getLegalDisclaimer(contentAnalysis.classification),
                metadata: {
                    generated_at: new Date().toISOString(),
                    content_length: content.length,
                    analysis_confidence: contentAnalysis.analysis ? contentAnalysis.analysis.recommendation : "Basic analysis"
                }
            };

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                attribution: "@terastudio-org"
            });

        } catch (error) {
            console.error('Warning generation error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat generate content warnings",
                timestamp: new Date().toISOString()
            });
        }
    }

    generateWarningDescription(analysis, type) {
        const descriptions = {
            safe: `Content appears safe for general audiences. No specific warnings required.`,
            suggestive: `Content may contain mild adult themes or suggestive content. Consider user discretion.`,
            mature: `Content contains mature themes that may not be suitable for minors. Parental guidance recommended.`,
            nsfw: `Content contains explicit adult material. Strictly for adults 18+ only. Age verification required.`
        };

        return descriptions[analysis.classification] || "Content classification unclear. Manual review recommended.";
    }

    getExposureGuidelines(classification) {
        const guidelines = {
            safe: [
                "Suitable for all audiences",
                "No content restrictions",
                "Family-friendly content"
            ],
            suggestive: [
                "May contain mild adult themes",
                "Consider user age and maturity",
                "Some content may not be suitable for children"
            ],
            mature: [
                "Contains mature themes",
                "Not suitable for minors under 17",
                "Parental guidance strongly recommended",
                "Viewer discretion advised"
            ],
            nsfw: [
                "Explicit adult content",
                "18+ only - Age verification required",
                "Not suitable for any minors",
                "May violate platform policies"
            ]
        };

        return guidelines[classification] || ["Content requires manual review"];
    }

    getParentalGuidance(classification) {
        const guidance = {
            safe: "No parental guidance needed. Content is appropriate for all ages.",
            suggestive: "Parents should review content before allowing access to younger viewers.",
            mature: "Strong parental guidance required. Content not suitable for minors.",
            nsfw: "Strictly for adults only. Must implement age verification systems."
        };

        return guidance[classification] || "Manual parental review required.";
    }

    getLegalDisclaimer(classification) {
        const disclaimers = {
            safe: "Content complies with general platform guidelines and local regulations.",
            suggestive: "Content may require age gating depending on local regulations.",
            mature: "Content may violate platform policies and local laws. Review required.",
            nsfw: "Explicit content restricted by law. Age verification and compliance required."
        };

        return disclaimers[classification] || "Legal review required for content classification.";
    }
};