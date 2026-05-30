terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.6.0"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

locals {
  cluster_name = "${var.project}-${var.environment}-eks"

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ─── VPC ─────────────────────────────────────────────────────────────────────

module "vpc" {
  source = "../../modules/vpc"

  project              = var.project
  environment          = var.environment
  cluster_name         = local.cluster_name
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  single_nat_gateway   = true
  tags                 = local.tags
}

# ─── EKS ─────────────────────────────────────────────────────────────────────

module "eks" {
  source = "../../modules/eks"

  cluster_name        = local.cluster_name
  environment         = var.environment
  kubernetes_version  = var.kubernetes_version
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  node_instance_types = var.node_instance_types
  capacity_type       = "SPOT"
  node_desired_size   = var.node_desired_size
  node_min_size       = var.node_min_size
  node_max_size       = var.node_max_size
  tags                = local.tags
}

# ─── RDS ─────────────────────────────────────────────────────────────────────

module "rds" {
  source = "../../modules/rds"

  project                = var.project
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  node_security_group_id = module.eks.node_security_group_id
  db_instance_class      = var.db_instance_class
  allocated_storage      = var.allocated_storage
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
  multi_az               = false
  skip_final_snapshot    = true
  deletion_protection    = false
  backup_retention_period = 1
  tags                   = local.tags
}

# ─── ECR ─────────────────────────────────────────────────────────────────────

module "ecr" {
  source = "../../modules/ecr"

  project = var.project
  tags    = local.tags
}

# ─── SonarQube (code quality analysis) ──────────────────────────────────────

module "ci_servers" {
  source = "../../modules/ci-servers"

  project          = var.project
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  public_subnet_id = module.vpc.public_subnet_ids[0]
  allowed_cidr     = var.allowed_cidr
  tags             = local.tags
}
