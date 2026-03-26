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

chmod -R 700 ./data/tenants/$TENANT_NAME || true

if command -v mongo >/dev/null 2>&1; then
  mongo --eval "db=connect('localhost:27017/saas_db'); db.tenantconfigs.updateOne({ tenantId: '$TENANT_NAME' }, { $set: { tenantId: '$TENANT_NAME', settings: { theme_color: '#3b82f6', api_access: true, max_users: 10 }, lastUpdated: new Date() } }, { upsert: true })"
fi

echo "------------------------------------------"
echo "✅ SUCCESS: Tenant '$TENANT_NAME' is ready!"
echo "Location: ./data/tenants/$TENANT_NAME/config.json"
echo "------------------------------------------"