#!/bin/bash
set -e
cd "/mnt/d/Devops Project/ansible"
DB_PASS=$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24)
VAULT_PASS=$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24)
cat > group_vars/vault.yml <<EOF
---
vault_sonarqube_db_password: "$DB_PASS"
EOF
echo "$VAULT_PASS" > /tmp/vault_pass.txt
ansible-vault encrypt group_vars/vault.yml --vault-password-file /tmp/vault_pass.txt
echo "DB_PASSWORD=$DB_PASS"
echo "VAULT_PASSWORD=$VAULT_PASS"
