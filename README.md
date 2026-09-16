# Kochbuch

## Setup

### Environment variables

You have to provide environment variables to Docker. Here's how to do it:

1. Next to this `README.md` file, create a file named `.env`
3. Open it with an editor and copy this into it:
    ```
    HOSTNAME=
    ```
4. Fill in the values right after the `=`. Here's what they mean:
    - `HOSTNAME`: Where your cloud will be reachable online, e.g. `abc.com`, `abc.def.com` or `abc.com/def`

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
    ├─ README.md
    └─ ...
    ```

> [!NOTE]  
> The content of `kochbuch_pw_admin` will be the password you use when first logging in as user `admin`.
> [!IMPORTANT]  
> The file names must exactly match the respective file name. They must not have any file ending!