#!/bin/bash

# This is a variable that takes the first word typed after the script name
TENANT_NAME=$1

# Check if you actually provided a name
if [ -z "$TENANT_NAME" ]; then
    echo "Error: Please provide a tenant name (e.g., ./add_tenant.sh google)"
    exit 1
fi

# 1. Create the tenant's private directory
# The -p flag ensures it creates parent folders if they don't exist
mkdir -p ./data/tenants/$TENANT_NAME

# 2. Create a starting configuration file (JSON)
# We use 'cat' to write a block of text into a new file
cat <<EOF > ./data/tenants/$TENANT_NAME/config.json
{
  "tenant_id": "$TENANT_NAME",
  "theme_color": "#3b82f6",
  "api_access": true,
  "max_users": 10
}
EOF

echo "------------------------------------------"
echo "✅ SUCCESS: Tenant '$TENANT_NAME' is ready!"
echo "Location: ./data/tenants/$TENANT_NAME/config.json"
echo "------------------------------------------"