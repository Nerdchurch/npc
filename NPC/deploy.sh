#!/bin/bash

# NPC Website Deployment Script
# Usage: ./deploy.sh [docker|manual]

set -e  # Exit on any error

DEPLOYMENT_METHOD=${1:-docker}
APP_NAME="npc-website"
DOMAIN="nerdchurchpartners.org"

echo "🚀 NPC Website Deployment Script"
echo "=================================="
echo "Method: $DEPLOYMENT_METHOD"
echo "Domain: $DOMAIN"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Utility functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_warn "This script is designed for Ubuntu. Proceed with caution."
    fi
    
    # Check required commands
    local missing_commands=()
    
    if [ "$DEPLOYMENT_METHOD" = "docker" ]; then
        command -v docker >/dev/null 2>&1 || missing_commands+=("docker")
        command -v docker-compose >/dev/null 2>&1 || missing_commands+=("docker-compose")
    else
        command -v node >/dev/null 2>&1 || missing_commands+=("node")
        command -v npm >/dev/null 2>&1 || missing_commands+=("npm")
        command -v nginx >/dev/null 2>&1 || missing_commands+=("nginx")
    fi
    
    if [ ${#missing_commands[@]} -ne 0 ]; then
        log_error "Missing required commands: ${missing_commands[*]}"
        log_info "Please install missing dependencies and run again"
        exit 1
    fi
    
    log_info "✓ Requirements check passed"
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    if [ ! -f ".env.production" ]; then
        if [ -f ".env.production.template" ]; then
            log_info "Creating .env.production from template"
            cp .env.production.template .env.production
            log_warn "Please edit .env.production with your actual API keys!"
            log_warn "Press Enter when ready to continue..."
            read
        else
            log_error ".env.production.template not found"
            exit 1
        fi
    fi
    
    log_info "✓ Environment setup complete"
}

# Docker deployment
deploy_docker() {
    log_info "Starting Docker deployment..."
    
    # Create necessary directories
    mkdir -p logs/nginx
    
    # Use production configuration
    cp package.prod.json package.json
    cp vite.config.prod.js vite.config.js
    
    # Stop existing containers
    if docker-compose ps | grep -q "Up"; then
        log_info "Stopping existing containers..."
        docker-compose down
    fi
    
    # Build and start
    log_info "Building and starting containers..."
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for container to be ready
    log_info "Waiting for application to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost/health >/dev/null 2>&1; then
        log_info "✓ Application is healthy"
    else
        log_error "Health check failed"
        docker-compose logs
        exit 1
    fi
    
    log_info "✓ Docker deployment complete"
}

# Manual deployment
deploy_manual() {
    log_info "Starting manual deployment..."
    
    # Create application directory
    local app_dir="/var/www/$APP_NAME"
    
    if [ ! -d "$app_dir" ]; then
        sudo mkdir -p "$app_dir"
        sudo chown $USER:$USER "$app_dir"
    fi
    
    # Copy files if not already in target directory
    if [ "$PWD" != "$app_dir" ]; then
        log_info "Copying files to $app_dir"
        rsync -av --exclude=node_modules --exclude=.git . "$app_dir/"
        cd "$app_dir"
    fi
    
    # Use production configuration
    cp package.prod.json package.json
    cp vite.config.prod.js vite.config.js
    
    # Install dependencies and build
    log_info "Installing dependencies..."
    npm install --production
    
    log_info "Building application..."
    npm run build
    
    # Set up Nginx if not already configured
    if [ ! -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        log_info "Setting up Nginx configuration..."
        sudo cp nginx.conf "/etc/nginx/sites-available/$APP_NAME"
        sudo sed -i "s|/usr/share/nginx/html|$app_dir/dist|g" "/etc/nginx/sites-available/$APP_NAME"
        sudo sed -i "s|localhost|$DOMAIN www.$DOMAIN|g" "/etc/nginx/sites-available/$APP_NAME"
        
        sudo ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
        sudo nginx -t && sudo systemctl reload nginx
    fi
    
    # Set up PM2 if available
    if command -v pm2 >/dev/null 2>&1; then
        log_info "Starting with PM2..."
        pm2 delete "$APP_NAME" 2>/dev/null || true
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    log_info "✓ Manual deployment complete"
}

# Setup SSL
setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    if ! command -v certbot >/dev/null 2>&1; then
        log_warn "Certbot not installed. Installing..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Check if certificate already exists
    if sudo certbot certificates | grep -q "$DOMAIN"; then
        log_info "Certificate already exists for $DOMAIN"
        return 0
    fi
    
    log_warn "About to request SSL certificate for $DOMAIN"
    log_warn "Make sure DNS is pointing to this server!"
    log_warn "Continue? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        if [ "$DEPLOYMENT_METHOD" = "docker" ]; then
            docker-compose down
        fi
        
        sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN"
        
        if [ "$DEPLOYMENT_METHOD" = "docker" ]; then
            docker-compose up -d
        fi
        
        log_info "✓ SSL certificate installed"
    else
        log_info "Skipping SSL setup"
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment process..."
    
    check_root
    check_requirements
    setup_environment
    
    case $DEPLOYMENT_METHOD in
        docker)
            deploy_docker
            ;;
        manual)
            deploy_manual
            ;;
        *)
            log_error "Unknown deployment method: $DEPLOYMENT_METHOD"
            log_info "Usage: $0 [docker|manual]"
            exit 1
            ;;
    esac
    
    # Ask about SSL setup
    log_info "Would you like to set up SSL? (y/N)"
    read -r ssl_response
    if [[ "$ssl_response" =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    # Final status check
    log_info "Performing final health check..."
    if curl -f "http://localhost/health" >/dev/null 2>&1; then
        log_info "🎉 Deployment successful!"
        log_info "Your site should be available at: http://$DOMAIN"
        if sudo certbot certificates | grep -q "$DOMAIN"; then
            log_info "HTTPS is also available at: https://$DOMAIN"
        fi
    else
        log_error "Deployment completed but health check failed"
        log_info "Check the logs for more information"
    fi
    
    # Show useful commands
    echo ""
    log_info "Useful commands:"
    if [ "$DEPLOYMENT_METHOD" = "docker" ]; then
        echo "  View logs:     docker-compose logs -f"
        echo "  Restart:       docker-compose restart"
        echo "  Stop:          docker-compose down"
    else
        echo "  View logs:     pm2 logs $APP_NAME"
        echo "  Restart:       pm2 restart $APP_NAME"
        echo "  Stop:          pm2 stop $APP_NAME"
    fi
    echo "  Check status:  curl http://localhost/health"
}

# Run main function
main "$@"