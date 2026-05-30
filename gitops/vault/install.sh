#!/bin/bash
# Installs HashiCorp Vault on EKS using Helm
set -euo pipefail

VAULT_VERSION="0.27.0"
NAMESPACE="vault"

echo "==> Adding HashiCorp Helm repository"
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update

echo "==> Creating Vault namespace"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "==> Installing Vault ${VAULT_VERSION} (dev mode for demo)"
helm upgrade --install vault hashicorp/vault \
  --namespace ${NAMESPACE} \
  --version ${VAULT_VERSION} \
  --set server.dev.enabled=true \
  --set injector.enabled=true \
  --wait

echo "==> Waiting for Vault pod to be ready"
kubectl wait --for=condition=ready pod/vault-0 \
  -n ${NAMESPACE} --timeout=120s

echo "==> Vault is running in dev mode (root token: root)"
echo "    Port-forward: kubectl port-forward vault-0 -n vault 8200:8200"
echo "    Export:       export VAULT_ADDR=http://localhost:8200"
echo "    Export:       export VAULT_TOKEN=root"
echo ""
echo "==> Running Vault setup script..."
sleep 5
./setup.sh
