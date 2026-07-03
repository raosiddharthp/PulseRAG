variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "pulserag-prod"
}

variable "region" {
  description = "Primary region for all resources"
  type        = string
  default     = "europe-west2"
}

variable "project_number" {
  description = "GCP project number, used for default service account references"
  type        = string
  default     = "165472773798"
}
