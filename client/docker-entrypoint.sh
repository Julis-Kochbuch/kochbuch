#!/bin/bash
set -euo pipefail

main() {
    : "${APP_HOSTNAME:?APP_HOSTNAME is required}"

    export APP_HOSTNAME
    export MODE="${MODE:=prod}"

    exec "$@"
}

main "$@"