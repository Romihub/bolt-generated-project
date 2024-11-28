#!/bin/bash

# Usage: ./destroy.sh <environment> <region>
ENV=$1
REGION=$2

if [ -z "$ENV" ] || [ -z "$REGION" ]; then
    echo "Usage: ./destroy.sh <environment> <region>"
    exit 1
fi

echo "Destroying $ENV environment in $REGION..."

# Delete Kubernetes resources first
kubectl delete namespace ecommerce-$ENV
kubectl delete namespace monitoring

# Destroy infrastructure
cd infrastructure/aks/environments/$ENV
terraform destroy -auto-approve

echo "Environment $ENV destroyed successfully!"
