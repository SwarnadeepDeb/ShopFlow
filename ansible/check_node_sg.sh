#!/bin/bash
set -e
export AWS_PROFILE=local
echo "=== Running instances and their security groups ==="
aws ec2 describe-instances \
  --filters Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].{ID:InstanceId,SGs:SecurityGroups[].GroupId,Name:Tags[?Key==`Name`]|[0].Value}' \
  --output table
echo "=== nodes-sg ID from terraform-managed security group ==="
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=shopflow-dev-eks-nodes-sg \
  --query 'SecurityGroups[0].GroupId' --output text
