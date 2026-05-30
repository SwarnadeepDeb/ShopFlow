output "sonarqube_public_ip" {
  description = "SonarQube server public IP"
  value       = aws_eip.sonarqube.public_ip
}

output "sonarqube_url" {
  description = "SonarQube Web UI URL"
  value       = "http://${aws_eip.sonarqube.public_ip}:9000"
}

output "ssh_sonarqube" {
  description = "SSH command to connect to SonarQube"
  value       = "ssh -i ~/.ssh/shopflow-key.pem ubuntu@${aws_eip.sonarqube.public_ip}"
}
