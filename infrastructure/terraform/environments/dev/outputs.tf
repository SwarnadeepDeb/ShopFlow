output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_oidc_provider_arn" {
  description = "OIDC provider ARN for IRSA"
  value       = module.eks.oidc_provider_arn
}

output "db_host" {
  description = "RDS hostname"
  value       = module.rds.db_host
}

output "db_endpoint" {
  description = "RDS endpoint with port"
  value       = module.rds.db_endpoint
}

output "ecr_repository_urls" {
  description = "ECR repository URLs per service"
  value       = module.ecr.repository_urls
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "sonarqube_url" {
  description = "SonarQube Web UI"
  value       = module.ci_servers.sonarqube_url
}

output "ansible_inventory_update" {
  description = "Update ansible/inventory/hosts.ini with this IP"
  value = {
    sonarqube_ip = module.ci_servers.sonarqube_public_ip
  }
}
