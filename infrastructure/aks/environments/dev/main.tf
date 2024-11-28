module "aks_infrastructure" {
  source = "../../modules/aks-cluster"

  environment         = "dev"
  location           = "eastus"
  resource_group_name = "ecommerce-dev-rg"
  cluster_name       = "ecommerce-dev-aks"
  node_count         = 2
  node_size          = "Standard_D2s_v3"
  
  additional_node_pools = {
    services = {
      node_count = 2
      vm_size    = "Standard_D2s_v3"
      labels = {
        workload = "services"
      }
    }
  }

  tags = {
    Environment = "dev"
    Project     = "ecommerce"
    ManagedBy   = "terraform"
  }
}
