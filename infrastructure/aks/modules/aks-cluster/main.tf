resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = var.cluster_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = var.cluster_name
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name                = "default"
    node_count          = var.node_count
    vm_size            = var.node_size
    enable_auto_scaling = true
    min_count          = var.environment == "prod" ? 3 : 1
    max_count          = var.environment == "prod" ? 5 : 3
    vnet_subnet_id     = var.subnet_id

    tags = var.tags
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin     = "azure"
    network_policy     = "calico"
    load_balancer_sku  = "standard"
  }

  addon_profile {
    oms_agent {
      enabled = true
    }
    
    azure_policy {
      enabled = var.environment == "prod" ? true : false
    }
  }

  tags = var.tags
}

resource "azurerm_kubernetes_cluster_node_pool" "additional" {
  for_each = var.additional_node_pools

  name                  = each.key
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size              = each.value.vm_size
  node_count           = each.value.node_count
  enable_auto_scaling  = true
  min_count           = var.environment == "prod" ? 2 : 1
  max_count           = var.environment == "prod" ? 5 : 3
  vnet_subnet_id      = var.subnet_id

  node_labels = each.value.labels
  tags        = var.tags
}
