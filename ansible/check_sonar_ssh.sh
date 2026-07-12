#!/bin/bash
set -e
cd "/mnt/d/Devops Project/infrastructure/terraform/environments/dev"
export SONAR_IP=$(terraform output -raw sonarqube_url | sed -E 's|https?://||; s|:.*||')
echo "SONAR_IP=$SONAR_IP"
ssh -o StrictHostKeyChecking=accept-new -i ~/.ssh/shopflow-key ubuntu@$SONAR_IP "echo connected"
