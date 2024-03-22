provider "aws" {
  region = "eu-north-1"
}

resource "aws_instance" "example" {
  ami           = "ami-0d74f1e79c38f2933"  # Replace with the correct AMI ID for Amazon Linux 2023
  instance_type = "t3.micro"
  key_name      = "HomesNodeProject"  # Replace with your EC2 key pair name

  # Reference the existing security group "launch-wizard-9"
  security_groups = ["launch-wizard-9"]

  tags = {
    Name = "HomesProjectNode"
  }
}
