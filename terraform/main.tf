terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# Roteiro:
# 1. Faça login no Azure com `az login`.
# 2. Ajuste os valores das variáveis abaixo via `terraform.tfvars` ou `-var`.
# 3. Rode `terraform init`.
# 4. Rode `terraform apply`.
# 5. Ao final, pegue o IP público no output `app_url`.
#
# Observação importante:
# Este app usa SQLite em `/app/data/dev.db`. Em Kubernetes isso funciona
# apenas como cenário simples de demonstração, com uma única réplica.
# Não escale este deployment para mais de 1 réplica sem trocar o banco.

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

# Ajuste estes valores para o seu ambiente.
variable "subscription_id" {
  description = "Subscription ID do Azure."
  type        = string
}

variable "location" {
  description = "Região do Azure onde o AKS será criado."
  type        = string
  default     = "brazilsouth"
}

variable "resource_group_name" {
  description = "Nome do Resource Group."
  type        = string
  default     = "rg-rest-graphql-aks"
}

variable "cluster_name" {
  description = "Nome base do cluster AKS."
  type        = string
  default     = "rest-graphql-aks"
}

variable "kubernetes_namespace" {
  description = "Namespace da aplicação dentro do cluster."
  type        = string
  default     = "app"
}

variable "docker_image" {
  description = "Imagem publicada no Docker Hub que será executada no AKS."
  type        = string
}

variable "docker_image_tag" {
  description = "Tag da imagem Docker. Ex.: latest, main ou v1.0.0."
  type        = string
  default     = "latest"
}

variable "gemini_api_key" {
  description = "Chave usada pela aplicação para chamadas ao Gemini."
  type        = string
  sensitive   = true
}

variable "node_count" {
  description = "Quantidade de nós no node pool padrão do AKS."
  type        = number
  default     = 1
}

variable "node_vm_size" {
  description = "Tamanho das VMs do node pool."
  type        = string
  default     = "Standard_B2s"
}

variable "app_replicas" {
  description = "Quantidade de réplicas do app. Mantenha 1 enquanto usar SQLite."
  type        = number
  default     = 1
}

variable "app_port" {
  description = "Porta exposta pelo container."
  type        = number
  default     = 3000
}

variable "data_disk_size_gi" {
  description = "Tamanho do volume persistente usado pelo SQLite."
  type        = string
  default     = "5Gi"
}

resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.location
}

# Cluster AKS básico com identidade gerenciada.
# Para um ambiente real, você provavelmente vai querer:
# - node pools separados
# - autoscaling
# - monitoramento
# - ingress controller
# - Key Vault / CSI Driver
resource "azurerm_kubernetes_cluster" "this" {
  name                = "${var.cluster_name}-${random_string.suffix.result}"
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  dns_prefix          = "${var.cluster_name}-${random_string.suffix.result}"

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.node_vm_size
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    project = "rest-graphql-nodejs-example"
    env     = "demo"
  }
}

# O provider Kubernetes usa o kubeconfig retornado pelo próprio AKS.
# Assim, o mesmo `terraform apply` já cria os objetos dentro do cluster.
provider "kubernetes" {
  host                   = azurerm_kubernetes_cluster.this.kube_config.0.host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.this.kube_config.0.client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.this.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.this.kube_config.0.cluster_ca_certificate)
}

resource "kubernetes_namespace" "app" {
  metadata {
    name = var.kubernetes_namespace
  }
}

# Secret simples para a variável usada pelo app.
# Em produção, prefira integrar com Azure Key Vault.
resource "kubernetes_secret" "app_env" {
  metadata {
    name      = "app-secrets"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  data = {
    GEMINI_API_KEY = var.gemini_api_key
  }

  type = "Opaque"
}

# PVC para persistir o arquivo SQLite em /app/data.
# Em AKS, a StorageClass padrão normalmente já provisiona o disco.
resource "kubernetes_persistent_volume_claim" "app_data" {
  metadata {
    name      = "app-data"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = var.data_disk_size_gi
      }
    }
  }
}

resource "kubernetes_deployment" "app" {
  metadata {
    name      = "rest-graphql-app"
    namespace = kubernetes_namespace.app.metadata[0].name

    labels = {
      app = "rest-graphql-app"
    }
  }

  spec {
    replicas = var.app_replicas

    selector {
      match_labels = {
        app = "rest-graphql-app"
      }
    }

    template {
      metadata {
        labels = {
          app = "rest-graphql-app"
        }
      }

      spec {
        container {
          name  = "app"
          image = "${var.docker_image}:${var.docker_image_tag}"

          image_pull_policy = "Always"

          port {
            container_port = var.app_port
          }

          env {
            name  = "NODE_ENV"
            value = "production"
          }

          env {
            name  = "PORT"
            value = tostring(var.app_port)
          }

          # O start.sh cria /app/data e executa `prisma db push`.
          # Por isso o volume precisa estar montado no mesmo caminho.
          env {
            name  = "DATABASE_URL"
            value = "file:./data/dev.db"
          }

          env {
            name = "GEMINI_API_KEY"

            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_env.metadata[0].name
                key  = "GEMINI_API_KEY"
              }
            }
          }

          volume_mount {
            name       = "app-data"
            mount_path = "/app/data"
          }

          # Probes simples. Se o app expõe uma rota mais adequada para healthcheck,
          # substitua "/" por essa rota.
          readiness_probe {
            http_get {
              path = "/"
              port = var.app_port
            }

            initial_delay_seconds = 20
            period_seconds        = 10
          }

          liveness_probe {
            http_get {
              path = "/"
              port = var.app_port
            }

            initial_delay_seconds = 30
            period_seconds        = 20
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
        }

        volume {
          name = "app-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.app_data.metadata[0].name
          }
        }
      }
    }
  }
}

# Service público para expor o app na internet sem ingress.
# É o caminho mais curto para subir a demo.
resource "kubernetes_service" "app" {
  metadata {
    name      = "rest-graphql-service"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = "rest-graphql-app"
    }

    port {
      port        = 80
      target_port = var.app_port
    }

    type = "LoadBalancer"
  }
}

output "resource_group_name" {
  description = "Resource Group criado para o AKS."
  value       = azurerm_resource_group.this.name
}

output "aks_cluster_name" {
  description = "Nome final do cluster AKS."
  value       = azurerm_kubernetes_cluster.this.name
}

output "app_url" {
  description = "URL básica para acessar o app depois que o LoadBalancer receber IP."
  value       = "http://${kubernetes_service.app.status[0].load_balancer[0].ingress[0].ip}"
}
