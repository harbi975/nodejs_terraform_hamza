provider "aws" {

  region = "us-east-1"

}
 
resource "aws_s3_bucket" "next_bucket" {

  bucket = "harbi-s3"

  force_destroy = true

}
 
resource "aws_db_instance" "my_rds_harbi" {

  allocated_storage    = 20

  engine               = "mysql"

  engine_version       = "8.0"

  instance_class       = "db.t3.micro"

  db_name              = "mydatabase"

  username             = "admin"

  password             = "pawd123!"

  skip_final_snapshot  = true

  publicly_accessible  = true

}

 