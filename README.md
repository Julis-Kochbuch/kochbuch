# Kochbuch

## Setup

### Environment variables

You have to provide environment variables to Docker. Here's how to do it:

1. Next to this `README.md` file, create a file named `.env`
2. You should now have following structure:
    ```
    nasRocket/
    ├─ ...
    ├─ .env
    ├─ ...
    ├─ README.md
    └─ ...
    ```
3. Open it with an editor and copy this into it:
    ```
    HOSTNAME=
    ACME_EMAIL=
    ```
4. Fill in the values right after the `=`. Here's what they mean:
    - `HOSTNAME`: Where your cloud will be reachable online, e.g. `abc.com`, `abc.def.com` or `abc.com/def`
    - `ACME_EMAIL`: An e-mail address that will be used for getting a TLS certificate (which you need to establish a safe connection via HTTPS). I recommend not using a throw away address since you might receive actually relevant notifications

> [!IMPORTANT]  
> The file name must exactly be `.env`.

### Secrets

You have to provide secrets (passwords) to Docker. Here's how to do it:

1. Next to `README.md` (this file), create a directory named `secrets`
2. Go in to `secrets` and create a file named `pg_pw_admin`
3. Open it with an editor and put the secret in it (you can also just generate it with a tool of your liking)
4. Repeat Step 3 and 4 with the following filenames:
    - `kochbuch_pw_admin`
    - `pg_pw_backend`
    - `session_secret`
5. You should now have following structure:
    ```
    nasRocket/
    ├─ ...
    ├─ secrets/
    │  ├─ kochbuch_pw_admin
    │  ├─ pg_pw_admin
    │  ├─ pg_pw_backend
    │  └─ session_secret
    ├─ ...
    ├─ .env
    ├─ ...
    ├─ README.md
    └─ ...
    ```
6. Now run this to protect the secrets:
    ```bash
    chmod 600 secrets/*
    ```

> [!NOTE]  
> The content of `kochbuch_pw_admin` will be the password you use when first logging in as user `admin`.

> [!IMPORTANT]  
> The file names must exactly match the respective file name. They must not have any file ending!


### Let's Encrypt

1. Next to `README.md` (this file), create a directory named `letsencrypt`
2. Go in to `letsencrypt` and create a file named `acme.json`
3. You should now have following structure:
    ```
    nasRocket/
    ├─ ...
    ├─ letsencrypt/
    │  └─ acme.json
    ├─ ...
    ├─ secrets/
    │  ├─ kochbuch_pw_admin
    │  ├─ pg_pw_admin
    │  ├─ pg_pw_backend
    │  └─ session_secret
    ├─ ...
    ├─ .env
    ├─ ...
    ├─ README.md
    └─ ...
    ```
4. Now run this to protect acme.json:
    ```bash
    chmod 600 letsencrypt/acme.json
    ```

## Start the whole thing

Once you've completed the setup, you can start the entire application by doing

```bash
docker compose -f compose.yaml -f compose.production.yaml up -d
```