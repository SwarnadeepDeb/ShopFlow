terraform {
  backend "s3" {
    bucket         = "shopflow-terraform-state-879717844084"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "shopflow-terraform-locks"
    encrypt        = true
    profile        = "local"
  }
}
