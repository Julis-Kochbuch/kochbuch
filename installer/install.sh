#!/bin/bash
set -Eeuo pipefail

if [[ -f ".env" ]]; then
    source ".env"
fi

COMPOSE_URL="https://github.com/Julis-Kochbuch/kochbuch/releases/latest/download/compose.yaml"

echo -e "\nWelcome to Juli's Kochbuch installer! \n"
echo -e "This installer will ask you a few questions before installing Juli's Kochbuch :)"
read -s -p "Press any button to begin" -n 1 key

if [[ ! -d "." || ! -w "." ]]; then
    echo -e "\n\n=====\n"
    echo "Error: must be a writable directory."
    exit 1
fi

echo -e "\n\n=====\n"

echo "Please provide your hostname"
echo "INFO: Where your cookbook will be reachable online"
echo "SYNTAX: just the plain hostname without https:// or any shenanigans"
echo "EXAMPLES: abc.com subdomain.example.net anotherexample.org/onemoreexample"

while true; do
    if [[ -z ${HOSTNAME:-} ]]; then
        read -r -p "Hostname: " HOSTNAME
    else
        read -r -p "Hostname [$HOSTNAME]: " NEW_HOSTNAME
    fi

    # later add regex validation
    if [[ -n ${NEW_HOSTNAME:-${HOSTNAME:-}} ]]; then
        break
    fi

    echo "ERROR: Invalid hostname."
done

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

if [ ! -f "secrets/kochbuch_pw_admin" ]; then
    echo -e "\n=====\n"

    echo "INFO: Set the password you will use to log in as admin to your Kochbuch instance. You can change this later"

    while true; do
        read -r -s -p "Set password: " PASSWORD

        if [[ -n "$PASSWORD" ]]; then
            break
        fi

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
mkdir -p "secrets"

if [ ! -f "secrets/kochbuch_pw_admin" ]; then
    printf '%s' "$PASSWORD" > "secrets/kochbuch_pw_admin"
fi
if [ ! -f "secrets/pg_pw_admin" ]; then
    openssl rand -hex 64 > "secrets/pg_pw_admin"
fi
if [ ! -f "secrets/pg_pw_backend" ]; then
    openssl rand -hex 64 > "secrets/pg_pw_backend"
fi
if [ ! -f "secrets/session_secret" ]; then
    openssl rand -hex 64 > "secrets/session_secret"
fi

mkdir -p "letsencrypt"

if [ ! -f "letsencrypt/acme.json" ]; then
    echo "Creating Let's Encrypt files..."

    printf '' > "letsencrypt/acme.json"
fi

echo "Writing environment configuration..."

{
    printf 'HOSTNAME=%s\n' "${NEW_HOSTNAME:-${HOSTNAME}}"
    printf 'ACME_EMAIL=%s\n' "$ACME_EMAIL"
    printf 'TAG=%s\n' "${TAG:=latest}"
} > ".env"

mv "$TMP_COMPOSE" "compose.yaml"

echo -e "\n=====\n"
echo -e "Installation complete!\n"
echo "Next steps:"
echo "  1. Run 'docker compose up -d'"
echo "  2. Open your hostname in a browser and log in as admin with the password you specified prior"
echo "  3. Cook something :)"
