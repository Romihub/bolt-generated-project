resource "azurerm_kubernetes_cluster" "main" {
  name                = var.cluster_name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.cluster_name

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.node_size
    enable_auto_scaling = true
    min_count   = 1
    max_count   = 5
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    network_policy = "calico"
  }

  addon_profile {
    http_application_routing {
      enabled = true
    }
    
    oms_agent {
      enabled = true
    }
  }

  tags = var.tags
}
