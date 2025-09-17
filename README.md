# 🚀 Stockify - AI-Powered Stock Photo Metadata Generator

[![CI/CD Pipeline](https://github.com/yourusername/stockify/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/yourusername/stockify/actions)
[![Docker](https://img.shields.io/docker/v/yourusername/stockify?label=docker)](https://hub.docker.com/r/yourusername/stockify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

> **Transform your images into stock photo metadata with AI-powered precision**

Stockify is a modern React application that automatically generates metadata for stock photo platforms using Google's Gemini Multimodal AI. Upload multiple images and get platform-ready CSV files with descriptions, keywords, and categories.

## ✨ Features

- 🎨 **Multi-Platform Support**: Shutterstock, Adobe Stock, Getty Images, and more
- 🤖 **AI-Powered**: Uses Google Gemini Multimodal for intelligent metadata generation
- 📱 **Modern UI**: Responsive design with dark/light mode
- 🚀 **Fast Processing**: Batch image processing with progress tracking
- 📊 **Smart Validation**: Platform-specific validation rules
- 🔄 **Retry Logic**: Manual retry for failed images
- 📋 **CSV Export**: Ready-to-upload CSV files
- 🐳 **Docker Ready**: Containerized for easy deployment

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/stockify.git
cd stockify

# Run with Docker Compose
docker-compose --profile dev up

# Or run production build
docker-compose --profile prod up
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/stockify.git
cd stockify

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Configuration
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Custom API endpoint
REACT_APP_GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models

# Optional: Default model
REACT_APP_DEFAULT_MODEL=gemini-2.5-flash-lite
```

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## 📖 Usage

1. **Upload Images**: Drag and drop or select multiple images
2. **Choose Platform**: Select your target stock photo platform
3. **Select AI Model**: Choose from available Gemini models
4. **Process**: Click "Process Images" to generate metadata
5. **Review**: Check generated metadata and edit if needed
6. **Download**: Export CSV file ready for platform upload

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── FileUpload.js   # Drag & drop file handling
│   ├── ImagePreview.js # Image grid with pagination
│   ├── MetadataEditor.js # Metadata editing interface
│   └── ...
├── utils/              # Utility functions
│   ├── geminiApi.js    # AI API integration
│   ├── csvGenerator.js # CSV generation
│   └── platformConfig.js # Platform configurations
└── App.js              # Main application
```

## 🐳 Docker Commands

```bash
# Development with hot reload
docker-compose --profile dev-hot up

# Production build
docker-compose --profile prod up

# Build custom image
docker build -t stockify .

# Run container
docker run -p 80:80 stockify
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚀 Deployment

### Docker Hub

```bash
# Build and push to Docker Hub
docker build -t yourusername/stockify .
docker push yourusername/stockify
```

### Cloud Platforms

- **AWS**: Use ECS, EKS, or Elastic Beanstalk
- **Google Cloud**: Use Cloud Run or GKE
- **Azure**: Use Container Instances or AKS
- **Vercel**: Deploy directly from GitHub
- **Netlify**: Deploy with custom build settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📋 Roadmap

- [ ] **Getty Images Support**: Add Getty Images platform configuration
- [ ] **Batch Processing**: Process images in parallel for faster results
- [ ] **Custom Categories**: Allow users to define custom category mappings
- [ ] **API Integration**: Direct upload to stock platforms
- [ ] **Analytics**: Track usage and performance metrics
- [ ] **Mobile App**: React Native version for mobile devices

## 🐛 Troubleshooting

### Common Issues

**Images not processing:**
- Check your Gemini API key is valid
- Ensure images are in supported formats (JPG, PNG, WebP)
- Verify API rate limits haven't been exceeded

**CSV download issues:**
- Check browser popup blockers
- Ensure you have processed at least one image successfully

**Docker build failures:**
- Ensure Docker is running
- Check available disk space
- Verify Dockerfile syntax

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the AI capabilities
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Docker](https://www.docker.com/) for containerization

## 📞 Support

- 📧 Email: support@stockify.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/stockify/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/stockify/discussions)
- 📖 Documentation: [Wiki](https://github.com/yourusername/stockify/wiki)

---

**Made with ❤️ by the Stockify Team**