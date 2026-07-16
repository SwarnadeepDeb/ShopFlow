.PHONY: install install-prometheus install-efk install-jaeger uninstall \
        port-forward-grafana port-forward-prometheus port-forward-kibana port-forward-jaeger \
        apply-rules status

## ── Full Stack ────────────────────────────────────────────────────────────────

install: ## Install the complete observability stack
	@bash install.sh

## ── Individual Components ─────────────────────────────────────────────────────

install-prometheus: ## Install Prometheus + Grafana + AlertManager
	kubectl apply -f prometheus/namespace.yaml
	helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
	  --namespace monitoring \
	  --values prometheus/values.yaml \
	  --wait --timeout 10m
	kubectl apply -f prometheus/rules/service-alerts.yaml
	kubectl apply -f prometheus/rules/infra-alerts.yaml
	kubectl apply -f grafana/dashboards/configmap.yaml
	@echo "Prometheus stack installed."

install-efk: ## Install Elasticsearch + Fluentd + Kibana
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
	helm upgrade --install kibana elastic/kibana \
	  --namespace logging \
	  --values efk/kibana/values.yaml \
	  --no-hooks \
	  --wait
	@echo "EFK stack installed."

install-jaeger: ## Install Jaeger + OTel Collector
	helm upgrade --install jaeger jaegertracing/jaeger \
	  --namespace tracing \
	  --create-namespace \
	  --values jaeger/values.yaml \
	  --wait
	kubectl apply -f jaeger/otel-collector-config.yaml
	helm upgrade --install opentelemetry-operator open-telemetry/opentelemetry-operator \
	  --namespace tracing \
	  --values jaeger/opentelemetry-operator-values.yaml \
	  --wait
	kubectl apply -f jaeger/otel-instrumentation.yaml
	@echo "Jaeger + OTel Collector installed."

## ── Alert Rules ──────────────────────────────────────────────────────────────

apply-rules: ## Apply custom PrometheusRules
	kubectl apply -f prometheus/rules/service-alerts.yaml
	kubectl apply -f prometheus/rules/infra-alerts.yaml
	@echo "Alert rules applied."

## ── Port Forwarding ──────────────────────────────────────────────────────────

port-forward-grafana: ## Open Grafana on http://localhost:3000
	@echo "Grafana: http://localhost:3000  (admin / ShopFlow@Grafana2024!)"
	kubectl port-forward svc/kube-prometheus-stack-grafana 3000:80 -n monitoring

port-forward-prometheus: ## Open Prometheus on http://localhost:9090
	@echo "Prometheus: http://localhost:9090"
	kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring

port-forward-kibana: ## Open Kibana on http://localhost:5601
	@echo "Kibana: http://localhost:5601"
	kubectl port-forward svc/kibana-kibana 5601:5601 -n logging

port-forward-jaeger: ## Open Jaeger on http://localhost:16686
	@echo "Jaeger: http://localhost:16686"
	kubectl port-forward svc/jaeger-all-in-one 16686:16686 -n tracing

## ── Status ───────────────────────────────────────────────────────────────────

status: ## Show pod status for all observability namespaces
	@echo "\n=== Monitoring (Prometheus + Grafana) ==="
	kubectl get pods -n monitoring
	@echo "\n=== Logging (EFK) ==="
	kubectl get pods -n logging
	@echo "\n=== Tracing (Jaeger) ==="
	kubectl get pods -n tracing

## ── Uninstall ────────────────────────────────────────────────────────────────

uninstall: ## Remove all observability components (WARNING: deletes PVCs)
	@echo "This will delete all monitoring data. Press Ctrl+C to cancel, Enter to continue."
	@read _confirm
	helm uninstall kube-prometheus-stack -n monitoring || true
	helm uninstall kibana -n logging || true
	helm uninstall fluentd -n logging || true
	helm uninstall elasticsearch -n logging || true
	helm uninstall jaeger -n tracing || true
	kubectl delete -f jaeger/otel-collector-config.yaml || true
	kubectl delete namespace monitoring logging tracing || true
	@echo "Observability stack removed."

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-28s\033[0m %s\n", $$1, $$2}'
