#!/bin/bash
set -euo pipefail

main() {
    : "${HOSTNAME:?HOSTNAME is required}"

    export HOSTNAME
    export MODE="${MODE:=prod}"

    exec "$@"
}

main "$@"