#!/bin/bash
set -e
export AWS_PROFILE=local
cd "/mnt/d/Devops Project/infrastructure/terraform/environments/dev"
echo "RDS_HOST=$(terraform output -raw db_host)"
echo "EKS_CLUSTER=$(terraform output -raw eks_cluster_name)"
echo "SONAR_URL=$(terraform output -raw sonarqube_url)"
