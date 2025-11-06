import { validateQuery } from '../../src/middleware/validation.js';
import { APIError } from '../../src/utils/ErrorHandler.js';

export default {
    name: "Get Users",
    description: "Get a list of users with pagination",
    category: "User Management",
    methods: ["GET"],
    params: ["page", "limit", "search"],
    
    run: [
        // Validation middleware for query parameters
        validateQuery({
            page: { 
                type: 'number', 
                min: 1, 
                default: 1 
            },
            limit: { 
                type: 'number', 
                min: 1, 
                max: 100, 
                default: 10 
            },
            search: { 
                type: 'string', 
                maxLength: 50 
            }
        }),
        
        // Main endpoint handler
        async (req, res) => {
            try {
                const { page = 1, limit = 10, search = '' } = req.query;
                
                // Simulate fetching users from database
                const users = Array.from({ length: limit }, (_, i) => ({
                    id: ((page - 1) * limit) + i + 1,
                    username: `user${((page - 1) * limit) + i + 1}`,
                    email: `user${((page - 1) * limit) + i + 1}@example.com`,
                    createdAt: new Date().toISOString()
                })).filter(user => 
                    !search || user.username.includes(search) || user.email.includes(search)
                );
                
                res.json({
                    data: {
                        users,
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total: users.length,
                            hasNext: users.length === parseInt(limit) // Simple logic for demo
                        }
                    },
                    message: "Users retrieved successfully"
                });
                
            } catch (error) {
                if (!(error instanceof APIError)) {
                    throw new APIError("Failed to retrieve users", 500, "USERS_RETRIEVAL_ERROR");
                }
                throw error;
            }
        }
    ]
};