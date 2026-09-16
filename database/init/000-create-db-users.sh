#!/bin/bash
set -euo pipefail

create_role() {
    local username="$1"
    local secret_file="$2"
    local password

    password="$(cat "/run/secrets/$secret_file")"

    psql \
        --username "${POSTGRES_USER:-postgres}" \
        --dbname "${POSTGRES_DB:-${POSTGRES_USER:-postgres}}" \
        --set=app_username="$username" \
        --set=app_password="$password" \
        <<'EOSQL'
CREATE ROLE :"app_username"
    LOGIN
    PASSWORD :'app_password';
EOSQL
}

create_role "backend" "pg_pw_backend"