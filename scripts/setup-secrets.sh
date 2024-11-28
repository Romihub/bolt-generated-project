#!/bin/bash

# Usage: ./setup-secrets.sh <environment> <provider>
ENV=$1
PROVIDER=$2

if [ -z "$ENV" ] || [ -z "$PROVIDER" ]; then
    echo "Usage: ./setup-secrets.sh <environment> <provider>"
    exit 1
fi

echo "Setting up External Secrets Operator for $ENV environment using $PROVIDER..."

# Install ESO using Helm
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

helm upgrade --install external-secrets \
  external-secrets/external-secrets \
  -f k8s/secrets/external-secrets/values.yaml \
  --namespace external-secrets \
  --create-namespace

# Apply SecretStore configuration
kubectl apply -f k8s/secrets/external-secrets/${PROVIDER}-secretstore.yaml

# Apply ExternalSecrets
kubectl apply -f k8s/secrets/external-secrets/auth-service-secret.yaml
kubectl apply -f k8s/secrets/external-secrets/payment-service-secret.yaml

echo "External Secrets Operator setup completed!"
