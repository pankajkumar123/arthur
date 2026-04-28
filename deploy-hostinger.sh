#!/bin/bash

# Hostinger SSH Deployment Script (Linux/SSH)
# Run this script directly on Hostinger server via SSH
# Usage: bash deploy-hostinger.sh [frontend|backend|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/umeshchandracholleti/SS.git"
TEMP_DIR="/tmp/ss-deploy-$(date +%s)"
FRONTEND_DEST="$HOME/public_html"
BACKEND_DEST="$HOME/domains/$(hostname -d)/api"  # Adjust this path
DEPLOYMENT_TYPE="${1:-all}"

echo -e "${CYAN}========================================"
echo "  Hostinger SSH Deployment Script"
echo "  Sai Scientifics Application"
echo -e "========================================${NC}"
echo ""

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}[FRONTEND] Starting frontend deployment...${NC}"
    
    # Clone repository
    echo -e "${YELLOW}[1/5] Cloning repository...${NC}"
    git clone --depth 1 "$REPO_URL" "$TEMP_DIR"
    cd "$TEMP_DIR/myapp"
    echo -e "${GREEN}✓ Repository cloned${NC}"
    
    # Install dependencies
    echo -e "${YELLOW}[2/5] Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    
    # Build production bundle
    echo -e "${YELLOW}[3/5] Building production bundle...${NC}"
    npm run build
    echo -e "${GREEN}✓ Build completed${NC}"
    
    # Backup existing files
    echo -e "${YELLOW}[4/5] Backing up existing files...${NC}"
    if [ -d "$FRONTEND_DEST" ]; then
        BACKUP_DIR="$HOME/backups/public_html_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$HOME/backups"
        cp -r "$FRONTEND_DEST" "$BACKUP_DIR"
        echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"
    fi
    
    # Deploy files
    echo -e "${YELLOW}[5/5] Deploying files...${NC}"
    mkdir -p "$FRONTEND_DEST"
    rm -rf "$FRONTEND_DEST"/*
    cp -r dist/* "$FRONTEND_DEST/"
    
    # Copy .htaccess
    if [ -f ".htaccess" ]; then
        cp .htaccess "$FRONTEND_DEST/"
        echo -e "${GREEN}✓ .htaccess copied${NC}"
    fi
    
    echo -e "${GREEN}✓ Frontend deployment complete!${NC}"
    echo ""
}

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}[BACKEND] Starting backend deployment...${NC}"
    
    # Clone repository if not already cloned
    if [ ! -d "$TEMP_DIR" ]; then
        echo -e "${YELLOW}[1/5] Cloning repository...${NC}"
        git clone --depth 1 "$REPO_URL" "$TEMP_DIR"
        echo -e "${GREEN}✓ Repository cloned${NC}"
    fi
    
    cd "$TEMP_DIR/myapp/server"
    
    # Backup existing files
    echo -e "${YELLOW}[2/5] Backing up existing backend...${NC}"
    if [ -d "$BACKEND_DEST" ]; then
        BACKUP_DIR="$HOME/backups/backend_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$HOME/backups"
        cp -r "$BACKEND_DEST" "$BACKUP_DIR"
        echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"
    fi
    
    # Deploy files
    echo -e "${YELLOW}[3/5] Deploying backend files...${NC}"
    mkdir -p "$BACKEND_DEST"
    rsync -av --exclude='node_modules' --exclude='.env' --exclude='*.log' ./ "$BACKEND_DEST/"
    echo -e "${GREEN}✓ Backend files deployed${NC}"
    
    # Install production dependencies
    echo -e "${YELLOW}[4/5] Installing production dependencies...${NC}"
    cd "$BACKEND_DEST"
    npm install --production
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    
    # Check environment variables
    echo -e "${YELLOW}[5/5] Checking environment configuration...${NC}"
    if [ ! -f ".env" ]; then
        echo -e "${RED}⚠ WARNING: .env file not found!${NC}"
        echo -e "${YELLOW}Please create .env file with required variables.${NC}"
        echo -e "${YELLOW}See .env.template for reference.${NC}"
    else
        echo -e "${GREEN}✓ .env file exists${NC}"
    fi
    
    echo -e "${GREEN}✓ Backend deployment complete!${NC}"
    echo -e "${YELLOW}⚠ Don't forget to restart Node.js app in Hostinger panel!${NC}"
    echo ""
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up temporary files...${NC}"
    rm -rf "$TEMP_DIR"
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Main deployment logic
case "$DEPLOYMENT_TYPE" in
    frontend)
        deploy_frontend
        ;;
    backend)
        deploy_backend
        ;;
    all)
        deploy_frontend
        deploy_backend
        ;;
    *)
        echo -e "${RED}Invalid deployment type!${NC}"
        echo "Usage: $0 [frontend|backend|all]"
        exit 1
        ;;
esac

# Cleanup
cleanup

echo ""
echo -e "${CYAN}========================================"
echo "  Deployment Summary"
echo -e "========================================${NC}"
echo ""

if [ "$DEPLOYMENT_TYPE" = "frontend" ] || [ "$DEPLOYMENT_TYPE" = "all" ]; then
    echo -e "${GREEN}✓ Frontend deployed to: $FRONTEND_DEST${NC}"
fi

if [ "$DEPLOYMENT_TYPE" = "backend" ] || [ "$DEPLOYMENT_TYPE" = "all" ]; then
    echo -e "${GREEN}✓ Backend deployed to: $BACKEND_DEST${NC}"
    echo -e "${YELLOW}⚠ Action required: Restart Node.js app in Hostinger panel${NC}"
fi

echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "1. Verify frontend at: https://yourdomain.com"
echo "2. Test API endpoint at: https://yourdomain.com/api/health"
echo "3. Check application logs for any errors"
echo "4. Test authentication and protected routes"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
