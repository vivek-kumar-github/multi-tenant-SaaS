#!/bin/bash

TENANT_NAME=$1

if [ -z "$TENANT_NAME" ]; then
    echo "Error: Please provide a tenant name (e.g., ./add_tenant.sh google)"
    exit 1
fi

mkdir -p ./data/tenants/$TENANT_NAME

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