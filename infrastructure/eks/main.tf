terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./modules/vpc"
  name   = var.vpc_name
  cidr   = var.vpc_cidr
  azs    = var.availability_zones
  tags   = var.tags
}

module "eks_cluster" {
  source          = "./modules/eks"
  cluster_name    = var.cluster_name
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  node_group_name = var.node_group_name
  instance_types  = var.instance_types
  desired_size    = var.desired_size
  max_size        = var.max_size
  min_size        = var.min_size
  tags            = var.tags
}
