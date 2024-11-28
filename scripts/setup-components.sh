#!/bin/bash

# Usage: ./setup-components.sh <environment>
ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./setup-components.sh <environment>"
    exit 1
fi

# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --set installCRDs=true

# Install Redis
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis \
    -f k8s/cache/redis-values.yaml \
    --namespace ecommerce

# Install Elastic Stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
    -f k8s/monitoring/elastic-stack/elasticsearch-values.yaml \
    --namespace logging \
    --create-namespace

helm install kibana elastic/kibana \
    -f k8s/monitoring/elastic-stack/kibana-values.yaml \
    --namespace logging

helm install filebeat elastic/filebeat \
    -f k8s/monitoring/elastic-stack/filebeat-values.yaml \
    --namespace logging

# Apply WAF configuration
kubectl create configmap modsecurity-config \
    --from-file=k8s/waf/modsecurity.conf \
    --namespace ingress-nginx

# Install External DNS
kubectl apply -f k8s/dns/external-dns.yaml

echo "Components setup completed for $ENV environment!"
