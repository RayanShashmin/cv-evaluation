#!/bin/bash

# Script to build Docker images and push to AWS ECR
# Run this from your local machine

set -e  # Exit on error

echo "========================================="
echo "Building and Pushing Images to ECR"
echo "========================================="

# AWS Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="569542794477"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# ECR Repository Names
CV_SERVICE_REPO="cv-service-repo"
SERVER_REPO="server-repo"
CLIENT_REPO="client-repo"
EMAIL_SERVICE_REPO="email-service-repo"
QUEUE_SERVICE_REPO="queue-service-repo"

# AWS Credentials (from your docker-compose.yml)
export AWS_ACCESS_KEY_ID="AKIAYJG3FLTW2W6WQE42"
export AWS_SECRET_ACCESS_KEY="fV9to/cuiIlrr0jkX6dhMlBWrXWkofw4e7Pw0q9b"
export AWS_DEFAULT_REGION="${AWS_REGION}"

echo ""
echo "Step 1: Checking prerequisites..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "✗ AWS CLI is not installed!"
    echo ""
    echo "Please install AWS CLI first:"
    echo ""
    echo "For macOS:"
    echo "  brew install awscli"
    echo ""
    echo "For Linux:"
    echo "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "  unzip awscliv2.zip"
    echo "  sudo ./aws/install"
    echo ""
    echo "For Windows:"
    echo "  Download from: https://awscli.amazonaws.com/AWSCLIV2.msi"
    echo ""
    exit 1
fi
echo "✓ AWS CLI is installed"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "✗ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo "✓ Docker is running"

echo ""
echo "Step 2: Authenticating Docker with ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

if [ $? -eq 0 ]; then
    echo "✓ Successfully authenticated with ECR"
else
    echo "✗ Failed to authenticate with ECR"
    exit 1
fi

echo ""
echo "Step 3: Setting up multi-platform builder..."
# Create and use a new builder instance that supports multi-platform builds
docker buildx create --name multiplatform-builder --use 2>/dev/null || docker buildx use multiplatform-builder
echo "✓ Multi-platform builder ready"

echo ""
echo "Step 4: Building and pushing Docker images for linux/amd64..."
echo "Note: Building for AMD64 to ensure EC2 compatibility"

# Build and Push CV Evaluation Service
echo ""
echo "Building and pushing CV Evaluation Service..."
cd cv-evaluation
docker buildx build \
  --platform linux/amd64 \
  -t ${ECR_REGISTRY}/${CV_SERVICE_REPO}:latest \
  --push \
  .
cd ..
echo "✓ CV Evaluation Service built and pushed"

# Build and Push Server
echo ""
echo "Building and pushing Server..."
cd server
docker buildx build \
  --platform linux/amd64 \
  -t ${ECR_REGISTRY}/${SERVER_REPO}:latest \
  --push \
  .
cd ..
echo "✓ Server built and pushed"

# Build and Push Client (optimized)
echo ""
echo "Building and pushing Client (this may take 3-5 minutes)..."
cd client
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://34.228.66.116:8080 \
  -t ${ECR_REGISTRY}/${CLIENT_REPO}:latest \
  --progress=plain \
  --push \
  .
cd ..
echo "✓ Client built and pushed"

# Build and Push Email Service
echo ""
echo "Building and pushing Email Service..."
cd email-service
docker buildx build \
  --platform linux/amd64 \
  -t ${ECR_REGISTRY}/${EMAIL_SERVICE_REPO}:latest \
  --push \
  .
cd ..
echo "✓ Email Service built and pushed"

# Build and Push Queue Service
echo ""
echo "Building and pushing Queue Service..."
cd queue-service
docker buildx build \
  --platform linux/amd64 \
  -t ${ECR_REGISTRY}/${QUEUE_SERVICE_REPO}:latest \
  --push \
  .
cd ..
echo "✓ Queue Service built and pushed"

echo ""
echo "========================================="
echo "✓ All images successfully built and pushed to ECR!"
echo "========================================="
echo ""
echo "Images pushed:"
echo "- ${ECR_REGISTRY}/${CV_SERVICE_REPO}:latest"
echo "- ${ECR_REGISTRY}/${SERVER_REPO}:latest"
echo "- ${ECR_REGISTRY}/${CLIENT_REPO}:latest"
echo "- ${ECR_REGISTRY}/${EMAIL_SERVICE_REPO}:latest"
echo "- ${ECR_REGISTRY}/${QUEUE_SERVICE_REPO}:latest"
echo ""
