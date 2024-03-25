provider "aws" {
  region = "eu-north-1"
}

resource "aws_instance" "example" {
  ami           = "ami-0d74f1e79c38f2933"  # Replace with the correct AMI ID for Amazon Linux 2023
  instance_type = "t3.micro"
  key_name      = "HomesNodeProject"  # Replace with your EC2 key pair name
  subnet_id     = "subnet-0ba038746f2afd90c"
  iam_instance_profile = "HomesProjectNode"

  tags = {
    Name = "HomesProjectNode"
  }
}

resource "null_resource" "mongodb_setup" {
  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file("C:/NewCode/HomesProjectNodeKey.pem")
    host        = "13.50.13.35"
  }
}
