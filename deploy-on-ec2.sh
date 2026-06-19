#!/bin/bash

# Script to pull Docker images from ECR and run on EC2
# Run this on your EC2 instance

set -e  # Exit on error

echo "========================================="
echo "Deploying Smart Job Portal on EC2"
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

# AWS Credentials
export AWS_ACCESS_KEY_ID="AKIAYJG3FLTW2W6WQE42"
export AWS_SECRET_ACCESS_KEY="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"
export AWS_DEFAULT_REGION="${AWS_REGION}"

echo ""
echo "Step 1: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    sudo yum update -y
    sudo yum install docker -y
    sudo service docker start
    sudo usermod -a -G docker $USER
    echo "Docker installed. Please log out and log back in, then run this script again."
    exit 0
fi
echo "✓ Docker is installed"

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
echo "Step 3: Pulling images from ECR..."

# Pull CV Service
echo "Pulling CV Evaluation Service..."
docker pull ${ECR_REGISTRY}/${CV_SERVICE_REPO}:latest
echo "✓ CV Evaluation Service pulled"

# Pull Server
echo "Pulling Server..."
docker pull ${ECR_REGISTRY}/${SERVER_REPO}:latest
echo "✓ Server pulled"

# Pull Client
echo "Pulling Client..."
docker pull ${ECR_REGISTRY}/${CLIENT_REPO}:latest
echo "✓ Client pulled"

# Pull Email Service
echo "Pulling Email Service..."
docker pull ${ECR_REGISTRY}/${EMAIL_SERVICE_REPO}:latest
echo "✓ Email Service pulled"

# Pull Queue Service
echo "Pulling Queue Service..."
docker pull ${ECR_REGISTRY}/${QUEUE_SERVICE_REPO}:latest
echo "✓ Queue Service pulled"

echo ""
echo "Step 4: Stopping and removing old containers..."
docker stop smart-job-portal-cv-evaluation 2>/dev/null || true
docker stop smart-job-portal-server 2>/dev/null || true
docker stop smart-job-portal-client 2>/dev/null || true
docker stop smart-job-portal-email-service 2>/dev/null || true
docker stop smart-job-portal-queue-service 2>/dev/null || true

docker rm smart-job-portal-cv-evaluation 2>/dev/null || true
docker rm smart-job-portal-server 2>/dev/null || true
docker rm smart-job-portal-client 2>/dev/null || true
docker rm smart-job-portal-email-service 2>/dev/null || true
docker rm smart-job-portal-queue-service 2>/dev/null || true

echo "✓ Old containers removed"

echo ""
echo "Step 5: Creating Docker network..."
docker network create smart-job-network 2>/dev/null || echo "Network already exists"

echo ""
echo "Step 6: Starting containers..."

# Start Queue Service (no dependencies)
echo ""
echo "Starting Queue Service..."
docker run -d \
  --name smart-job-portal-queue-service \
  --restart unless-stopped \
  --network smart-job-network \
  -p 8083:8081 \
  -e NODE_ENV=production \
  -e PORT=8081 \
  -e RABBITMQ_URL="amqps://admin:cvService@123@b-fd89573e-a7f7-4a84-a737-1bb91e71ae62.mq.us-east-1.on.aws:5671" \
  -e CV_EVAL_QUEUE=cv-evaluation-queue \
  -e RESULT_QUEUE=cv-evaluation-results \
  -e EMAIL_QUEUE=email-notification-queue \
  ${ECR_REGISTRY}/${QUEUE_SERVICE_REPO}:latest
echo "✓ Queue Service started"

# Start CV Evaluation Service
echo ""
echo "Starting CV Evaluation Service..."
docker run -d \
  --name smart-job-portal-cv-evaluation \
  --restart unless-stopped \
  --network smart-job-network \
  -p 8081:8081 \
  -e NODE_ENV=production \
  -e PORT=8081 \
  -e SERVICE_NAME=cv-evaluation-service \
  -e DB="mongodb+srv://rayanshashmin:85lQKnXqvslKcjaS@cluster0.teris.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" \
  -e RABBITMQ_URL="amqps://admin:cvService@123@b-fd89573e-a7f7-4a84-a737-1bb91e71ae62.mq.us-east-1.on.aws:5671" \
  -e CV_EVAL_QUEUE=cv-evaluation-queue \
  -e RESULT_QUEUE=cv-evaluation-results \
  -e GEMINI_API_KEY=AIzaSyA8NCybBxHplYNpdq5nLTdPORoV3vXlyd8 \
  -e AWS_ACCESS_KEY_ID=AKIAYJG3FLTW2W6WQE42 \
  -e AWS_SECRET_ACCESS_KEY=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 \
  -e AWS_REGION=eu-north-1 \
  -e AWS_S3_BUCKET_NAME=cv-grade \
  -e QUEUE_SERVICE_URL=http://queue-service:8081 \
  -e MAIN_BACKEND_URL=http://server:8080 \
  ${ECR_REGISTRY}/${CV_SERVICE_REPO}:latest
echo "✓ CV Evaluation Service started"

