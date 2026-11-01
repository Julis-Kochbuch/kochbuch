#!/bin/bash
set -euo pipefail

# reads the value of the provided file or just uses the env, depending on what is provided
get_value_from_file() {
	local var="$1"
	local file="${var}_FILE"
	local default="${2:-}"
	if [ "${!var:-}" ] && [ "${!file:-}" ]; then
		printf >&2 'error: %s and %s are both set\n' "$var" "$file"
		exit 1
	fi
	local value="$default"
	if [ "${!var:-}" ]; then
		value="${!var}"
	elif [ "${!file:-}" ]; then
		value="$(< "${!file}")"
	fi
	export "$var"="$value"
	unset "$file"
}

main() {
    get_value_from_file 'POSTGRES_HOST'
    get_value_from_file 'POSTGRES_PASSWORD'
    get_value_from_file 'POSTGRES_USER' 'postgres'
    get_value_from_file 'POSTGRES_DB' "$POSTGRES_USER"
    get_value_from_file 'SESSION_SECRET'

    : "${POSTGRES_HOST:?POSTGRES_HOST is required}"
    : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
    : "${REDIS_URL:?REDIS_URL is required}"
    : "${HOSTNAME:?HOSTNAME is required}"
    : "${SESSION_SECRET:?SESSION_SECRET is required}"

    export POSTGRES_HOST
    export POSTGRES_PASSWORD
    export REDIS_URL
    export HOSTNAME
    export SESSION_SECRET
    export MODE="${MODE:=prod}"
    export PORT="${PORT:=5001}"

    exec "$@"
}

main "$@"