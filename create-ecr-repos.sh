#!/bin/bash

# Script to create ECR repositories
# Run this ONCE before pushing images

set -e

echo "========================================="
echo "Creating ECR Repositories"
echo "========================================="

AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="AKIAYJG3FLTW2W6WQE42"
export AWS_SECRET_ACCESS_KEY="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"
export AWS_DEFAULT_REGION="${AWS_REGION}"

# Repository names
REPOS=(
  "cv-service-repo"
  "server-repo"
  "client-repo"
  "email-service-repo"
  "queue-service-repo"
)

echo ""
for repo in "${REPOS[@]}"; do
  echo "Creating repository: ${repo}..."
  aws ecr create-repository \
    --repository-name ${repo} \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    2>/dev/null && echo "✓ ${repo} created" || echo "ℹ ${repo} already exists"
done

echo ""
echo "========================================="
echo "✓ ECR Repositories Ready!"
echo "========================================="
echo ""
echo "Repositories created in region: ${AWS_REGION}"
echo ""
echo "Next steps:"
echo "1. Run ./push-to-ecr.sh to build and push images"
echo "2. Copy deploy-on-ec2.sh to your EC2 instance"
echo "3. Run deploy-on-ec2.sh on EC2 to deploy"
echo ""
