#!/bin/bash
export AWS_PROFILE=local
for repo in shopflow/frontend shopflow/notification-service shopflow/order-service shopflow/product-service shopflow/user-service; do
  echo "=== $repo ==="
  aws ecr describe-images --repository-name "$repo" --region us-east-1 --query 'imageDetails[].imageTags' --output text 2>&1
done
