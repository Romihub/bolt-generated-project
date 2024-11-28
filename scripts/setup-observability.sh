#!/bin/bash

# Usage: ./setup-observability.sh <environment>
ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./setup-observability.sh <environment>"
    exit 1
fi

# Add Helm repositories
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add datadog https://helm.datadoghq.com
helm repo add newrelic https://helm-charts.newrelic.com
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update

# Create namespaces
kubectl create namespace observability
kubectl create namespace logging

# Install Grafana Loki
helm upgrade --install loki grafana/loki-stack \
  -f observability/grafana-loki/environments/${ENV}/values.yaml \
  --namespace logging

# Install Datadog
helm upgrade --install datadog datadog/datadog \
  -f observability/datadog/environments/${ENV}/values.yaml \
  --namespace observability

# Install New Relic
helm upgrade --install newrelic newrelic/nri-bundle \
  -f observability/newrelic/environments/${ENV}/values.yaml \
  --namespace observability

# Install Jaeger
helm upgrade --install jaeger jaegertracing/jaeger \
  -f observability/jaeger/environments/${ENV}/values.yaml \
  --namespace observability

# Install OpenTelemetry Collector
kubectl apply -f observability/tracing/otel-collector.yaml

echo "Observability stack setup completed for $ENV environment!"
