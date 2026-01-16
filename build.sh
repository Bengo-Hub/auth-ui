#!/usr/bin/env bash

set -euo pipefail
set +H

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

APP_NAME=${APP_NAME:-"auth-ui"}
NAMESPACE=${NAMESPACE:-"auth"}
ENV_SECRET_NAME=${ENV_SECRET_NAME:-"auth-ui-secrets"}
DEPLOY=${DEPLOY:-true}

REGISTRY_SERVER=${REGISTRY_SERVER:-docker.io}
REGISTRY_NAMESPACE=${REGISTRY_NAMESPACE:-codevertex}
IMAGE_REPO="${REGISTRY_SERVER}/${REGISTRY_NAMESPACE}/${APP_NAME}"

DEVOPS_REPO=${DEVOPS_REPO:-"Bengo-Hub/devops-k8s"}
DEVOPS_DIR=${DEVOPS_DIR:-"$HOME/devops-k8s"}
VALUES_FILE_PATH=${VALUES_FILE_PATH:-"apps/${APP_NAME}/values.yaml"}

GIT_EMAIL=${GIT_EMAIL:-"dev@bengobox.com"}
GIT_USER=${GIT_USER:-"Auth Bot"}
TRIVY_ECODE=${TRIVY_ECODE:-0}

if [[ -z ${GITHUB_SHA:-} ]]; then
  GIT_COMMIT_ID=$(git rev-parse --short=8 HEAD || echo "localbuild")
else
  GIT_COMMIT_ID=${GITHUB_SHA::8}
fi

info "Service : ${APP_NAME}"
info "Namespace: ${NAMESPACE}"
info "Image   : ${IMAGE_REPO}:${GIT_COMMIT_ID}"

for tool in git docker trivy; do
  command -v "$tool" >/dev/null || { error "$tool is required"; exit 1; }
done
if [[ ${DEPLOY} == "true" ]]; then
  for tool in kubectl helm yq jq; do
    command -v "$tool" >/dev/null || { error "$tool is required"; exit 1; }
  done
fi
success "Prerequisite checks passed"

info "Running Trivy filesystem scan"
trivy fs . --exit-code "$TRIVY_ECODE" --format table || true

info "Building Docker image"
DOCKER_BUILDKIT=1 docker build . -t "${IMAGE_REPO}:${GIT_COMMIT_ID}"
success "Docker build complete"

if [[ ${DEPLOY} != "true" ]]; then
  warn "DEPLOY=false -> skipping push/deploy"
  exit 0
fi

if [[ -n ${REGISTRY_USERNAME:-} && -n ${REGISTRY_PASSWORD:-} ]]; then
  echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY_SERVER" -u "$REGISTRY_USERNAME" --password-stdin
fi

docker push "${IMAGE_REPO}:${GIT_COMMIT_ID}"
success "Image pushed"

if [[ -n ${KUBE_CONFIG:-} ]]; then
  mkdir -p ~/.kube
  echo "$KUBE_CONFIG" | base64 -d > ~/.kube/config
  chmod 600 ~/.kube/config
  export KUBECONFIG=~/.kube/config
fi

kubectl get ns "$NAMESPACE" >/dev/null 2>&1 || kubectl create ns "$NAMESPACE"

if [[ -z ${CI:-}${GITHUB_ACTIONS:-} && -f KubeSecrets/devENV.yml ]]; then
  info "Applying local dev secrets"
  kubectl apply -n "$NAMESPACE" -f KubeSecrets/devENV.yml || warn "Failed to apply devENV.yml"
fi

if [[ -n ${REGISTRY_USERNAME:-} && -n ${REGISTRY_PASSWORD:-} ]]; then
  kubectl -n "$NAMESPACE" create secret docker-registry registry-credentials \
    --docker-server="$REGISTRY_SERVER" \
    --docker-username="$REGISTRY_USERNAME" \
    --docker-password="$REGISTRY_PASSWORD" \
    --dry-run=client -o yaml | kubectl apply -f - || warn "registry secret creation failed"
fi

# Update Helm values in devops-k8s repo
# Resolve token from available sources (priority: GH_PAT > GIT_SECRET > GIT_TOKEN > GITHUB_TOKEN)
TOKEN="${GH_PAT:-${GIT_SECRET:-${GIT_TOKEN:-${GITHUB_TOKEN:-}}}}"

if [[ -n "${GH_PAT:-}" ]]; then
  info "Using GH_PAT for git operations"
elif [[ -n "${GIT_SECRET:-}" ]]; then
  info "Using GIT_SECRET for git operations"
elif [[ -n "${GIT_TOKEN:-}" ]]; then
  info "Using GIT_TOKEN for git operations"
elif [[ -n "${GITHUB_TOKEN:-}" ]]; then
  info "Using GITHUB_TOKEN for git operations (may lack cross-repo write)"
else
  warn "No GitHub token found for devops-k8s update"
fi

if [[ -n "$TOKEN" ]]; then
  info "Updating Helm values in devops-k8s"

  CLONE_URL="https://x-access-token:${TOKEN}@github.com/${DEVOPS_REPO}.git"

  # Clone devops-k8s repo if it doesn't exist
  if [[ ! -d "$DEVOPS_DIR" ]]; then
    info "Cloning devops-k8s repo..."
    git clone "$CLONE_URL" "$DEVOPS_DIR" || { error "Failed to clone devops-k8s"; exit 1; }
  fi

  cd "$DEVOPS_DIR"
  git config user.email "$GIT_EMAIL"
  git config user.name "$GIT_USER"

  # Ensure we have the latest changes
  git fetch origin main || true
  git checkout main || git checkout -b main
  git reset --hard origin/main

  if [[ -f "$VALUES_FILE_PATH" ]]; then
    # Update image tag using yq
    IMAGE_TAG_ENV="$GIT_COMMIT_ID" yq e -i '.image.tag = env(IMAGE_TAG_ENV)' "$VALUES_FILE_PATH"

    git add "$VALUES_FILE_PATH"
    git commit -m "${APP_NAME}:${GIT_COMMIT_ID} released" || info "No changes to commit"
    git pull --rebase origin main || true

    # Push using token
    if git remote | grep -q push-origin; then git remote remove push-origin || true; fi
    git remote add push-origin "$CLONE_URL"
    git push push-origin HEAD:main || warn "Failed to push to devops repo"
    success "Helm values updated - ArgoCD will auto-sync"
  else
    warn "Values file not found at ${VALUES_FILE_PATH}"
  fi

  cd - > /dev/null
else
  warn "No GitHub token set - skipping devops-k8s update"
fi

success "Build and deploy process finished for ${APP_NAME}"
