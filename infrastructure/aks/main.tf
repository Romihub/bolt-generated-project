terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

module "resource_group" {
  source = "./modules/resource_group"
  name   = var.resource_group_name
  location = var.location
  tags     = var.tags
}

module "aks_cluster" {
  source              = "./modules/aks"
  cluster_name        = var.cluster_name
  resource_group_name = module.resource_group.name
  location           = var.location
  node_count         = var.node_count
  node_size          = var.node_size
  tags               = var.tags
}

module "container_registry" {
  source              = "./modules/acr"
  name                = var.acr_name
  resource_group_name = module.resource_group.name
  location           = var.location
  sku                = "Premium"
  tags               = var.tags
}
