output "bucket_name" {
  value = aws_s3_bucket.next_bucket.bucket
}
 
 
output "rds_endpoint" {
  value = aws_db_instance.my_rds_harbi.endpoint
}