# Required GitHub Repository Secrets

Configure these in: Settings → Secrets and variables → Actions

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key (CI: ECR push, EKS describe) |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `SONAR_TOKEN` | SonarQube user token (Project Analysis Token) |
| `SONAR_HOST_URL` | SonarQube server URL e.g. `http://1.2.3.4:9000` |
| `GH_PAT` | GitHub Personal Access Token (repo scope) — used to push Helm value updates |
| `TF_VAR_DB_PASSWORD` | RDS master password for Terraform plan |

## IAM permissions required for CI user

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["eks:DescribeCluster"],
      "Resource": "*"
    }
  ]
}
```
