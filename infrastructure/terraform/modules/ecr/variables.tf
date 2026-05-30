variable "project" {
  description = "Project name — used as ECR namespace prefix"
  type        = string
}

variable "repositories" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["user-service", "product-service", "order-service", "notification-service", "frontend"]
}

variable "tags" {
  type    = map(string)
  default = {}
}
