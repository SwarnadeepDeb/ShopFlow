#!/bin/bash
set -e
cd "/mnt/d/Devops Project/ansible"
export AWS_PROFILE=local
export ANSIBLE_ROLES_PATH="/mnt/d/Devops Project/ansible/roles"
export ANSIBLE_INVENTORY="/mnt/d/Devops Project/ansible/inventory/aws_ec2.yml"
export ANSIBLE_REMOTE_USER=ubuntu
export ANSIBLE_PRIVATE_KEY_FILE="$HOME/.ssh/shopflow-key.pem"
export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_BECOME=True
export ANSIBLE_BECOME_METHOD=sudo
ansible-playbook playbooks/sonarqube.yml --vault-password-file /tmp/vault_pass.txt "$@"
