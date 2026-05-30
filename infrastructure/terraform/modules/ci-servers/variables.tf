variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_id" {
  description = "Public subnet to place CI servers in"
  type        = string
}

variable "public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/shopflow-key.pub"
}

variable "allowed_cidr" {
  description = "CIDR allowed to reach SonarQube (your IP)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "sonarqube_instance_type" {
  description = "SonarQube needs at least 2GB RAM — t3.medium minimum"
  type        = string
  default     = "t3.medium"
}

variable "tags" {
  type    = map(string)
  default = {}
}
