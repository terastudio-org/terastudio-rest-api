import NSFWService from "../../src/services/nsfw/nsfwService.js";

const nsfwService = new NSFWService();

export default {
    name: "Age Verification",
    description: "Age verification system for accessing NSFW content (18+ only)",
    category: "NSFW",
    methods: ["GET", "POST"],
    params: ["action", "token"],
    paramsSchema: {
        action: { 
            type: "string", 
            required: false, 
            enum: ["request", "confirm"], 
            default: "request" 
        },
        token: { 
            type: "string", 
            required: false,
            description: "Verification token from age verification request" 
        }
    },
    async run(req, res) {
        try {
            const { action = "request", token } = req.method === 'GET' ? req.query : req.body;
            const clientIP = req.ip || req.connection.remoteAddress;

            if (action === "request") {
                const verification = await nsfwService.verifyAge(req, res);
                
                if (verification.verified) {
                    return res.json({
                        success: true,
                        data: {
                            verified: true,
                            ip: verification.ip,
                            message: "Age verified successfully",
                            access_granted: true
                        },
                        timestamp: new Date().toISOString(),
                        attribution: "@terastudio-org"
                    });
                } else {
                    return res.json({
                        success: true,
                        data: {
                            verified: false,
                            ip: verification.ip,
                            token: verification.token,
                            message: verification.message,
                            verification_method: verification.verificationMethod,
                            expires_in: verification.expiresIn,
                            access_granted: false,
                            instructions: "Use the token to confirm age verification via POST request"
                        },
                        timestamp: new Date().toISOString(),
                        attribution: "@terastudio-org"
                    });
                }
            } else if (action === "confirm") {
                if (!token) {
                    return res.status(400).json({
                        success: false,
                        error: "Token verifikasi wajib disediakan untuk konfirmasi usia."
                    });
                }

                const result = await nsfwService.confirmAgeVerification(token);
                
                if (result.success) {
                    return res.json({
                        success: true,
                        data: {
                            verified: true,
                            ip: result.ip,
                            message: "Usia berhasil diverifikasi. Akses NSFW content diberikan.",
                            access_granted: true,
                            verified_at: new Date().toISOString()
                        },
                        timestamp: new Date().toISOString(),
                        attribution: "@terastudio-org"
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        error: result.error,
                        message: "Verifikasi usia gagal. Silakan coba lagi.",
                        access_granted: false
                    });
                }
            }

        } catch (error) {
            console.error('Age verification error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message || "Terjadi kesalahan saat verifikasi usia",
                timestamp: new Date().toISOString()
            });
        }
    }
};