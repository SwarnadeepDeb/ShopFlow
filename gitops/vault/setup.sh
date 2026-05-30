#!/bin/bash
# Configures Vault: KV secrets, Kubernetes auth, policies, and roles
# Prerequisite: kubectl port-forward vault-0 -n vault 8200:8200 must be running
set -euo pipefail

export VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
export VAULT_TOKEN="${VAULT_TOKEN:-root}"

EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-shopflow-dev-eks}"
NAMESPACE="shopflow"

echo "==> Enabling KV v2 secrets engine"
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "Already enabled"

echo "==> Storing secrets for each service"

vault kv put secret/shopflow/user-service \
  db_password="ShopFlow@DB2024!" \
  jwt_secret="super-secret-jwt-key-change-in-prod"

vault kv put secret/shopflow/product-service \
  db_password="ShopFlow@DB2024!"

vault kv put secret/shopflow/order-service \
  db_password="ShopFlow@DB2024!"

vault kv put secret/shopflow/notification-service \
  db_password="ShopFlow@DB2024!"

echo "==> Writing Vault policies"
vault policy write shopflow-user-service - <<EOF
path "secret/data/shopflow/user-service" {
  capabilities = ["read"]
}
EOF

vault policy write shopflow-product-service - <<EOF
path "secret/data/shopflow/product-service" {
  capabilities = ["read"]
}
EOF

vault policy write shopflow-order-service - <<EOF
path "secret/data/shopflow/order-service" {
  capabilities = ["read"]
}
EOF

vault policy write shopflow-notification-service - <<EOF
path "secret/data/shopflow/notification-service" {
  capabilities = ["read"]
}
EOF

echo "==> Enabling Kubernetes auth method"
vault auth enable kubernetes 2>/dev/null || echo "Already enabled"

echo "==> Configuring Kubernetes auth (reads SA token from pod)"
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc:443"

echo "==> Creating roles — each binds a K8s ServiceAccount to a Vault policy"
for SERVICE in user-service product-service order-service notification-service; do
  vault write auth/kubernetes/role/${SERVICE} \
    bound_service_account_names=${SERVICE} \
    bound_service_account_namespaces=${NAMESPACE} \
    policies=shopflow-${SERVICE} \
    ttl=1h
  echo "  Created role: ${SERVICE}"
done

echo ""
echo "Vault setup complete!"
echo "  Secrets engine : secret/ (KV v2)"
echo "  Kubernetes auth: enabled"
echo "  Roles created  : user-service, product-service, order-service, notification-service"
echo ""
echo "Test a secret read:"
echo "  vault kv get secret/shopflow/user-service"
