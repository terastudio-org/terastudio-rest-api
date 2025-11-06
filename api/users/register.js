import { validateQuery, validateBody } from '../../src/middleware/validation.js';
import { APIError } from '../../src/utils/ErrorHandler.js';

export default {
    name: "User Registration",
    description: "Register a new user with validation",
    category: "User Management",
    methods: ["POST"],
    params: ["username", "email", "password"],
    
    run: [
        // Validation middleware
        validateBody({
            username: { 
                type: 'string', 
                required: true, 
                minLength: 3, 
                maxLength: 30 
            },
            email: { 
                type: 'string', 
                required: true, 
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email regex
            },
            password: { 
                type: 'string', 
                required: true, 
                minLength: 6 
            },
            age: { 
                type: 'number', 
                min: 13, 
                max: 120 
            }
        }),
        
        // Main endpoint handler
        async (req, res) => {
            try {
                const { username, email, password, age } = req.body;
                
                // Simulate user creation
                const user = {
                    id: Date.now(), // In real app, use proper ID generation
                    username,
                    email,
                    age: age || null,
                    createdAt: new Date().toISOString()
                };
                
                res.status(201).json({
                    data: user,
                    message: "User created successfully"
                });
                
            } catch (error) {
                // If error is already an APIError, it will be handled by the error handler middleware
                // If it's another type of error, wrap it
                if (!(error instanceof APIError)) {
                    throw new APIError("Failed to create user", 500, "USER_CREATION_ERROR");
                }
                throw error;
            }
        }
    ]
};