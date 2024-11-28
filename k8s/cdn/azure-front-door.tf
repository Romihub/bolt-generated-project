resource "azurerm_frontdoor" "ecommerce" {
  name                = "ecommerce-${var.environment}"
  resource_group_name = var.resource_group_name

  routing_rule {
    name               = "frontend"
    accepted_protocols = ["Http", "Https"]
    patterns_to_match  = ["/*"]
    frontend_endpoints = ["frontend"]
    forwarding_configuration {
      forwarding_protocol = "HttpsOnly"
      backend_pool_name   = "frontend-pool"
    }
  }

  backend_pool {
    name = "frontend-pool"
    backend {
      host_header = "frontend.ecommerce.com"
      address     = var.frontend_address
      http_port   = 80
      https_port  = 443
    }

    load_balancing_name = "loadbalancing"
    health_probe_name   = "healthprobe"
  }

  frontend_endpoint {
    name                              = "frontend"
    host_name                         = "www.ecommerce.com"
    custom_https_provisioning_enabled = true
    custom_https_configuration {
      certificate_source = "FrontDoor"
    }
  }
}
