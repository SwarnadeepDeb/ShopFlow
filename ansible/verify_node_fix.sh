#!/bin/bash
set -e
export AWS_PROFILE=local
echo "=== New node instances and their security groups ==="
aws ec2 describe-instances \
  --filters Name=instance-state-name,Values=running Name=tag:eks:nodegroup-name,Values=shopflow-dev-eks-nodes \
  --query 'Reservations[].Instances[].{ID:InstanceId,SGs:SecurityGroups[].GroupId}' \
  --output table
echo "=== kubectl get nodes ==="
kubectl get nodes -o wide
