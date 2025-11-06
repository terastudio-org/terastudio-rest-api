# Contributing to terastudio REST API

First off, thank you for considering contributing to terastudio REST API! It's people like you that make this project better.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots and animated GIFs if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

#### Pull Request Guidelines

- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the JavaScript/Node.js coding standards
- Add tests for your changes if applicable
- Update documentation for any new features
- Ensure all tests pass before submitting

## Development Setup

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/terastudio-org/terastudio-rest-api.git
   cd terastudio-rest-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Access the API documentation at `http://localhost:3000`

### Project Structure

```
terastudio-rest-api/
├── api/              # API endpoints (auto-loaded)
├── public/           # Static files and documentation
├── src/
│   ├── app/         # Application configuration
│   ├── middleware/  # Express middleware
│   ├── services/    # Business logic layer
│   └── utils/       # Utility functions
├── tests/           # Test files
└── docs/            # Additional documentation
```

## Adding New Endpoints

1. Create a new JavaScript file in the appropriate directory under `api/`
2. Follow the endpoint template structure
3. The endpoint will be automatically registered
4. Test your endpoint thoroughly

Example endpoint structure:
```javascript
export default {
    name: "Endpoint Name",
    description: "Endpoint description",
    category: "Category",
    methods: ["GET", "POST"],
    params: ["param1", "param2"],
    
    async run(req, res) {
        try {
            // Your implementation here
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
```

## Style Guide

- Use ES6+ features
- Follow existing code formatting
- Add JSDoc comments for functions and complex logic
- Use meaningful variable and function names
- Keep functions focused and small
- Add error handling for all async operations

## Testing

- Write tests for new features
- Run tests before submitting PR: `npm test`
- Ensure all existing tests pass
- Test endpoints manually via the documentation interface

## Documentation

- Update README.md for significant changes
- Add JSDoc comments to all functions
- Update API documentation if adding new endpoints
- Include code examples in documentation

## Questions?

If you have any questions, feel free to:

- Open an issue for discussion
- Contact us at admin@terastudio.org
- Check existing documentation

Thank you for contributing to terastudio REST API! 🎉