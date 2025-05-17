#!/bin/bash

# Update system packages
yum update -y

# Install Git
yum install -y git

# Install Node.js 18.x
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
amazon-linux-extras install nginx1 -y
systemctl start nginx
systemctl enable nginx

# Clone the repository
mkdir -p /var/www
cd /var/www
git clone ${github_repo} ${project_name}
cd ${project_name}

# Create .env file for backend
cat > backend/.env << EOF
# AWS Configuration
AWS_REGION=${aws_region}
AWS_ACCESS_KEY_ID=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$(curl -s http://169.254.169.254/latest/meta-data/iam/info | grep -o "InstanceProfileArn.*" | cut -d "/" -f 2) | grep "AccessKeyId" | cut -d ":" -f 2 | sed 's/[", ]//g')
AWS_SECRET_ACCESS_KEY=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$(curl -s http://169.254.169.254/latest/meta-data/iam/info | grep -o "InstanceProfileArn.*" | cut -d "/" -f 2) | grep "SecretAccessKey" | cut -d ":" -f 2 | sed 's/[", ]//g')
S3_BUCKET_NAME=${s3_bucket_name}

# Database Configuration
DATABASE_URL="mysql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}"

# Server Configuration
PORT=3001
EOF

# Create .env.local file for frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF

# Install backend dependencies and generate Prisma client
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# Start backend with PM2
pm2 start server.js --name backend

# Install frontend dependencies and build
cd ..
npm install
npm run build

# Start frontend with PM2
pm2 start npm --name frontend -- start

# Save PM2 processes to start on boot
pm2 save
pm2 startup | tail -1 | bash

# Configure Nginx to proxy requests
cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Restart Nginx to apply changes
systemctl restart nginx
