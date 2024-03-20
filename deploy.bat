@echo off

rem Example: Upload files to S3 bucket
aws s3 cp path/to/local/file s3://your-bucket/

rem Example: Launch EC2 instance
aws ec2 run-instances --image-id your-ami-id --instance-type t2.micro --key-name your-key-pair

rem Example: Update ECS service
aws ecs update-service --cluster your-cluster --service your-service --force-new-deployment
