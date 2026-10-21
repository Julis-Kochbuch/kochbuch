#!/bin/bash
set -euo pipefail

main() {
    : "${HOSTNAME:?HOSTNAME is required}"
    : "${MODE:=prod}"

    exec $@
}

main "$@"