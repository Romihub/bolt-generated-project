module "aks_infrastructure" {
  source = "../../modules/aks-cluster"

  environment         = "prod"
  location           = "eastus2"
  resource_group_name = "ecommerce-prod-rg"
  cluster_name       = "ecommerce-prod-aks"
  node_count         = 3
  node_size          = "Standard_D4s_v3"
  
  additional_node_pools = {
    services = {
      node_count = 3
      vm_size    = "Standard_D4s_v3"
      labels = {
        workload = "services"
      }
    }
    frontend = {
      node_count = 2
      vm_size    = "Standard_D2s_v3"
      labels = {
        workload = "frontend"
      }
    }
  }

  tags = {
    Environment = "prod"
    Project     = "ecommerce"
    ManagedBy   = "terraform"
  }
}
