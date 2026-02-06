# 🚀 Stockify Setup Guide

This guide will help you set up Stockify for development and production using Docker and GitHub.

## 📋 Prerequisites

- **Docker**: Version 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0+ (included with Docker Desktop)
- **Git**: For version control ([Install Git](https://git-scm.com/downloads))
- **Node.js**: Version 18+ (for local development) ([Install Node.js](https://nodejs.org/))

## 🐳 Docker Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stockify.git
cd stockify
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

Add your configuration (do not prefix `GEMINI_API_KEY` with `REACT_APP_`):

```env
# Google Gemini API Configuration (server-side only)
GEMINI_API_KEY=your_gemini_api_key_here

# Upstash Redis (required in production for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Optional: Enable debug mode
REACT_APP_DEBUG=false
```

### 3. Docker Commands

#### Development Mode (with hot reload)
```bash
# Start development server
docker-compose --profile dev-hot up

# Or build and run development container
docker-compose --profile dev up --build
```

#### Production Mode
```bash
# Build and run production container
docker-compose --profile prod up --build
```

#### Individual Commands
```bash
# Build development image
docker-compose --profile dev build

# Build production image
docker-compose --profile prod build

# Run specific service
docker-compose --profile dev up stockify-dev

# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v --remove-orphans
```

## 🔧 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

### 3. Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests with coverage
npm run test:coverage
```

## 🚀 GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `stockify` (or your preferred name)
3. Make it public or private as needed
4. Don't initialize with README (we already have one)

### 2. Connect Local Repository

```bash
# Add remote origin
git remote add origin https://github.com/yourusername/stockify.git

# Push to GitHub
git push -u origin main
```

### 3. Set Up GitHub Actions Secrets

Go to your repository settings and add these secrets:

- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token

### 4. Enable GitHub Actions

The CI/CD pipeline will automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## 🔒 Security Configuration

### 1. API Key Security

- Never commit API keys to the repository
- Use environment variables for sensitive data
- Rotate API keys regularly

### 2. Docker Security

- Use multi-stage builds to reduce image size
- Run containers as non-root users
- Keep base images updated

### 3. GitHub Security

- Enable branch protection rules
- Require pull request reviews
- Enable security alerts

## 📊 Monitoring and Logs

### 1. Docker Logs

```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs stockify-dev

# Follow logs in real-time
docker-compose logs -f
```

### 2. Application Logs

```bash
# View application logs
docker-compose exec stockify-dev tail -f /app/logs/app.log
```

## 🚀 Deployment Options

### 1. Docker Hub

```bash
# Build and tag image
docker build -t yourusername/stockify:latest .

# Push to Docker Hub
docker push yourusername/stockify:latest
```

### 2. Cloud Platforms

#### AWS ECS
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name stockify

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/stockify

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/stockify --platform managed
```

#### Azure Container Instances
```bash
# Create resource group
az group create --name stockify-rg --location eastus

# Deploy container
az container create --resource-group stockify-rg --name stockify --image yourusername/stockify
```

## 🔧 Troubleshooting

### Common Issues

#### Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
```

#### API Key Issues
- Verify API key is correct
- Check environment variables are loaded
- Ensure API key has proper permissions

### Getting Help

1. Check the [Issues](https://github.com/yourusername/stockify/issues) page
2. Create a new issue with detailed information
3. Join our [Discussions](https://github.com/yourusername/stockify/discussions)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Next Steps

1. **Set up your environment** using this guide
2. **Configure your API keys** for Gemini
3. **Test the application** with sample images
4. **Customize the platform** for your needs
5. **Deploy to production** using your preferred method

---

**Need help?** Check our [FAQ](FAQ.md) or [create an issue](https://github.com/yourusername/stockify/issues/new).