# Start Email Service
echo ""
echo "Starting Email Service..."
docker run -d \
  --name smart-job-portal-email-service \
  --restart unless-stopped \
  --network smart-job-network \
  -p 8082:8082 \
  -e NODE_ENV=production \
  -e PORT=8082 \
  -e SERVICE_NAME=email-notification-service \
  -e DB="mongodb+srv://rayanshashmin:85lQKnXqvslKcjaS@cluster0.teris.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" \
  -e RABBITMQ_URL="amqps://admin:cvService@123@b-fd89573e-a7f7-4a84-a737-1bb91e71ae62.mq.us-east-1.on.aws:5671" \
  -e RESULT_QUEUE=cv-evaluation-results \
  -e EMAIL_QUEUE=email-notification-queue \
  -e EMAIL_HOST=smtp.gmail.com \
  -e EMAIL_PORT=587 \
  -e EMAIL_SECURE=false \
  -e EMAIL_USER=priyanthiliyanage321@gmail.com \
  -e EMAIL_PASS=bhqpyhuwdlmnvksr \
  -e EMAIL_FROM="AI Recruit priyanthiliyanage321@gmail.com" \
  -e EMAIL_FROM_NAME="Smart Job Portal" \
  -e FRONTEND_URL=http://34.228.66.116:3000 \
  ${ECR_REGISTRY}/${EMAIL_SERVICE_REPO}:latest
echo "✓ Email Service started"

# Start Server
echo ""
echo "Starting Server..."
docker run -d \
  --name smart-job-portal-server \
  --restart unless-stopped \
  --network smart-job-network \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DB="mongodb+srv://rayanshashmin:85lQKnXqvslKcjaS@cluster0.teris.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" \
  -e JWTPRIVATEKEY=a7d1eabd715aae5b7435cde3f0916fffca22ea96f4d68db432c53f44f7dd1ced885db9bad86a9b43dfb6c1eee51f04b6dd47573adce55c545fa0128b975b4f70 \
  -e SALT=10 \
  -e AWS_ACCESS_KEY_ID=AKIAYJG3FLTW2W6WQE42 \
  -e AWS_SECRET_ACCESS_KEY=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 \
  -e AWS_REGION=eu-north-1 \
  -e AWS_S3_BUCKET_NAME=cv-grade \
  -e GEMINI_API_KEY=AIzaSyA8NCybBxHplYNpdq5nLTdPORoV3vXlyd8 \
  -e GEMINI_CHATBOT_API_KEY=AIzaSyAkj3kXUWce_YWpwfJ8RGv-U6I9s1oI0Y0 \
  -e FRONTEND_URL=http://34.228.66.116:3000 \
  -e RABBITMQ_URL="amqps://admin:cvService@123@b-fd89573e-a7f7-4a84-a737-1bb91e71ae62.mq.us-east-1.on.aws:5671" \
  -e CV_EVAL_QUEUE=cv-evaluation-queue \
  -e RESULT_QUEUE=cv-evaluation-results \
  -e CV_EVAL_SERVICE_URL=http://cv-evaluation:8081 \
  -e QUEUE_SERVICE_URL=http://queue-service:8081 \
  ${ECR_REGISTRY}/${SERVER_REPO}:latest
echo "✓ Server started"

# Start Client
echo ""
echo "Starting Client..."
docker run -d \
  --name smart-job-portal-client \
  --restart unless-stopped \
  --network smart-job-network \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_BASE_URL=http://34.228.66.116:8080 \
  -e NEXT_AWS_ACCESS_KEY_ID=AKIAYJG3FLTW2W6WQE42 \
  -e NEXT_AWS_SECRET_ACCESS_KEY=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 \
  -e NEXT_AWS_REGION=eu-north-1 \
  -e NEXT_AWS_S3_BUCKET_NAME=cv-grade \
  -e GEMINI_CHATBOT_API_KEY=AIzaSyAkj3kXUWce_YWpwfJ8RGv-U6I9s1oI0Y0 \
  ${ECR_REGISTRY}/${CLIENT_REPO}:latest
echo "✓ Client started"

echo ""
echo "Step 7: Verifying containers..."
sleep 5
docker ps --filter "name=smart-job-portal"

echo ""
echo "========================================="
echo "✓ Deployment Complete!"
echo "========================================="
echo ""
echo "Services running:"
echo "- Client:          http://localhost:3000"
echo "- Server:          http://localhost:8080"
echo "- CV Service:      http://localhost:8081"
echo "- Email Service:   http://localhost:8082"
echo "- Queue Service:   http://localhost:8083"
echo ""
echo "To view logs:"
echo "  docker logs smart-job-portal-server"
echo "  docker logs smart-job-portal-cv-evaluation"
echo "  docker logs smart-job-portal-client"
echo "  docker logs smart-job-portal-email-service"
echo "  docker logs smart-job-portal-queue-service"
echo ""
echo "To stop all services:"
echo "  docker stop smart-job-portal-server smart-job-portal-cv-evaluation smart-job-portal-client smart-job-portal-email-service smart-job-portal-queue-service"
echo ""
