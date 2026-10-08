# ============================================================
# Terraform Infrastructure as Code — PayPulse Lite (Unit-IV)
# Provisions the Kubernetes namespace, backend deployment,
# service, and horizontal pod autoscaler via IaC.
# ============================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.26"
    }
  }
}

# --- Provider: Connect to local Minikube cluster ---
provider "kubernetes" {
  config_path = "~/.kube/config"
}

# --- Variables ---
variable "app_name" {
  description = "Application name used for labeling all resources"
  type        = string
  default     = "paypulse-backend"
}

variable "namespace" {
  description = "Kubernetes namespace for PayPulse Lite"
  type        = string
  default     = "paypulse-environment"
}

variable "replicas" {
  description = "Number of backend pod replicas"
  type        = number
  default     = 2
}

variable "container_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 5000
}

# --- Namespace ---
resource "kubernetes_namespace" "paypulse_ns" {
  metadata {
    name = var.namespace
    labels = {
      project     = "paypulse-lite"
      environment = "development"
      managed_by  = "terraform"
    }
  }
}

# --- ConfigMap ---
resource "kubernetes_config_map" "paypulse_config" {
  metadata {
    name      = "${var.app_name}-config"
    namespace = kubernetes_namespace.paypulse_ns.metadata[0].name
  }

  data = {
    PORT         = tostring(var.container_port)
    NODE_ENV     = "production"
    USE_POSTGRES = "false"
  }
}

# --- Secret ---
resource "kubernetes_secret" "paypulse_secrets" {
  metadata {
    name      = "${var.app_name}-secrets"
    namespace = kubernetes_namespace.paypulse_ns.metadata[0].name
  }

  data = {
    JWT_SECRET = base64encode("super_secret_paypulse_key_2026")
  }

  type = "Opaque"
}

# --- Deployment ---
resource "kubernetes_deployment" "paypulse_backend" {
  metadata {
    name      = "${var.app_name}-deployment"
    namespace = kubernetes_namespace.paypulse_ns.metadata[0].name
    labels = {
      app = var.app_name
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.app_name
        }
      }

      spec {
        container {
          name  = var.app_name
          image = "${var.app_name}:latest"
          image_pull_policy = "IfNotPresent"

          port {
            container_port = var.container_port
            name           = "http"
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.paypulse_config.metadata[0].name
            }
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.paypulse_secrets.metadata[0].name
                key  = "JWT_SECRET"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = var.container_port
            }
            initial_delay_seconds = 15
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = var.container_port
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# --- Service ---
resource "kubernetes_service" "paypulse_service" {
  metadata {
    name      = "${var.app_name}-service"
    namespace = kubernetes_namespace.paypulse_ns.metadata[0].name
  }

  spec {
    type = "LoadBalancer"

    selector = {
      app = var.app_name
    }

    port {
      name        = "http"
      port        = var.container_port
      target_port = var.container_port
      protocol    = "TCP"
    }
  }
}

# --- Outputs ---
output "namespace_created" {
  value       = kubernetes_namespace.paypulse_ns.metadata[0].name
  description = "The Kubernetes namespace provisioned by Terraform"
}

output "deployment_name" {
  value       = kubernetes_deployment.paypulse_backend.metadata[0].name
  description = "The name of the backend deployment"
}

output "service_name" {
  value       = kubernetes_service.paypulse_service.metadata[0].name
  description = "The name of the backend service"
}
