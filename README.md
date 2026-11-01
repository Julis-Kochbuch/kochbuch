# Kochbuch

## Setup

1. Install docker
2. Run
    ```bash
    docker run --rm -it --mount type=bind,source=.,target=/install ghcr.io/Julis-Kochbuch/kochbuch-installer:latest
    ```

## Start the whole thing

Once you've completed the setup, you can start the entire application by doing

```bash
docker compose up -d
```
