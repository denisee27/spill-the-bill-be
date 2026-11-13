#!/bin/bash
# One-time server setup script — run once on fresh VPC
# Usage: bash setup.sh
set -e

APP_DIR="$HOME/apps/spill-the-bill-be"
REPO_URL="https://github.com/YOUR_ORG/spill-the-bill-be.git"  # ← ganti ini

echo "=== 1. Install Node.js via nvm ==="
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

echo "=== 2. Install PM2 ==="
npm install -g pm2

echo "=== 3. Install Nginx ==="
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== 4. Clone repo ==="
mkdir -p ~/apps
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

echo "=== 5. Copy .env.production ==="
echo "→ Salin .env.production ke $APP_DIR/.env lalu tekan Enter"
read -p "   (sudah copy? Enter untuk lanjut)"

echo "=== 6. Install dependencies & migrate ==="
npm ci --ignore-scripts
npx prisma generate
npx prisma migrate deploy

echo "=== 7. Start PM2 ==="
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | tail -1 | bash  # register PM2 on reboot

echo "=== 8. Setup Nginx ==="
sudo cp deploy/nginx.conf /etc/nginx/sites-available/api.spill-the-bill.com
sudo ln -sf /etc/nginx/sites-available/api.spill-the-bill.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "=== 9. SSL via Let's Encrypt ==="
sudo certbot --nginx -d api.spill-the-bill.com --non-interactive --agree-tos -m YOUR_EMAIL@gmail.com

echo ""
echo "✓ Server setup complete!"
echo "  API: https://api.spill-the-bill.com/health"
