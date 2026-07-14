#!/bin/bash
# Installs the full observability stack on EKS
# Prometheus + Grafana | EFK | Jaeger + OpenTelemetry
set -euo pipefail

echo "==> Adding Helm repositories"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add elastic              https://helm.elastic.co
helm repo add fluent               https://fluent.github.io/helm-charts
helm repo add jaegertracing        https://jaegertracing.github.io/helm-charts
helm repo add open-telemetry       https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

echo ""
echo "==> [1/4] Installing Prometheus + Grafana + AlertManager"
kubectl apply -f prometheus/namespace.yaml
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --values prometheus/values.yaml \
  --wait --timeout 10m

echo ""
echo "==> [2/4] Installing EFK Stack (Elasticsearch + Fluentd + Kibana)"
kubectl apply -f efk/namespace.yaml

helm upgrade --install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --values efk/elasticsearch/values.yaml \
  --wait --timeout 10m

kubectl apply -f efk/fluentd/fluentd-configmap.yaml

helm upgrade --install fluentd fluent/fluentd \
  --namespace logging \
  --values efk/fluentd/values.yaml \
  --wait

kubectl apply -f efk/kibana/dummy-secrets.yaml

# --no-hooks: the chart's pre-install token-creation job hardcodes an https
# request to Elasticsearch with no way to configure http, so it can never
# succeed against our plain-HTTP ES. See efk/kibana/dummy-secrets.yaml for
# the placeholder secrets that replace what that hook would have created.
helm upgrade --install kibana elastic/kibana \
  --namespace logging \
  --values efk/kibana/values.yaml \
  --no-hooks \
  --wait

echo ""
echo "==> [3/4] Installing Jaeger"
helm upgrade --install jaeger jaegertracing/jaeger \
  --namespace tracing \
  --create-namespace \
  --values jaeger/values.yaml \
  --wait

echo ""
echo "==> [4/4] Installing OpenTelemetry Collector"
kubectl apply -f jaeger/otel-collector-config.yaml
kubectl apply -f jaeger/otel-instrumentation.yaml

echo ""
echo "========================================================"
echo " Observability stack installed!"
echo "========================================================"
echo ""
echo " Grafana    : kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring"
echo "              URL: http://localhost:3000 | admin / ShopFlow@Grafana2024!"
echo ""
echo " Prometheus : kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring"
echo ""
echo " Kibana     : kubectl port-forward svc/kibana-kibana 5601:5601 -n logging"
echo ""
echo " Jaeger     : kubectl port-forward svc/jaeger-query 16686:16686 -n tracing"
echo "========================================================"
