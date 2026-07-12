#!/bin/bash
# Installs ArgoCD on EKS and configures initial access
# Run: chmod +x install.sh && ./install.sh
#
set -euo pipefail

ARGOCD_VERSION="v2.10.0"
NAMESPACE="argocd"

echo "==> Creating ArgoCD namespace"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "==> Installing ArgoCD ${ARGOCD_VERSION}"
kubectl apply -n ${NAMESPACE} \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml

echo "==> Waiting for ArgoCD to be ready"
kubectl wait --for=condition=available deployment/argocd-server \
  -n ${NAMESPACE} --timeout=300s

echo "==> Fetching initial admin password"
ARGOCD_PASSWORD=$(kubectl -n ${NAMESPACE} get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d)
echo "ArgoCD admin password: ${ARGOCD_PASSWORD}"

echo "==> Port-forwarding ArgoCD UI (background)"
kubectl port-forward svc/argocd-server -n ${NAMESPACE} 8443:443 &
PF_PID=$!
sleep 3

echo "==> Logging in via argocd CLI"
argocd login localhost:8443 \
  --username admin \
  --password "${ARGOCD_PASSWORD}" \
  --insecure

echo "==> Applying ArgoCD Project"
kubectl apply -f argocd-project.yaml

echo "==> Applying App of Apps (root application)"
kubectl apply -f app-of-apps.yaml

echo ""
echo "ArgoCD is ready!"
echo "  URL      : https://localhost:8443"
echo "  Username : admin"
echo "  Password : ${ARGOCD_PASSWORD}"
echo ""
echo "Change the password with:"
echo "  argocd account update-password"

kill ${PF_PID} 2>/dev/null || true
