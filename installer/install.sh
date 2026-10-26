#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

echo "$SCRIPT_DIR"
ls

if [[ -f "$SCRIPT_DIR/.env" ]]; then
    source "$SCRIPT_DIR/.env"
fi

INSTALL_DIR="/install"

#COMPOSE_URL="https://github.com/Julis-Kochbuch/kochbuch/releases/latest/download/compose.yaml"
COMPOSE_URL="https://julis-kochbuch.github.io/theme-default/update.json"

echo -e "Welcome to Juli's Kochbuch installer! \n"
echo -e "This installer will ask you a few questions before installing Juli's Kochbuch :)"
read -s -p "Press any button to begin" -n 1 key

if [[ ! -d "$INSTALL_DIR" || ! -w "$INSTALL_DIR" ]]; then
    echo -e "\n\n=====\n"
    echo "Error: /install must be a writable directory."
    exit 1
fi

echo -e "\n\n=====\n"

echo "Please provide your hostname"
echo "INFO: Where your cookbook will be reachable online"
echo "SYNTAX: just the plain hostname without https:// or any shenanigans"
echo "EXAMPLES: abc.com subdomain.example.net anotherexample.org/onemoreexample"

while true; do
    read -r -p "Hostname: " HOSTNAME

    # later add regex validation
    if [[ -n "$HOSTNAME" ]]; then
        break
    fi
    echo "ERROR: Invalid hostname."
done

echo "test"

if [[ -z ${ACME_EMAIL:-} ]]; then
    echo -e "\n=====\n"

    while true; do
        echo "INFO: An e-mail address that will be used for getting a TLS certificate (which you need to establish a safe connection via HTTPS). I recommend not using a throw away address since you might receive actually relevant notifications (though won't happen often tbh)"
        echo "SYNTAX: normal e-mail syntax you know the game"
        read -r -p "Acme e-mail: " ACME_EMAIL

        # later add regex validation
        if [[ -n "$ACME_EMAIL" ]]; then
            break
        fi

        clear
        echo "ERROR: Invalid e-mail."
    done
fi

echo -e "\n=====\n"

echo "INFO: Do you want to install a specific tag (default: latest)"
echo "EXAMPLES: 1 1.1 2.2.4 latest"
while true; do
    read -r -p "Tag [latest]: " TAG

    # later add regex validation
    if [[ true ]]; then
        break
    fi
done

if [ ! -f "$INSTALL_DIR/secrets/kochbuch_pw_admin" ]; then
    echo -e "\n=====\n"

    echo "INFO: Set the password you will use to log in as admin to your Kochbuch instance. You can change this later"

    while true; do
        read -r -s -p "Set password: " PASSWORD

        if [[ -n "$PASSWORD" ]]; then
            break
        fi

        clear
        echo "ERROR: Invalid password."
    done
fi

echo -e "\n=====\n"

echo "Downloading Docker Compose configuration..."

TMP_COMPOSE="$(mktemp)"
trap 'rm -f "$TMP_COMPOSE"' EXIT

curl --fail --location --show-error --silent \
    --retry 3 \
    "$COMPOSE_URL" \
    --output "$TMP_COMPOSE"

echo "Generating secrets..."

umask 022
mkdir -p "$INSTALL_DIR/secrets"

if [ ! -f "$INSTALL_DIR/secrets/kochbuch_pw_admin" ]; then
    printf '%s' "$PASSWORD" > "$INSTALL_DIR/secrets/kochbuch_pw_admin"
fi
if [ ! -f "$INSTALL_DIR/secrets/pg_pw_admin" ]; then
    openssl rand -hex 64 > "$INSTALL_DIR/secrets/pg_pw_admin"
fi
if [ ! -f "$INSTALL_DIR/secrets/pg_pw_backend" ]; then
    openssl rand -hex 64 > "$INSTALL_DIR/secrets/pg_pw_backend"
fi
if [ ! -f "$INSTALL_DIR/secrets/session_secret" ]; then
    openssl rand -hex 64 > "$INSTALL_DIR/secrets/session_secret"
fi

mkdir -p "$INSTALL_DIR/letsencrypt"

if [ ! -f "$INSTALL_DIR/letsencrypt/acme.json" ]; then
    echo "Creating Let's Encrypt files..."

    printf '' > "$INSTALL_DIR/letsencrypt/acme.json"
fi

echo "Writing environment configuration..."

{
    printf 'HOSTNAME=%s\n' "$HOSTNAME"
    printf 'ACME_EMAIL=%s\n' "$ACME_EMAIL"
    printf 'TAG=%s\n' "${TAG:=latest}"
} > "$INSTALL_DIR/.env"

mv "$TMP_COMPOSE" "$INSTALL_DIR/compose.yaml"

echo -e "\n=====\n"
echo -e "Installation complete!\n"
echo "Next steps:"
echo "  1. Run 'docker compose up -d'"
echo "  2. Open your hostname in a browser and log in as admin with the password you specified prior"
echo "  3. Cook something :)"
