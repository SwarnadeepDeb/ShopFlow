terraform {
  backend "s3" {
    bucket         = "shopflow-terraform-state-ACCOUNT_ID"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "shopflow-terraform-locks"
    encrypt        = true
  }
}
