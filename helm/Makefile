.PHONY: lint template deploy-dev deploy-prod diff status rollback

ENV ?= dev

# Lint all charts
lint:
	@for chart in charts/*/; do \
		echo "Linting $$chart..."; \
		helm lint $$chart; \
	done

# Render templates locally (dry run)
template:
	helmfile -e $(ENV) template

# Deploy all services to dev
deploy-dev:
	helmfile -e dev sync

# Deploy all services to prod (with confirmation)
deploy-prod:
	@read -p "Deploy to PROD? [y/N] " ans; [ "$$ans" = "y" ] || exit 1
	helmfile -e prod sync

# Show diff before applying
diff:
	helmfile -e $(ENV) diff

# Deploy a single service: make deploy-one SVC=user-service
deploy-one:
	helmfile -e $(ENV) -l name=$(SVC) sync

# Show all release statuses
status:
	helm list -n shopflow

# Rollback a service: make rollback SVC=user-service REV=1
rollback:
	helm rollback $(SVC) $(REV) -n shopflow

# Uninstall all releases
destroy:
	helmfile -e $(ENV) destroy
