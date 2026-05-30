# ShopFlow Vault policies
# Each service gets its own scoped policy — least privilege

# user-service — can only read its own secrets
path "secret/data/shopflow/user-service" {
  capabilities = ["read"]
}

# product-service
path "secret/data/shopflow/product-service" {
  capabilities = ["read"]
}

# order-service
path "secret/data/shopflow/order-service" {
  capabilities = ["read"]
}

# notification-service
path "secret/data/shopflow/notification-service" {
  capabilities = ["read"]
}

# Shared read (if common secrets are needed in future)
path "secret/data/shopflow/common" {
  capabilities = ["read"]
}

# Deny all other paths explicitly
path "secret/*" {
  capabilities = ["deny"]
}
