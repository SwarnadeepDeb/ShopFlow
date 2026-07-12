#!/bin/bash
set -e
export AWS_PROFILE=local
cd "/mnt/d/Devops Project/infrastructure/terraform/environments/dev"
terraform apply -auto-approve
