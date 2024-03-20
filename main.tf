provider "aws" {
  region = "eu-north-1"
}

resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow inbound SSH traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "example" {
  ami           = "ami-0a658b57c7651349f"  # Microsoft Windows Server 2022 Base
  instance_type = "t3.micro"
  key_name      = "HomesProjectNodeSSH"  # Replace with your EC2 key pair name

  security_groups = [aws_security_group.allow_ssh.name]

  tags = {
    Name = "example-instance"
  }
}
