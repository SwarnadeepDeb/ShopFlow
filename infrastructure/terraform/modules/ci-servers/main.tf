data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─── Key Pair ────────────────────────────────────────────────────────────────

resource "aws_key_pair" "ci" {
  key_name   = "${var.project}-ci-key"
  public_key = file(var.public_key_path)

  tags = var.tags
}

# ─── Security Groups ─────────────────────────────────────────────────────────

resource "aws_security_group" "sonarqube" {
  name        = "${var.project}-${var.environment}-sonarqube-sg"
  description = "SonarQube server security group"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  ingress {
    description = "SonarQube Web UI"
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.project}-${var.environment}-sonarqube-sg" })
}

# ─── IAM: Instance Profile for AWS CLI access ─────────────────────────────

resource "aws_iam_role" "ci_server" {
  name = "${var.project}-${var.environment}-ci-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "ci_ecr_access" {
  name = "${var.project}-${var.environment}-ci-ecr-policy"
  role = aws_iam_role.ci_server.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken", "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage",
                    "ecr:PutImage", "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart", "ecr:CompleteLayerUpload"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["eks:DescribeCluster", "eks:ListClusters"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ci_server" {
  name = "${var.project}-${var.environment}-ci-profile"
  role = aws_iam_role.ci_server.name
}

# ─── EC2: SonarQube ───────────────────────────────────────────────────────

resource "aws_instance" "sonarqube" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.sonarqube_instance_type
  key_name               = aws_key_pair.ci.key_name
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.sonarqube.id]
  iam_instance_profile   = aws_iam_instance_profile.ci_server.name

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y python3 python3-pip
    echo "SonarQube EC2 ready for Ansible provisioning"
  EOF

  tags = merge(var.tags, {
    Name        = "${var.project}-${var.environment}-sonarqube"
    Role        = "sonarqube"
    Environment = var.environment
    Project     = var.project
  })
}

resource "aws_eip" "sonarqube" {
  instance = aws_instance.sonarqube.id
  domain   = "vpc"

  tags = merge(var.tags, { Name = "${var.project}-${var.environment}-sonarqube-eip" })
}
