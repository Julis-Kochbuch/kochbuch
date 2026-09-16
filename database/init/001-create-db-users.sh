#!/bin/bash
set -euo pipefail

create_role() {
    local username="$1"
    local secret_file="$2"
    local role="$3"
    local password

    password="$(cat "/run/secrets/$secret_file")"

    psql \
        --username "${POSTGRES_USER:-postgres}" \
        --dbname "${POSTGRES_DB:-${POSTGRES_USER:-postgres}}" \
        --set=app_username="$username" \
        --set=app_password="$password" \
        --set=app_role="$role" \
        <<'EOSQL'
CREATE ROLE :"app_username"
    LOGIN
    PASSWORD :'app_password'
    IN ROLE :"app_role";
EOSQL
}

create_role "backend-1" "pg_pw_backend" "backend"