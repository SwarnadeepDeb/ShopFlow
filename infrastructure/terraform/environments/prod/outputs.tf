output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_oidc_provider_arn" {
  value = module.eks.oidc_provider_arn
}

output "db_host" {
  value = module.rds.db_host
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "configure_kubectl" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
