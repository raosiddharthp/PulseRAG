resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
}

resource "google_secret_manager_secret" "gemini_api_key" {
  project   = var.project_id
  secret_id = "gemini-api-key"

  replication {
    auto {}
  }
}

resource "google_cloud_run_v2_service" "pulserag_service" {
  name     = "pulserag-service"
  project  = var.project_id
  location = var.region

  deletion_protection = true

  scaling {
    min_instance_count = 0
  }

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 20
    }

    containers {
      image = "europe-west2-docker.pkg.dev/pulserag-prod/cloud-run-source-deploy/pulserag-service@sha256:03394b47b06c3761af7eb3cddafda802f1c1f0a479347c1821e017101283d65d"

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "ALLOWED_EMAILS"
        value = "siddarth.rao@datadomine.com"
      }
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_api_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }
}

resource "google_project_iam_member" "compute_storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_project_iam_member" "compute_logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_project_iam_member" "compute_artifactregistry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_project_iam_member" "compute_datastore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "compute_secret_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.gemini_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_cloud_run_v2_service_iam_member" "compute_run_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.pulserag_service.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_api_gateway_api" "pulserag_api" {
  provider = google-beta
  project  = var.project_id
  api_id   = "pulserag-api"
}

resource "google_api_gateway_api_config" "pulserag_config" {
  provider      = google-beta
  project       = var.project_id
  api           = google_api_gateway_api.pulserag_api.api_id
  api_config_id = "pulserag-config-v5"

  openapi_documents {
    document {
      path     = "openapi.yaml"
      contents = filebase64("${path.module}/gateway/openapi.yaml")
    }
  }

  gateway_config {
    backend_config {
      google_service_account = "${var.project_number}-compute@developer.gserviceaccount.com"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "pulserag_gateway" {
  provider   = google-beta
  project    = var.project_id
  region     = var.region
  api_config = google_api_gateway_api_config.pulserag_config.id
  gateway_id = "pulserag-gateway"
}
