#!/bin/bash

# Usage: ./deploy.sh <environment> <region>
# Example: ./deploy.sh dev eastus

ENV=$1
REGION=$2

if [ -z "$ENV" ] || [ -z "$REGION" ]; then
    echo "Usage: ./deploy.sh <environment> <region>"
    exit 1
fi

# Validate environment
if [ "$ENV" != "dev" ] && [ "$ENV" != "test" ] && [ "$ENV" != "prod" ]; then
    echo "Environment must be dev, test, or prod"
    exit 1
fi

echo "Deploying to $ENV environment in $REGION..."

# Deploy infrastructure
cd infrastructure/aks/environments/$ENV
terraform init
terraform apply -auto-approve

# Get AKS credentials
CLUSTER_NAME="ecommerce-$ENV-aks"
RG_NAME="ecommerce-$ENV-rg"
az aks get-credentials --resource-group $RG_NAME --name $CLUSTER_NAME --overwrite-existing

# Install Istio
istioctl install -f k8s/istio/$ENV/istio-config.yaml -y

# Label namespace for Istio injection
kubectl label namespace ecommerce-$ENV istio-injection=enabled --overwrite

# Apply Kubernetes configurations
kubectl apply -f k8s/base/
kubectl apply -f k8s/environments/$ENV/

# Deploy services with environment-specific values
helm upgrade --install frontend k8s/charts/frontend -f k8s/environments/$ENV/values.yaml -n ecommerce-$ENV
helm upgrade --install auth k8s/charts/auth -f k8s/environments/$ENV/values.yaml -n ecommerce-$ENV
helm upgrade --install catalog k8s/charts/catalog -f k8s/environments/$ENV/values.yaml -n ecommerce-$ENV
helm upgrade --install orders k8s/charts/orders -f k8s/environments/$ENV/values.yaml -n ecommerce-$ENV
helm upgrade --install payment k8s/charts/payment -f k8s/environments/$ENV/values.yaml -n ecommerce-$ENV

# Deploy monitoring stack
helm upgrade --install prometheus k8s/charts/prometheus -f k8s/environments/$ENV/monitoring-values.yaml -n monitoring
helm upgrade --install grafana k8s/charts/grafana -f k8s/environments/$ENV/monitoring-values.yaml -n monitoring

echo "Deployment to $ENV completed!"
