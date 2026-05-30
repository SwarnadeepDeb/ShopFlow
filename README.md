# ShopFlow — Cloud-Native E-Commerce Platform

A production-grade e-commerce microservices application built to demonstrate a complete DevOps lifecycle: local development → automated CI/CD → cloud infrastructure → GitOps deployment → full-stack observability.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Infrastructure (Terraform)](#infrastructure-terraform)
- [Configuration Management (Ansible)](#configuration-management-ansible)
- [Kubernetes & GitOps (Helm + ArgoCD)](#kubernetes--gitops-helm--argocd)
- [Observability](#observability)
- [GitHub Actions Secrets](#github-actions-secrets)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router, Axios |
| **Services** | Node.js, Express 4, PostgreSQL (pg) |
| **Auth** | JWT, bcryptjs |
| **API Gateway** | Nginx |
| **Containerization** | Docker, Docker Compose |
| **Container Registry** | AWS ECR |
| **Orchestration** | Kubernetes (AWS EKS 1.29) |
| **Package Manager** | Helm |
| **GitOps** | ArgoCD (App of Apps pattern) |
| **CI/CD** | GitHub Actions |
| **Code Quality** | SonarQube |
| **Security Scanning** | Trivy (images + IaC) |
| **Infrastructure** | Terraform (VPC, EKS, RDS, ECR) |
| **Config Management** | Ansible |
| **Metrics** | Prometheus, Grafana, prom-client |
| **Tracing** | Jaeger, OpenTelemetry |
| **Logging** | Elasticsearch, Fluentd, Kibana (EFK) |
| **Secrets** | HashiCorp Vault (Kubernetes), Ansible Vault |

---

## Project Structure

```
shopflow/
├── .github/
│   ├── workflows/
│   │   ├── reusable-service-ci.yml      # Shared CI logic for all services
│   │   ├── ci-user-service.yml
│   │   ├── ci-product-service.yml
│   │   ├── ci-order-service.yml
│   │   ├── ci-notification-service.yml
│   │   ├── ci-frontend.yml
│   │   └── terraform-plan.yml           # Plan + comment on PR
│   └── SECRETS.md                       # Required GitHub secrets reference
│
├── services/
│   ├── user-service/        # Auth & user management  (port 3001)
│   ├── product-service/     # Product catalog          (port 3002)
│   ├── order-service/       # Order management         (port 3003)
│   └── notification-service/# User notifications       (port 3004)
│
├── frontend/                # React + Vite SPA         (port 80)
├── api-gateway/             # Nginx reverse proxy      (port 8080)
│
├── infrastructure/
│   └── terraform/
│       ├── modules/
│       │   ├── vpc/         # VPC, subnets, NAT, IGW
│       │   ├── eks/         # EKS cluster + node groups + IRSA
│       │   ├── rds/         # PostgreSQL RDS (private subnet)
│       │   ├── ecr/         # ECR repos for all 5 images
│       │   └── ci-servers/  # SonarQube EC2 + security groups
│       └── environments/
│           ├── dev/
│           └── prod/
│
├── ansible/
│   ├── playbooks/
│   │   ├── site.yml         # Master playbook
│   │   └── sonarqube.yml
│   ├── roles/
│   │   ├── common/          # Base OS setup, SSH hardening, UFW
│   │   ├── docker/          # Docker CE + daemon config
│   │   └── sonarqube/       # SonarQube + PostgreSQL
│   ├── group_vars/
│   │   ├── sonarqube.yml
│   │   └── vault.yml        # gitignored — create from vault.yml.example
│   └── inventory/
│       └── hosts.ini
│
├── helm/
│   └── charts/
│       ├── user-service/
│       ├── product-service/
│       ├── order-service/
│       ├── notification-service/
│       └── frontend/
│
├── gitops/
│   ├── argocd/
│   │   ├── app-of-apps.yaml      # Root ArgoCD application
│   │   ├── argocd-project.yaml
│   │   └── applications/
│   │       └── applicationset.yaml
│   └── vault/
│       └── vault-injector-example.yaml
│
├── monitoring/
│   ├── prometheus/          # kube-prometheus-stack + alert rules
│   ├── efk/                 # Elasticsearch + Fluentd + Kibana
│   └── jaeger/              # Jaeger + OpenTelemetry Collector
│
├── docker-compose.yml       # Full local stack
├── init.sql                 # Database schema + seed data
├── .env.example             # Copy to .env for docker-compose
└── .trivyignore
```

---

## Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20](https://nodejs.org/) (for running services individually)
- [Git](https://git-scm.com/)

### 1. Clone and configure environment

```bash
git clone https://github.com/<your-org>/shopflow.git
cd shopflow

# Set up root env (PostgreSQL password for docker-compose)
cp .env.example .env
# Edit .env and set POSTGRES_PASSWORD

# Set up each service env
for svc in user-service product-service order-service notification-service; do
  cp services/$svc/.env.example services/$svc/.env
  # Edit each .env and set DB_PASSWORD to match POSTGRES_PASSWORD above
done
```

### 2. Start the full stack

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| API Gateway | http://localhost:8080 |
| User Service | http://localhost:3001 |
| Product Service | http://localhost:3002 |
| Order Service | http://localhost:3003 |
| Notification Service | http://localhost:3004 |
| PostgreSQL | localhost:5432 |

### 3. Health checks

```bash
curl http://localhost:8080/health          # API Gateway
curl http://localhost:3001/health          # User Service
curl http://localhost:3002/health          # Product Service
```

### Database Schema

The database is auto-initialized from `init.sql` on first start. It creates:

| Table | Description |
|---|---|
| `users` | id, name, email (unique), password (hashed), timestamps |
| `products` | id, name, description, price, stock, timestamps |
| `orders` | id, user_id, product_id, quantity, status, timestamps |
| `notifications` | id, user_id, message, is_read, timestamps |

Seed data: 3 sample products (Laptop, Mouse, Keyboard).

### API Endpoints

All routes are proxied through the Nginx gateway at `:8080`.

```
POST   /api/users/register         Register a new user
POST   /api/users/login            Login (returns JWT)
GET    /api/users/:id              Get user (JWT required)
PUT    /api/users/:id              Update user (JWT required)
DELETE /api/users/:id              Delete user (JWT required)

GET    /api/products               List all products
POST   /api/products               Create product
GET    /api/products/:id           Get product
PUT    /api/products/:id           Update product
DELETE /api/products/:id           Delete product

GET    /api/orders                 List orders
POST   /api/orders                 Create order
GET    /api/orders/:id             Get order
PUT    /api/orders/:id             Update order status
DELETE /api/orders/:id             Delete order

GET    /api/notifications          List notifications
POST   /api/notifications          Create notification
PUT    /api/notifications/:id      Mark as read
DELETE /api/notifications/:id      Delete notification
```

---

## CI/CD Pipeline

Every push triggers an automated pipeline via GitHub Actions. The pipeline uses a **reusable workflow** (`reusable-service-ci.yml`) shared by all services.

```
Push to main / PR
       │
       ▼
┌─────────────┐
│  Lint & Test │  ESLint + Jest + code coverage (lcov)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ SonarQube Scan   │  Quality gate must pass
└──────┬───────────┘
       │  (main branch only)
       ▼
┌──────────────────────────┐
│ Build → Trivy → Push ECR │  Fails on CRITICAL/HIGH CVEs
└──────┬───────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Update Helm values-dev.yaml     │  Commits new image SHA → triggers ArgoCD
└─────────────────────────────────┘
```

**Terraform workflow** (`terraform-plan.yml`) runs on every PR that touches `infrastructure/terraform/**`:
- `terraform fmt` check
- `terraform validate`
- Trivy IaC scan
- `terraform plan` output posted as a PR comment

---

## Infrastructure (Terraform)

### Prerequisites

- [Terraform >= 1.6](https://developer.hashicorp.com/terraform/install)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions
- An SSH key pair at `~/.ssh/shopflow-key` (or update `public_key_path` in tfvars)

### Provision dev environment

```bash
cd infrastructure/terraform/environments/dev

# Copy and fill in variable values
cp terraform.tfvars.example terraform.tfvars

# Set the database password via environment variable (not in tfvars)
export TF_VAR_db_password="your-strong-password"

terraform init
terraform plan
terraform apply
```

### What gets created

| Module | Resources |
|---|---|
| **vpc** | VPC, 2 public + 2 private subnets, IGW, NAT gateway, route tables |
| **eks** | EKS cluster (1.29), managed node group (SPOT, t3.medium, 2–4 nodes), OIDC for IRSA, CoreDNS/kube-proxy/VPC-CNI/EBS-CSI addons |
| **rds** | PostgreSQL 15.4 on db.t3.micro, encrypted, private subnet, automated backups |
| **ecr** | 5 repositories (user/product/order/notification/frontend), image scan on push, lifecycle policy |
| **ci-servers** | SonarQube EC2 (t3.medium), Elastic IP, security group, IAM profile |

### After apply

```bash
# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name shopflow-dev-eks

# Get SonarQube IP for Ansible and GitHub secrets
terraform output sonarqube_url
```

---

## Configuration Management (Ansible)

Ansible provisions the SonarQube EC2 instance created by Terraform.

### Prerequisites

- [Ansible >= 2.14](https://docs.ansible.com/ansible/latest/installation_guide/index.html)
- SSH access to the EC2 instance (`~/.ssh/shopflow-key.pem`)

### Setup

```bash
cd ansible

# Install required collections
make install-requirements

# Create and encrypt the vault file with sensitive values
cp group_vars/vault.yml.example group_vars/vault.yml
# Edit vault.yml and set vault_sonarqube_db_password
ansible-vault encrypt group_vars/vault.yml

# Update inventory with the EC2 IP from terraform output
# Edit inventory/hosts.ini — replace <SONARQUBE_PUBLIC_IP>
```

### Provision

```bash
# Provision SonarQube (prompts for vault password)
make sonarqube

# Or with static inventory for testing
make sonarqube-static

# Dry run
make check
```

The `sonarqube` role installs:
- Java 17, PostgreSQL 15
- SonarQube 10.3 as a systemd service
- Firewall rule for port 9000

After provisioning, set the `SONAR_HOST_URL` and `SONAR_TOKEN` in GitHub repository secrets.

---

## Kubernetes & GitOps (Helm + ArgoCD)

### Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the ShopFlow project and App of Apps
kubectl apply -f gitops/argocd/argocd-project.yaml
kubectl apply -f gitops/argocd/app-of-apps.yaml
```

Once the App of Apps syncs, ArgoCD deploys all 5 services via the `ApplicationSet` in `gitops/argocd/applications/applicationset.yaml`. From that point on, every CI pipeline commit to Helm values automatically triggers a sync.

### Helm chart structure

Each chart has two values files that ArgoCD merges:

| File | Purpose |
|---|---|
| `values.yaml` | Defaults, secret placeholders, resource shapes |
| `values-dev.yaml` | Dev overrides — image tag (updated by CI), replicas, ingress host |

Resource limits per service (dev):

| Service | CPU request/limit | Memory request/limit |
|---|---|---|
| user/product/order/notification | 50m / 250m | 64Mi / 256Mi |
| frontend | 25m / 100m | 32Mi / 64Mi |

---

## Observability

The full observability stack deploys to Kubernetes with a single command:

```bash
cd monitoring
make install        # installs all three stacks
make status         # check pod health
```

Or install individually:

```bash
make install-prometheus   # Prometheus + Grafana + AlertManager
make install-efk          # Elasticsearch + Fluentd + Kibana
make install-jaeger        # Jaeger + OpenTelemetry Collector
```

### Port-forward for local access

```bash
make port-forward-grafana     # http://localhost:3000
make port-forward-kibana      # http://localhost:5601
make port-forward-jaeger       # http://localhost:16686
```

### What's instrumented

Every microservice exposes:
- `GET /metrics` — Prometheus metrics via `prom-client`
- `GET /health` — liveness probe
- OpenTelemetry auto-instrumentation → traces sent to the OTEL Collector → Jaeger
- Structured logs via `morgan` → Fluentd → Elasticsearch → Kibana

---

## GitHub Actions Secrets

The following secrets must be configured in your GitHub repository settings before the CI/CD pipeline will work:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key for ECR push |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | AWS account ID (used to build ECR URI) |
| `SONAR_TOKEN` | SonarQube user token |
| `SONAR_HOST_URL` | SonarQube server URL (e.g. `http://<ip>:9000`) |
| `GH_PAT` | GitHub Personal Access Token (for pushing Helm value updates) |
| `TF_VAR_DB_PASSWORD` | PostgreSQL password used in Terraform plan |

See `.github/SECRETS.md` for setup instructions.
