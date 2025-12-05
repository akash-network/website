# Docker Setup for Akash Network Website

This guide explains how to run the Akash Network website in Docker for testing and sharing.

## Quick Start

### Development Mode (with hot reload)

```bash
# Using docker-compose (recommended)
docker-compose up

# Or using Docker directly
docker build -f Dockerfile.dev -t akash-website:dev .
docker run -p 4321:4321 -v $(pwd):/app akash-website:dev
```

The website will be available at `http://localhost:4321`

### Production Mode

```bash
# Build the production image
docker build -t akash-website:prod .

# Run the production server
docker run -p 4321:4321 akash-website:prod
```

## Sharing for Testing

### Option 1: Export Docker Image

```bash
# Build the image
docker build -t akash-website:latest .

# Save the image to a file
docker save akash-website:latest | gzip > akash-website.tar.gz

# Share the file, then recipient can load it:
docker load < akash-website.tar.gz
docker run -p 4321:4321 akash-website:latest
```

### Option 2: Push to Docker Hub

```bash
# Tag the image
docker tag akash-website:latest yourusername/akash-website:latest

# Push to Docker Hub
docker push yourusername/akash-website:latest

# Recipient can pull and run:
docker pull yourusername/akash-website:latest
docker run -p 4321:4321 yourusername/akash-website:latest
```

### Option 3: Use docker-compose

Share the entire repository with `docker-compose.yml`. Recipient can run:

```bash
docker-compose up
```

## Environment Variables

If you need to set environment variables, create a `.env` file or use:

```bash
docker run -p 4321:4321 --env-file .env akash-website:dev
```

## Troubleshooting

- **Port already in use**: Change the port mapping: `-p 8080:4321`
- **Hot reload not working**: Ensure volumes are mounted correctly in docker-compose
- **Build fails**: Make sure all dependencies are in `package.json`

