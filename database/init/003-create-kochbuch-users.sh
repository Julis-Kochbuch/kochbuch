#!/bin/bash
set -euo pipefail

create_user() {
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
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (name, password_hash, role)
    VALUES
        (:'app_username', crypt(:'app_password', gen_salt('bf', 10)), 10)
    ON CONFLICT (name) DO NOTHING;
EOSQL
}

create_user "admin" "kochbuch_pw_admin"