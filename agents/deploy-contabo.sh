#!/bin/bash
# KmedTour Python Agent — Contabo VPS Deployment Script
# Target: 62.84.185.148, runs on port 8001 (mapped to internal 8000)
# Usage: Run this from the agents/ directory of the KmedTour repo
# Prerequisites: Docker installed on VPS, SSH key access configured

set -e  # Exit on any error

# ─── Configuration ───────────────────────────────────────────────────────────
VPS_HOST="62.84.185.148"
VPS_USER="root"          # Change to your SSH user if different
IMAGE_NAME="kmedtour-agent"
CONTAINER_NAME="kmedtour-agent"
HOST_PORT="8001"         # External port on VPS
CONTAINER_PORT="8000"    # Internal FastAPI port

# ─── Load environment variables ───────────────────────────────────────────────
# Expects a .env file in agents/ with all required keys (see DEPLOY-NOTES.md)
if [ ! -f ".env" ]; then
  echo "❌ ERROR: .env file not found in agents/ directory"
  echo "   Copy .env.example to .env and fill in your keys."
  exit 1
fi

echo "🚀 KmedTour Agent — Deploying to Contabo VPS"
echo "   Host: $VPS_HOST:$HOST_PORT"
echo ""

# ─── Step 1: Build Docker image locally ──────────────────────────────────────
echo "📦 Step 1/4: Building Docker image..."
docker build -t "$IMAGE_NAME:latest" .
echo "   ✅ Image built: $IMAGE_NAME:latest"

# ─── Step 2: Save image as tar and copy to VPS ───────────────────────────────
echo "📤 Step 2/4: Transferring image to VPS..."
docker save "$IMAGE_NAME:latest" | gzip | ssh "$VPS_USER@$VPS_HOST" "gunzip | docker load"
echo "   ✅ Image transferred and loaded on VPS"

# ─── Step 3: Copy .env file to VPS ───────────────────────────────────────────
echo "🔐 Step 3/4: Copying environment config..."
scp .env "$VPS_USER@$VPS_HOST:/opt/kmedtour/.env"
echo "   ✅ .env copied to /opt/kmedtour/.env"

# ─── Step 4: Restart container on VPS ────────────────────────────────────────
echo "🔄 Step 4/4: Starting container on VPS..."
ssh "$VPS_USER@$VPS_HOST" << REMOTE_SCRIPT
  set -e

  # Stop and remove existing container (ignore errors if not running)
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true

  # Create log directory
  mkdir -p /opt/kmedtour/logs

  # Start new container
  docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$HOST_PORT:$CONTAINER_PORT" \
    --env-file /opt/kmedtour/.env \
    -v /opt/kmedtour/logs:/app/logs \
    "$IMAGE_NAME:latest"

  echo "   Container started. Waiting for health check..."
  sleep 5

  # Verify it's running
  STATUS=\$(docker inspect --format='{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "not found")
  if [ "\$STATUS" = "running" ]; then
    echo "   ✅ Container is running"
  else
    echo "   ❌ Container status: \$STATUS"
    docker logs "$CONTAINER_NAME" --tail 20
    exit 1
  fi
REMOTE_SCRIPT

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo ""
echo "   Agent URL: http://$VPS_HOST:$HOST_PORT"
echo "   Health:    http://$VPS_HOST:$HOST_PORT/health"
echo "   Docs:      http://$VPS_HOST:$HOST_PORT/docs"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Test the health endpoint:"
echo "      curl http://$VPS_HOST:$HOST_PORT/health"
echo ""
echo "   2. Set this env var in Netlify:"
echo "      PYTHON_AGENT_URL=http://$VPS_HOST:$HOST_PORT"
echo ""
echo "   3. Test chatbot on live site → ask 'Cost of LASIK in Seoul?'"
echo "      Verify response includes RAG citations, not generic fallback."
echo ""
echo "   4. To view live logs:"
echo "      ssh $VPS_USER@$VPS_HOST 'docker logs -f $CONTAINER_NAME'"
