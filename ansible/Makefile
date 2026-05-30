.PHONY: all sonarqube ping install-requirements lint check

# Install required Ansible collections
install-requirements:
	ansible-galaxy collection install amazon.aws community.general community.postgresql

# Test connectivity to all hosts
ping:
	ansible all -m ping

# Provision everything
all:
	ansible-playbook playbooks/site.yml

# Provision SonarQube only
sonarqube:
	ansible-playbook playbooks/sonarqube.yml

# Provision SonarQube with static inventory
sonarqube-static:
	ansible-playbook playbooks/sonarqube.yml -i inventory/hosts.ini

# Dry run (check mode) — no changes applied
check:
	ansible-playbook playbooks/site.yml --check --diff

# Lint all playbooks and roles
lint:
	ansible-lint playbooks/site.yml

# Show dynamic inventory (debug)
inventory:
	ansible-inventory --list | jq .

# Run a specific tag only — e.g. make tag TAG=docker
tag:
	ansible-playbook playbooks/site.yml --tags $(TAG)
